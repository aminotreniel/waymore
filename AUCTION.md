# Timed-auction exercise

The dealer auction flow uses the linked Supabase project. The original marketing,
seller, messaging, purchases, and general admin screens are still design prototypes.
No payment or completed sale is created by this exercise.

## Run

```sh
npm install
npm run dev
```

Open `/dealer` and choose one of the three demo dealer buttons. Use **Switch account**
in the top bar to return to the chooser. Password entry is hidden in demo mode;
the server signs into the selected test account and returns its Supabase session.
The standard login form is retained behind the feature flag. Set both
`NEXT_PUBLIC_DEMO_LOGIN=false` and `WAYMORE_DEMO_LOGIN=false` to restore it.
`WAYMORE_DEMO_ACCOUNTS` is server-only and contains only test-account credentials.
Anyone who can access a demo-enabled deployment can enter these accounts, including
the demo host, so leave this feature off for production.

Configuration lives in ignored `.env.local`; `.env.example` documents
the two public variables. A production Next.js build needs these variables at build
time. No service-role key is shipped to the browser or saved in the app environment.

Three confirmed Supabase Auth test accounts were provisioned. Their generated
passwords are in ignored `work/demo-accounts.json` (file mode 0600). Dealer 1 is also
a demo administrator. Use different browser profiles/private windows for different
accounts; tabs in one browser profile share the same authentication session.

## Five-minute walkthrough

1. Sign in as dealer 1 in one window and dealer 2 in another.
2. Open the same vehicle. With dealer 1, use **Set timer: 60s** before the first bid.
3. Submit the opening bid. Both windows update; the deadline gains 90 seconds.
4. Bid another $100 from dealer 2. Dealer 1 sees that they have been outbid.
5. Refresh either window. The bid history and deadline remain intact.
6. In the final minute, bid again to demonstrate a second extension.
7. Stop bidding. New bids are rejected at the database deadline. The closing worker
   runs every five seconds; the screen briefly says “Finalizing…” until it stores
   the final high bidder and outcome.
8. After closing, dealer 1 can start a new 60s or 180s round. Previous rounds and
   their history stay in the database and in My Bids. Vehicle detail links open
   the latest round, so inspect previous full histories via `auction_snapshot`.

The test suite uses its own temporary records and removes only those records.
Browser walkthrough bids on seeded vehicles remain as demonstration history.

## Data and guarantees

- `auction_sellers` and `auction_vehicles`: stable IDs, seller linkage, vehicle
  details, reserve. Existing frontend vehicle/dealer IDs are preserved.
- `auction_dealers`, `dealer_memberships`, `auction_admins`: identity and
  authorization stored in trusted tables, never self-assigned by browser metadata.
- `auction_events` and `auctions`: event linkage, one open auction per vehicle,
  independent deadlines, increments, extensions, current high bid, stored winner.
  The row holds no dealer identity: who leads and who won are read back from the
  bid ledger, so nothing a viewer can read names another dealer.
- `auction_bids`: accepted bid ledger, integer cents, exact database acceptance
  timestamp, sequence within the auction, caller-scoped idempotency key. Failed
  attempts are not accepted bids and do not enter this ledger.
- `auction_outcomes`: one durable result per closed auction linking seller,
  vehicle, event, dealer and bid, ready for a later offer/negotiation workflow.

`place_auction_bid` locks the auction row with `FOR UPDATE`. Authentication,
minimum bid validation, the accepted bid insert, leading bid update, and extension
are one transaction. An exception rolls back everything. Every writer locks the
same row; different vehicles can proceed independently.

The deadline check uses `clock_timestamp()` AFTER obtaining the lock, not the
transaction start timestamp. A new bid is accepted only while `opens_at <= time <
ends_at`. The acceptance order is database serialization order, not the timestamp
of a dealer's click or a claimed client timestamp. Equal concurrent bids result
in one acceptance and a minimum-bid rejection for the other request.

The dealer already holding the high bid is refused under the same row lock: a
dealer cannot raise the price they owe by bidding against themselves, which is
otherwise easy to do by retrying after an uncertain response.

A previously accepted idempotency key returns its original bid, including after
closure. The same key cannot change the amount. The UI retains an uncertain
submission in localStorage and retries that same request rather than inventing a
new bid. It never queues bids offline. This protects lost-response retries; it does
not deduplicate two independently created, intentional requests with different IDs.

An accepted bid with <=60 seconds remaining adds 90 seconds to the existing
closing time, in the bid transaction. There is no extension count limit. A
scheduler calls `close_due_auctions` every five seconds using the same row lock;
`SKIP LOCKED` allows a busy auction to be handled next pass. No new bids can be
accepted after the deadline even if the scheduler is delayed. The high bid is
stored even when the reserve is not met; `result` distinguishes `awaiting_seller`,
`reserve_not_met`, and `no_bids`. The winner is the auction high bidder, not a
completed purchase.

## Access and real-time behavior

RLS is enabled on every new table. No authenticated INSERT/UPDATE/DELETE policies
exist for bid/auction tables. Restricted SECURITY DEFINER functions use an empty
search path and fully qualified references. They derive identity from `auth.uid()`
and membership tables. The closing worker cannot be called by a dealer. Demo
countdown/new-round controls require an administrator membership checked in SQL.

Dealers read only their own raw bids. `auction_snapshot` returns paginated history
with stable anonymous dealer labels; requests do not reveal account emails or
contact details. The auction row carries no dealer identifier at all: the API adds
`high_is_mine` and `won_by_me`, computed server-side against the caller's own
membership, so a viewer learns whether the leading bid is theirs without learning
whose it is otherwise. This also keeps the Realtime payload safe, since Realtime
ships the whole row. Without it, a dealer could read the leading dealer id, match
it against the top of the anonymised history, and unmask the bidder labels.

Supabase Realtime broadcasts committed auction-row changes to authorized viewers.
The client re-reads database state on changes, focus, reconnect and every five
seconds. Realtime is a notification, not the source of truth. A server clock sample
plus monotonic elapsed browser time drives the displayed timer. Client display
accuracy is approximate due to latency; the database decides acceptance.

## Validation

```sh
npm run typecheck
npm run lint
npm run build
npx tsx --env-file=.env.local scripts/test-auctions.ts
```

The integration script needs authenticated CLI management access and the local
test-account file. It gets a service key in memory for isolated fixture setup and
cleanup, then exercises bidding as ordinary authenticated users. It tests
simultaneous bids (including 100 requests across three identities), duplicate
requests, minimum increments, invalid amounts, direct write denial, privileged
function denial, exact extensions, late bids, retry after deadline, unattended
Cron closure, one-time outcomes, no bids, reserve handling, session restoration,
delivery of a Realtime event to another authenticated viewer, refusal of a
self-outbid, absence of any dealer identifier in the RPC payload and in a direct
table read, and that a stored outcome names the dealer who actually placed the
winning bid.

100 requests across three test identities is NOT a capacity claim for 100 dealers.

## Auction lab

`/dealer/lab`, administrators only, enabled with `WAYMORE_LAB=true` and a
server-only `SUPABASE_SECRET_KEY`. One button per requirement, plus a run-all.

Each scenario runs against the live database using real authenticated dealer
sessions, not the service key. The secret key is used only to create and delete
the run's own seller, vehicles, event and auctions, and to move a deadline,
which no dealer can do. Every run tears its fixtures down afterwards, so the
seeded demo data is never touched.

The simultaneous-bidder scenario creates one real Supabase account per dealer,
up to 100, and fires them at a single auction in the same instant. It runs twice:
once with every dealer bidding the identical amount, where exactly one can win,
and once with escalating amounts, where it checks the accepted bids form a
strictly increasing, gap-free ledger and that the header agrees with it. It
reports accepted, rejected with a reason, dropped, and the latency spread.

This is the difference between "100 requests from 3 accounts" and 100
independent dealer sessions. Use the lab's numbers, not the integration
script's, when talking about concurrency.

## Before a real weekly auction

Load test 100+ independent dealer sessions, multiple vehicles, high bid rates and
reconnect storms. Measure lock wait time, bid acceptance latency, Realtime lag,
and scheduler delay. Current lobby refresh fetches all demo auctions/vehicles and
latest own bids; paginate and scope subscriptions before growing the dataset.

Add monitoring/alerts for failed or delayed cron runs, deadlocks, bid errors and
Realtime outages; define bounded lock/statement timeouts and retry behavior.
Enforce gateway rate limits and abuse controls, formal dealer approval, MFA for
admins, tighter session controls and security review. Remove demo admin controls.
The demo login endpoint now requires a same-origin browser request and throttles
per caller, but its throttle is per serverless instance and it still mints real
sessions for fixed accounts: it must be removed, not hardened, before production.
Use immutable audit events for operations, backups/PITR and tested recovery.

Connect outcomes to seller-owned accounts and a reviewed offer acceptance state
machine. Use a transactional outbox and idempotent consumers for notifications,
webhooks, payments and third-party systems. No external integrations are called by
this prototype. Confirm reserve visibility, bid withdrawal rules, eligibility,
legal commitments and clock/fairness semantics with Justin before production.

## Migrations and seeds

Migrations are versioned in `supabase/migrations` and were applied with `supabase db
push`. `scripts/seed-auctions.ts` seeds the supplied vehicle fixtures and creates
accounts via the Auth admin API. It does not reset auction history. Keep its
credential file private; don't rerun account provisioning after deleting the file
without reconciling existing test users.

Docker is not required for this hosted demo. The CLI may warn about its optional
local schema cache when Docker is stopped; the migrations still apply. For local
Supabase development, install/start Docker and configure a separate local setup.
