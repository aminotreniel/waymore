# Way More

Way More is a used-vehicle marketplace. Private sellers submit a car, and approved
dealers compete for it in a weekly timed auction. This repository has:

- a **consumer site** and a guided **seller funnel** (`/`, `/sell`)
- three signed-in portals: **seller** (`/seller`), **dealer** (`/dealer`), **admin** (`/admin`)
- a **timed dealer auction** backed by Supabase (PostgreSQL + Auth + Realtime + pg_cron)

Built with Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v4 and
Supabase.

## What is real and what is a prototype

| Area | Status | Where it lives |
|---|---|---|
| Dealer timed auction: bidding, deadlines, anti-sniping, closing, outcomes | **Live backend** (Supabase) | `supabase/migrations`, `src/context/AuctionContext.tsx`, `src/components/auction/` |
| Dealer sign-in, dealer ↔ account membership, admin role | **Live backend** (Supabase Auth + trusted tables) | `dealer_memberships`, `auction_admins`, `src/components/auction/AuctionAccess.tsx` |
| Real-time sync between dealers | **Live** (Supabase Realtime + re-reads from the DB) | `src/context/AuctionContext.tsx` |
| Auction lab (concurrency / timing test harness, admin only) | **Live, demo tooling** | `src/app/dealer/lab`, `src/app/api/lab`, `src/lib/lab/` |
| Seller funnel, seller portal, admin portal, messages, offers, purchases, payouts | **Front-end prototype** on fixture data | `src/app/sell`, `src/app/seller`, `src/app/admin`, `src/lib/data/` |

The seller and admin portals are fully designed and clickable, but they read from
fixtures in `src/lib/data`, not from the database. Nothing they do is saved yet.
[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) explains how they would connect to the
auction tables.

## Quick start

You need **Node 20+**, a **Supabase project** and the **Supabase CLI**.

```bash
npm install
cp .env.example .env.local        # fill in your Supabase URL + publishable key
supabase login
supabase link --project-ref <your-project-ref>
supabase db push                  # applies supabase/migrations
npx tsx --env-file=.env.local scripts/seed-auctions.ts   # vehicles, auctions, 3 demo dealers
npm run dev                       # http://localhost:3000
```

Then open <http://localhost:3000/dealer>. **[docs/SETUP.md](./docs/SETUP.md)** has
the full walkthrough, including the demo-login and auction-lab settings, running the
tests, deployment and troubleshooting.

## Documentation

| Doc | Read it for |
|---|---|
| [docs/SETUP.md](./docs/SETUP.md) | Setting up and running the project from scratch |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Developer handoff: database, where bids are stored, how the high bidder is chosen, sync, server code, demo vs. production |
| [AUCTION.md](./AUCTION.md) | In-depth notes on the auction engine: guarantees, security model, validation, auction lab |
| [docs/FRONTEND.md](./docs/FRONTEND.md) | UI layer: routes, components, design tokens, imagery, fixtures |

## Repository layout

```
supabase/
  migrations/            database schema, RLS policies, SQL functions, cron jobs (run in order)
  config.toml            Supabase CLI config
scripts/
  seed-auctions.ts       seeds dealers, vehicles, an event + auctions, and 3 demo accounts
  test-auctions.ts       integration tests against a real Supabase project
  fetch_images.py        re-downloads the openly licensed placeholder photos
src/
  app/
    (marketing)/         consumer site
    sell/                seller funnel (prototype)
    seller/              seller portal (prototype)
    dealer/              dealer portal: inventory, event, bids = live auction; lab = test harness
    admin/               admin console (prototype)
    api/demo-login/      server route: one-click demo sign-in (demo only)
    api/lab/             server route: auction lab runner (admin only, demo only)
  context/
    AuctionContext.tsx   auction session, lobby data, Realtime subscription, server clock
    SessionContext.tsx   prototype session for the non-auction screens
    SellFlowContext.tsx  seller funnel draft state
  components/
    auction/             sign-in, bid panel, timer
    portal/ ui/ ...      shared UI
  lib/
    auction.ts           auction types + helpers (minimum bid, labels, formatting)
    supabase/client.ts   browser Supabase client (publishable key only)
    lab/                 auction lab scenarios
    data/                fixtures used by the prototype screens
```

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm run start        # serve the production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
```

## Secrets

No keys, passwords or credentials are committed. `.env.local` and `work/` (where the
seed script writes the demo account passwords) are git-ignored. `.env.example` lists
every variable with placeholder values. The browser only ever gets the Supabase
**publishable** key. The secret/service key is optional, server-only, and used only by
the auction lab.
