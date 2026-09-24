# Way More — front end reference

> This is the original front-end README, kept as a reference for the UI layer
> (routes, components, design tokens, imagery). For the project overview and
> setup, start at the root [README](../README.md). For the backend and auction
> engine, see [ARCHITECTURE.md](./ARCHITECTURE.md) and [AUCTION.md](../AUCTION.md).

---

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run fetch:images # re-download the placeholder photography
```

Requires Node 20+.

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 — tokens defined in `src/app/globals.css` |
| Fonts | Poppins (display) + Inter (body), self-hosted via `next/font` |
| Icons | Hand-built SVG set, `src/components/icons` |
| State | React context — no external state library |

No UI kit. Every component in `src/components/ui` is purpose-built for this
design so nothing has to be fought or overridden later.

---

## The four surfaces

**Consumer site** — `/`
`/how-it-works` · `/why-way-more` · `/faqs` · `/about`

**Seller funnel** — `/sell`
Vehicle details → condition → estimate → account → photos → review →
confirmation. Answers live in `SellFlowContext` and survive navigation between
steps. The estimate recalculates live from the answers
(`priceEstimate()` in `src/context/SellFlowContext.tsx`) — a stand-in for the
pricing service, using the same inputs the real model will.

**Seller portal** — `/seller`
Dashboard · My Vehicle · Offers (list + detail with working accept / counter /
decline) · Messages (thread view with the rich in-thread offer card) ·
Payout & Pickup · Account Settings

**Dealer portal** — `/dealer`
Dashboard · This Week's Event · Browse Inventory (search, tabs, multi-facet
filters, sorting) · Vehicle Detail with a working bid dialog · My Bids ·
Purchases · Saved Vehicles · Profile · Help & Support

**Admin portal** — `/admin`
Overview · Approval Queue (approve / reject flows through a live queue) ·
Vehicles · Events · Offers & Sales · Dealers · Sellers · Settings

A floating **Prototype** control sits bottom-right for jumping between the four
surfaces without hunting for URLs. It is a prototype-only affordance — delete
`src/components/portal/DemoSwitcher.tsx` and its mount in `src/app/layout.tsx`
when real auth lands.

---

## Project layout

```
src/
  app/
    (marketing)/       consumer site — shares a header/footer layout
    sell/              seller funnel, wrapped in SellFlowProvider
    seller/            seller portal   ─┐
    dealer/            dealer portal    ├─ all three share PortalShell
    admin/             admin console   ─┘
  components/
    brand/             logo, script mark, dealer monograms, avatars
    ui/                Button, Card, Badge, Field, Modal, Tabs, Accordion,
                       Countdown, Timeline, DataTable primitives…
    icons/             the full SVG icon set
    marketing/         site header/footer and the reusable page sections
    portal/            PortalShell, DataTable, ActivityFeed, OfferCard
    vehicle/           VehicleCard, VehicleGallery
  context/
    SessionContext     stands in for auth — who is signed in, saved vehicles
    SellFlowContext    the funnel's draft-listing state
  lib/
    types.ts           the domain model (Vehicle, Offer, Bid, Event, …)
    format.ts          money / mileage / date / countdown formatting
    images.ts          every photo path in the product, in one file
    data/              the fixtures
```

### Design tokens

All colour, type, elevation and motion tokens live in one `@theme` block at the
top of `src/app/globals.css`. Changing the brand is editing that block — no
component hunts. Tailwind v4 needs no `tailwind.config.js`.

### The demo clock

`src/lib/data/clock.ts` generates every fixture timestamp relative to load time,
so countdowns stay live and "28 minutes ago" stays honest whenever the prototype
is opened. The weekly dealer event always closes on the next Wednesday at
6:00 PM CT.

Because pages are prerendered, any *absolute* rendering of a generated timestamp
would differ between server and client. `src/components/ui/Time.tsx` handles
that correctly — see the note in that file. It becomes an ordinary `<time>`
element once timestamps come from the API.

---

## Imagery

All photography is openly licensed and checked into `public/images`.
Provenance and licensing for every file is recorded in
`public/images/CREDITS.json`; `scripts/fetch_images.py` re-downloads them.

Vehicle photography comes from Wikimedia Commons and is model-accurate — the
2019 Accord really is a 2019 Accord. Lifestyle and marketing shots come from
Unsplash.

**These are placeholders.** Swap in Way More's own photography by replacing the
files, or by editing the paths in `src/lib/images.ts` — no component references
an image path directly.

Two things are deliberately *not* photographic:

- **Dealer logos** are generated monograms (`DealerMark`), because real dealer
  logos are licensed brand assets. Drop in uploaded logos by changing that one
  component.
- **Testimonial portraits** are initials avatars, not stock photos of people.
  Attaching a stranger's face to an invented quote is the kind of thing that
  becomes a problem later. The testimonial copy in
  `src/components/marketing/Sections.tsx` is sample text and should be replaced
  with verified reviews before launch.

---

## What the backend will need to provide

The fixtures in `src/lib/data` are the contract sketch. In rough dependency
order:

1. **Auth and roles** — seller / dealer / admin, with row-level security.
   `SessionContext` is the seam.
2. **Vehicles** — submission, the approval state machine
   (`VehicleStatus` in `src/lib/types.ts`), photo upload to storage.
3. **Events** — the weekly window, which vehicles are in it, open/close jobs.
4. **Bids** — placement, minimum increments, automatic bidding, outbid
   notifications.
5. **Offers** — conversion from top bids at close, accept / counter / decline,
   expiry.
6. **Messaging** — threads scoped to a vehicle, with sellers' contact details
   never exposed to dealers.
7. **Payout & pickup** — document upload, scheduling, payment release.
8. **Pricing service** — replaces `priceEstimate()`.

### Known gaps (deliberate, for the next pass)

- No data persists — refreshing resets everything.
- Photo upload fills a slot with a sample image rather than opening a file
  picker.
- Search, filtering and sorting run client-side over the full fixture set;
  they will need to move server-side with pagination.
- No real auth, so portal routes are not guarded.
- Copy is written to be plausible, not legally reviewed. Fees, timings and the
  unwind policy are placeholders for the real business rules.

---

## Accessibility & quality

- Semantic landmarks, a skip link, and labelled form controls throughout.
- Keyboard-visible focus rings; `aria-current`, `aria-expanded`, `aria-pressed`
  and `role="tablist"` where they apply.
- `prefers-reduced-motion` is honoured globally.
- Verified: clean `tsc --noEmit`, clean `eslint`, successful production build,
  and all 36 routes render with no console errors, no hydration mismatches and
  no horizontal overflow at both 1440px and 390px.
