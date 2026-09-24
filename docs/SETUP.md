# Setup guide

This guide takes you from a fresh clone to a running Way More with a working auction.
It takes about 15 minutes.

## 1. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20 or newer | `node -v` |
| npm | comes with Node | |
| Supabase account | free tier works | <https://supabase.com> |
| Supabase CLI | recent | macOS: `brew install supabase/tap/supabase`; otherwise see the Supabase docs. It must be on your `PATH` as `supabase`, because the seed script calls it. |
| Docker | *optional* | Only needed if you want a fully local Supabase stack. The hosted setup below doesn't use it. |

## 2. Install

```bash
git clone https://github.com/aminotreniel/waymore.git
cd waymore
npm install
```

## 3. Create a Supabase project

1. Create a new project in the Supabase dashboard.
2. Note the **project ref**. It's the `xxxx` in `https://xxxx.supabase.co`.
3. Under **Project Settings → API Keys**, copy the **publishable** key.
   (On older projects this is the `anon` key.)

## 4. Environment variables

```bash
cp .env.example .env.local
```

| Variable | Required | Exposed to browser | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | yes | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | yes | Publishable / anon key. All access control happens in RLS and SQL functions, so it's safe in the browser. |
| `NEXT_PUBLIC_DEMO_LOGIN` | no | yes | `true` shows the three one-click demo dealer buttons in the UI |
| `WAYMORE_DEMO_LOGIN` | no | **no** | `true` enables the `/api/demo-login` server route that the buttons call |
| `WAYMORE_DEMO_ACCOUNTS` | no | **no** | JSON array of the three demo accounts, `[{"email":"…","password":"…"}, …]` (see step 7) |
| `WAYMORE_LAB` | no | **no** | `true` enables the admin-only auction lab at `/dealer/lab` |
| `SUPABASE_SECRET_KEY` | only for the lab | **no** | Server-only secret/service key. The lab uses it only to create and delete its own test fixtures. Never prefix it with `NEXT_PUBLIC_`. |

Next.js inlines `NEXT_PUBLIC_*` values at **build** time, so set them before
`npm run build` or before deploying.

## 5. Apply the database schema

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

This applies every file in `supabase/migrations/`, in order:

| Migration | What it does |
|---|---|
| `…000100_auction_engine.sql` | Tables, indexes, RLS policies, bid/close/snapshot/lobby functions, Realtime publication, **pg_cron** closing job (every 5 s) |
| `…000200_demo_countdown.sql` | Admin-only "set timer" control for demos |
| `…000300_round_history.sql` | Keeps previous auction rounds visible |
| `…000400_consistent_snapshot.sql` | Makes auction header and bid history one consistent read |
| `…000500_bidder_privacy_and_bid_rules.sql` | Removes dealer identity from the auction row, adds the self-outbid guard, prunes cron history |
| `…000600_hide_lab_fixtures.sql` | Keeps auction-lab test data out of the dealer inventory |

To check it worked, open the dashboard. **Database → Extensions** should show
`pg_cron` enabled, and running `select jobname, schedule from cron.job;` in the SQL
editor should list `waymore-close-auctions`.

## 6. Seed demo data

```bash
npx tsx --env-file=.env.local scripts/seed-auctions.ts
```

The script:

- upserts three dealers (Dealer Kia, ABC Motors, Gateway Ford) and every listed
  vehicle from the fixtures
- creates one event with a 24-hour auction per vehicle, but only if no auctions exist
  yet
- creates three confirmed Supabase Auth users (`dealer1…3@waymore-demo.example`),
  links each one to a dealer, and makes **dealer 1 an admin**
- writes their generated passwords to `work/demo-accounts.json` (git-ignored, mode
  0600)

The script gets a service key **in memory** from your logged-in Supabase CLI. It never
prints or saves that key. You can run it again safely. It won't recreate accounts
while `work/demo-accounts.json` exists.

## 7. Choose how to sign in

**Option A: normal sign-in (default).** Leave both demo flags `false`. Go to
`/dealer` and sign in with an email and password from `work/demo-accounts.json`.

**Option B: one-click demo buttons.** In `.env.local`:

```bash
NEXT_PUBLIC_DEMO_LOGIN=true
WAYMORE_DEMO_LOGIN=true
WAYMORE_DEMO_ACCOUNTS=[{"email":"dealer1@waymore-demo.example","password":"…"},…]
```

To generate the value: `echo "WAYMORE_DEMO_ACCOUNTS=$(jq -c 'map({email,password})' work/demo-accounts.json)"`.
The passwords stay on the server. The route signs in and returns only a session.
Anyone who can reach a demo-enabled deployment can use these accounts, so keep it
off anywhere public.

## 8. Run

```bash
npm run dev     # http://localhost:3000
```

| URL | What you'll see |
|---|---|
| `/` | consumer site |
| `/sell` | seller funnel (prototype) |
| `/seller` | seller portal (prototype) |
| `/dealer` | dealer portal: sign in here; live auction |
| `/dealer/inventory` | vehicles in the auction, then a vehicle detail page with the live bid panel |
| `/dealer/bids` | the signed-in dealer's own bids |
| `/dealer/lab` | auction lab (admin + `WAYMORE_LAB=true`) |
| `/admin` | admin console (prototype) |

**See two dealers bid against each other:** open `/dealer` in two separate browser
profiles or private windows, since tabs in the same profile share one session. Sign
in as dealer 1 and dealer 2, then open the same vehicle. As dealer 1 (the admin), use
**Set timer: 60s** before the first bid, then bid from both windows. [AUCTION.md](../AUCTION.md)
has the full five-minute walkthrough.

Seeded auctions close after 24 hours. After that, dealer 1 can start a new 60 s or
180 s round from the vehicle page. Earlier rounds and their bids stay in the database.

## 9. Auction lab (optional)

```bash
WAYMORE_LAB=true
SUPABASE_SECRET_KEY=<secret key>   # supabase projects api-keys --project-ref <ref> --reveal -o json
```

Sign in as dealer 1 and open **Auction Lab** in the dealer sidebar. It runs each
auction requirement as a scenario against the real database, using real
authenticated dealer sessions. That includes up to 100 independent dealer accounts
bidding in the same instant. It creates and removes its own `lab_*` fixtures.

## 10. Checks and tests

```bash
npm run typecheck
npm run lint
npm run build
npx tsx --env-file=.env.local scripts/test-auctions.ts   # needs step 5–6 done and a logged-in Supabase CLI
```

The integration script builds temporary auctions and removes them afterwards. It
checks simultaneous bids, idempotent retries, minimum increments, direct-write
denial, anti-sniping extensions, late bids, cron closing, reserve handling,
Realtime delivery and bidder privacy.

## 11. Deploying (e.g. Vercel)

1. Import the repo into Vercel.
2. Add the environment variables from step 4 in the project settings. Leave the demo
   and lab flags off unless this is a private demo.
3. Deploy. No other backend has to be deployed: the database, the auth, and the
   closing job all run inside Supabase.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| "An approved dealer account is required." | The signed-in user has no row in `dealer_memberships`. Run the seed, or insert a membership. |
| Timer hits zero but the auction never closes | `pg_cron` job missing or failing. Check `cron.job` and `cron.job_run_details`. |
| Other dealer's bids only show up after a few seconds | Realtime not connected. The 5-second poll is the fallback. Check that `auctions` is in the `supabase_realtime` publication. |
| Seed fails with "No service key available" | Run `supabase login` first. The seed script reads the key through the CLI. |
| Demo buttons missing | `NEXT_PUBLIC_DEMO_LOGIN` wasn't `true` at build/dev start. Restart `npm run dev`. |
| "Demo accounts are not configured." | `WAYMORE_DEMO_ACCOUNTS` is empty or isn't valid JSON. |
| Lab says it's disabled | `WAYMORE_LAB=true` is not set, or you aren't signed in as the admin dealer. |
