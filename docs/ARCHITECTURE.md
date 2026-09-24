# Architecture & handoff notes

This is the overview for a developer taking over Way More. It covers how the system
fits together, where the data lives, and what I'd change before running a real weekly
auction. [AUCTION.md](../AUCTION.md) has the deeper engine notes.

## System overview

```
 Browser (Next.js client components)
   │  supabase-js with the publishable key + the user's JWT
   │
   ├── RPC ──────────────▶  Postgres functions (SECURITY DEFINER)
   │                         place_auction_bid · auction_lobby · auction_snapshot
   │                         start_demo_auction · prepare_demo_countdown
   ├── Realtime ◀────────── committed changes to public.auctions
   │
   └── fetch ────────────▶  Next.js route handlers (Node runtime, server-only env)
                             /api/demo-login   demo sign-in (demo only)
                             /api/lab          auction lab runner (admin only)

 Supabase
   Auth            dealer accounts (email + password)
   Postgres        all auction state + rules; RLS on every table
   pg_cron         close_due_auctions() every 5 seconds
   Realtime        broadcasts auction row changes
```

The main design choice: **the database is the auction engine.** Every rule that
matters sits inside one Postgres transaction guarded by a row lock: who may bid, the
minimum bid, whether the deadline has passed, the anti-sniping extension, and who the
winner is. The Next.js app displays that state and sends bid requests. It can't
change an outcome. No application server sits between the browser and the auction
rules that could get out of sync with them.

## Database

All schema lives in `supabase/migrations/`. Apply the files in order. Money is always
stored as **integer cents** (`bigint`).

| Table | Purpose | Key columns |
|---|---|---|
| `auction_dealers` | Dealerships | `id`, `name`, `bidder_label` (anonymous label shown to other dealers), `active` |
| `dealer_memberships` | Links a Supabase Auth user to a dealer. Assigned by the server, never by the client. | `user_id` → `auth.users`, `dealer_id` |
| `auction_admins` | Which Auth users are administrators | `user_id` |
| `auction_sellers` | Seller identity the vehicle belongs to (stub for the seller account) | `id` |
| `auction_vehicles` | Vehicles that can be auctioned | `id`, `seller_id`, `title`, `reserve_cents`, `details` (jsonb: the full vehicle for the UI) |
| `auction_events` | A weekly event that groups auctions | `id`, `name` |
| `auctions` | One auction round for one vehicle. **This row is locked for every bid.** | `opens_at`, `ends_at`, `status`, `opening_bid_cents`, `increment_cents`, `reserve_cents`, `extension_window_seconds` (60), `extension_seconds` (90), `extension_count`, `high_bid_id`, `high_bid_cents`, `bid_count`, `version`, `winning_bid_id`, `result`, `closed_at` |
| `auction_bids` | **The bid ledger.** Only accepted bids are written here, and a bid is never updated or deleted. | `auction_id`, `dealer_id`, `amount_cents`, `accepted_at` (DB clock), `sequence` (1, 2, 3… per auction), `request_id` (idempotency key) |
| `auction_outcomes` | One row per closed auction, the input to the future offer/sale workflow | `auction_id`, `vehicle_id`, `seller_id`, `event_id`, `high_bid_id`, `dealer_id`, `amount_cents`, `result` |

Important constraints:

- `one_open_auction_per_vehicle`: a partial unique index, so a vehicle can have only
  one open round at a time. Earlier rounds are kept.
- `unique(auction_id, sequence)`: the ledger order has no gaps or duplicates.
- `unique(auction_id, dealer_id, request_id)`: a retried request can't create a
  second bid.
- Composite foreign keys `(id, high_bid_id)` and `(id, winning_bid_id)` →
  `auction_bids(auction_id, id)`: the high and winning bid must be real bids **in the
  same auction**.
- `auctions_due`: a partial index on `ends_at where status='open'` so the closer's
  scan stays cheap.

## Where bids are stored

Every accepted bid is one row in **`public.auction_bids`**. Rejected attempts (too
low, auction closed, self-outbid, unauthorised) raise an exception and roll back, so
they never reach the ledger. The `auctions` row keeps a denormalised pointer to the
current leader (`high_bid_id`, `high_bid_cents`) so the UI and Realtime don't have to
scan the ledger.

## How the high bidder is determined

It all happens in `place_auction_bid(auction_id, amount_cents, request_id)`, in a
single transaction:

1. Work out the caller's dealer from `auth.uid()` → `dealer_memberships`. The client
   never says who it is.
2. `SELECT … FOR UPDATE` the auction row. Concurrent bids on the same vehicle queue
   here. Bids on other vehicles aren't affected.
3. If this `request_id` was already accepted, return the original bid. This is a
   safe retry.
4. Read `clock_timestamp()` **after** getting the lock. The bid is accepted only if
   `opens_at ≤ now < ends_at`.
5. Reject the bid if this dealer already holds the high bid.
6. Minimum = `high_bid_cents + increment_cents`, or `opening_bid_cents` if there are
   no bids yet. Reject anything below it.
7. Insert the bid with `sequence = bid_count + 1`, then point `high_bid_id` /
   `high_bid_cents` at it.
8. If 60 seconds or less remained, extend `ends_at` by 90 seconds. This is the
   anti-sniping rule.

So **the high bidder is whoever placed the last bid the database accepted**. The
order comes from the database's serialization, not from client click time. When two
dealers submit the same amount at the same moment, one is accepted and the other gets
"Bid too low".

**Closing:** `pg_cron` runs `close_due_auctions()` every 5 seconds. It locks due
auctions with `FOR UPDATE SKIP LOCKED` and checks `ends_at` again, because a last
second bid may have just extended it. It then sets `status='closed'`,
`winning_bid_id = high_bid_id`, and a `result` of `awaiting_seller`,
`reserve_not_met` or `no_bids`, and writes one row to `auction_outcomes`. The winning
dealer is read back from the ledger. Bids are refused at the deadline even if cron
runs late, because the deadline check is in the bid function.

**A high bid is not a sale.** `awaiting_seller` means the result is ready for the
seller to act on. That offer/acceptance step isn't built yet.

## Security model

- RLS is enabled on every table. Authenticated users have **no** insert, update or
  delete policies on auction data. The only way to write is through the SQL
  functions.
- The functions are `SECURITY DEFINER` with `search_path=''` and fully qualified
  names. They take identity only from `auth.uid()` and check membership in trusted
  tables.
- `close_due_auctions()` can only be run by `service_role` and cron. The demo
  controls (`start_demo_auction`, `prepare_demo_countdown`) check `is_auction_admin()`
  inside SQL.
- **Bidder privacy:** the `auctions` row holds no dealer identity. Because Realtime
  sends the whole row, the dealer columns were dropped in migration 000500. Clients
  get `high_is_mine` / `won_by_me` booleans from `auction_view()` instead. History
  uses anonymous `bidder_label`s. Dealers can read only their own raw bids.
- The browser holds only the publishable key. The secret key is optional and used
  only by the server-side lab route.

## How the sides stay in sync

**Dealer ↔ dealer (live).** `src/context/AuctionContext.tsx` does this:

1. It loads everything in one RPC, `auction_lobby()`: server time, auctions, vehicles
   and the dealer's latest bids.
2. It subscribes to `postgres_changes` on `public.auctions` through Supabase Realtime.
   Every accepted bid bumps `version` and changes the row, and each change makes the
   client **re-read** from the database. Realtime is used as a notification, not as
   the source of truth.
3. It also re-reads every 5 seconds, when the tab regains focus, and when the browser
   comes back online. That covers missed Realtime messages.
4. The countdown uses a server clock sample plus monotonic browser time, so a wrong
   local clock doesn't matter. The database still decides whether a bid is on time.

The vehicle bid panel (`AuctionBidPanel.tsx`) loads the paginated, anonymised history
with `auction_snapshot()`. That one consistent read holds a shared lock. Before
sending a bid, the panel saves it (UUID + amount) to `localStorage`, so after an
unclear network failure it resends **the same** request instead of creating a new
bid.

**Seller and admin (not wired yet).** The seller and admin portals are front-end
prototypes that read fixtures from `src/lib/data`. The production plan:

- Seller portal: read `auction_outcomes` and auction status for the seller's own
  vehicles, through a seller-scoped RLS policy on `auction_vehicles.seller_id` linked
  to a real seller account. Subscribe to the same Realtime row for a live "current
  high bid" view. Other dealers' identities stay hidden.
- Admin portal: move the approval queue, events and dealers screens onto the real
  tables through admin-only RPCs. Outcomes feed the offers screen.
- Everything after the auction (seller accepts or counters, dealer notified, pickup,
  payment) goes through an offer state machine driven by `auction_outcomes`, with a
  transactional outbox for emails, SMS and webhooks.

## Server-side code

| File | What it does |
|---|---|
| `supabase/migrations/*.sql` | All tables, policies, functions and cron jobs. This is the main backend. |
| `src/app/api/demo-login/route.ts` | Demo only. Signs into one of three fixed test accounts on the server and returns a session. Requires same-origin requests and throttles each instance. **Delete it for production.** |
| `src/app/api/lab/route.ts` | Admin-only auction lab API. Checks the caller's JWT with `is_auction_admin()`, then runs scenarios from `src/lib/lab/runner.ts`. |
| `src/lib/lab/runner.ts` | Scenario runner. Creates `lab_*` fixtures with the secret key, then bids as real authenticated dealer sessions (up to 100). |
| `scripts/seed-auctions.ts` | Seeds dealers, vehicles, an event with auctions, and the demo accounts. |
| `scripts/test-auctions.ts` | Integration tests against a real project. |

The project has no webhooks or third-party integrations yet. No payments, email or
SMS are sent.

## Demo / prototype logic vs. production

| Today (demo) | For production |
|---|---|
| One-click demo login with fixed accounts (`/api/demo-login`) | Remove it. Real dealer onboarding with approval, email verification, MFA for admins, session policies |
| Dealer 1 is both a bidder and the admin; admin demo controls ("Set timer", "New round") are in the dealer UI | Separate admin accounts and a real admin console; no timer manipulation in production |
| Seller and admin portals run on fixtures | Wire them to the tables as described above, with seller-scoped RLS |
| `auction_sellers` is a stub id | Real seller accounts linked to `auth.users` |
| Vehicle data is a `details` jsonb copied from fixtures | Normalised vehicle tables, photo storage, approval state machine |
| `auction_lobby()` returns all auctions and vehicles in one call | Paginate, scope to the current event, narrower Realtime subscriptions |
| Closer runs every 5 s via pg_cron | Keep it, add monitoring and alerts for late or failed runs; maybe a dedicated worker at larger scale |
| Throttling is per serverless instance | Rate limits at the gateway or edge, with a shared store |
| Rule settings (increment $100, 60 s window, +90 s, unlimited extensions) are column defaults | Confirm business rules (reserve visibility, extension cap, bid retraction, eligibility), then make them per-event settings |
| No outbid notifications, offers, payments | Transactional outbox + idempotent workers for notifications, offers, payments |
| Concurrency checked with the lab (100 real sessions on one auction) | Load test the full weekly event: many vehicles, 100+ dealers, reconnect storms. Measure lock wait, bid latency and Realtime lag. Add lock and statement timeouts |
| No audit trail beyond the ledger | Immutable audit events for admin actions, backups/PITR, tested restores |
