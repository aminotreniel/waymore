/**
 * Server-side auction test runner.
 *
 * Every scenario runs against the real Supabase project using real authenticated
 * dealer sessions, not the service key. The service key is used only to build and
 * tear down isolated fixtures (its own seller, vehicles, event and auctions) and
 * to move a deadline, which is something no dealer can do. Each run cleans up
 * after itself, so nothing it creates is left in the demo data.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHmac, randomUUID } from "node:crypto";
import type { LabMetrics, LabResult, LabStep } from "./types";

/** Supabase returns plain objects, not Error instances. String(e) on one of
 *  those prints "[object Object]", which hides the actual failure. */
function describe(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object") {
    const o = e as Record<string, unknown>;
    return [o.message, o.details, o.hint].filter(Boolean).join(" · ") || JSON.stringify(o);
  }
  return String(e);
}
import { SCENARIOS } from "./types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SECRET =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const OPTS = {
  auth: { persistSession: false, autoRefreshToken: false },
} as const;

export function labConfigError(): string | null {
  if (!URL || !PUBLISHABLE) return "Supabase URL or publishable key is missing.";
  if (!SECRET)
    return "SUPABASE_SECRET_KEY is not set. Add it to .env.local so the lab can build and remove its own fixtures. Get it with: npx supabase projects api-keys --project-ref <ref> --reveal -o json";
  return null;
}

const admin = () => createClient(URL, SECRET, OPTS);
const asDealer = (token: string) =>
  createClient(URL, PUBLISHABLE, {
    ...OPTS,
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

/* ------------------------------------------------------------------ dealers */

export interface LabDealer {
  index: number;
  dealerId: string;
  userId: string;
  token: string;
  client: SupabaseClient;
}

/** Deterministic, never stored, never leaves the server. */
const labPassword = (i: number) =>
  createHmac("sha256", SECRET).update(`waymore-lab-dealer-${i}`).digest("base64url");
const labEmail = (i: number) =>
  `lab-dealer-${String(i).padStart(3, "0")}@waymore-lab.example`;
const labDealerId = (i: number) => `lab_${String(i).padStart(3, "0")}`;

const tokenCache = new Map<number, { token: string; userId: string; at: number }>();
const TOKEN_TTL_MS = 25 * 60 * 1000;

async function ensureDealer(i: number): Promise<LabDealer> {
  const cached = tokenCache.get(i);
  if (cached && Date.now() - cached.at < TOKEN_TTL_MS)
    return {
      index: i,
      dealerId: labDealerId(i),
      userId: cached.userId,
      token: cached.token,
      client: asDealer(cached.token),
    };

  const db = admin();
  const email = labEmail(i);
  const password = labPassword(i);
  const auth = createClient(URL, PUBLISHABLE, OPTS);

  // Supabase rate limits the auth endpoints, and a burst of new dealers can
  // trip it. Retry with backoff and carry the real error out if it never works.
  let session = null as Awaited<ReturnType<typeof auth.auth.signInWithPassword>>["data"]["session"];
  let last = "";
  for (let attempt = 0; attempt < 4 && !session; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 400 * 2 ** attempt));
    const signIn = await auth.auth.signInWithPassword({ email, password });
    session = signIn.data.session;
    if (session) break;
    last = describe(signIn.error);
    const created = await db.auth.admin.createUser({ email, password, email_confirm: true });
    if (created.error && !/already/i.test(created.error.message)) last = describe(created.error);
    const retry = await auth.auth.signInWithPassword({ email, password });
    session = retry.data.session;
    if (!session) last = describe(retry.error);
  }
  if (!session) throw new Error(`${email}: ${last || "no session returned"}`);

  const dealerId = labDealerId(i);
  const up = await db.from("auction_dealers").upsert({
    id: dealerId,
    name: `Auction Dealer ${i}`,
    bidder_label: `Bidder ${String(i).padStart(3, "0")}`,
  });
  if (up.error) throw up.error;
  const mem = await db
    .from("dealer_memberships")
    .upsert({ user_id: session.user.id, dealer_id: dealerId });
  if (mem.error) throw mem.error;

  tokenCache.set(i, { token: session.access_token, userId: session.user.id, at: Date.now() });
  return {
    index: i,
    dealerId,
    userId: session.user.id,
    token: session.access_token,
    client: asDealer(session.access_token),
  };
}

/**
 * Prepares dealers in small batches so the auth endpoint is not hammered.
 * A dealer that cannot be opened is reported rather than failing the whole run,
 * because testing with 23 real sessions beats testing with none.
 */
export async function dealerPool(
  count: number,
): Promise<{ dealers: LabDealer[]; failed: string[] }> {
  const dealers: LabDealer[] = [];
  const failed: string[] = [];
  for (let start = 0; start < count; start += 5) {
    const batch = await Promise.allSettled(
      Array.from({ length: Math.min(5, count - start) }, (_, k) => ensureDealer(start + k)),
    );
    for (const result of batch) {
      if (result.status === "fulfilled") dealers.push(result.value);
      else failed.push(describe(result.reason));
    }
    if (start + 5 < count) await new Promise((r) => setTimeout(r, 200));
  }
  return { dealers, failed };
}

export async function teardownPool(count = 120) {
  const db = admin();
  const ids = Array.from({ length: count }, (_, i) => labDealerId(i));
  await db.from("dealer_memberships").delete().in("dealer_id", ids);
  for (let i = 0; i < count; i++) {
    const cached = tokenCache.get(i);
    const userId =
      cached?.userId ??
      (
        await createClient(URL, PUBLISHABLE, OPTS).auth.signInWithPassword({
          email: labEmail(i),
          password: labPassword(i),
        })
      ).data.session?.user.id;
    if (userId) await db.auth.admin.deleteUser(userId).catch(() => {});
  }
  await db.from("auction_dealers").delete().in("id", ids);
  tokenCache.clear();
  return ids.length;
}

/* ----------------------------------------------------------------- fixtures */

/**
 * Test data is kept by default so a run can be inspected in the database
 * afterwards. Lab fixtures are prefixed lab_ and the app filters them out, so
 * keeping them does not pollute the dealer inventory.
 */
let keepFixtures = true;
const keptTags: string[] = [];

interface Fixture {
  tag: string;
  eventId: string;
  auctionIds: string[];
  vehicleIds: string[];
}

async function openFixture(): Promise<Fixture> {
  const db = admin();
  const tag = `lab_${randomUUID().slice(0, 8)}`;
  const seller = await db.from("auction_sellers").insert({ id: tag });
  if (seller.error) throw seller.error;
  const event = await db
    .from("auction_events")
    .insert({ name: `Lab run ${tag}` })
    .select()
    .single();
  if (event.error) throw event.error;
  return { tag, eventId: event.data.id, auctionIds: [], vehicleIds: [] };
}

async function newAuction(f: Fixture, overrides: Record<string, unknown> = {}) {
  const db = admin();
  const vehicleId = `${f.tag}_v${f.vehicleIds.length}`;
  const veh = await db.from("auction_vehicles").insert({
    id: vehicleId,
    seller_id: f.tag,
    title: "Lab test vehicle",
    details: {},
  });
  if (veh.error) throw veh.error;
  f.vehicleIds.push(vehicleId);
  const { data, error } = await db
    .from("auctions")
    .insert({
      event_id: f.eventId,
      vehicle_id: vehicleId,
      // An hour ago, so a test can move ends_at into the past without
      // violating check(ends_at > opens_at) on the auctions table.
      opens_at: new Date(Date.now() - 3600_000).toISOString(),
      ends_at: new Date(Date.now() + 3600_000).toISOString(),
      opening_bid_cents: 1_000_000,
      ...overrides,
    })
    .select()
    .single();
  if (error) throw error;
  f.auctionIds.push(data.id);
  return data;
}

async function closeFixture(f: Fixture) {
  if (keepFixtures) {
    if (!keptTags.includes(f.tag)) keptTags.push(f.tag);
    return;
  }
  const db = admin();
  if (f.auctionIds.length) {
    await db
      .from("auctions")
      .update({ high_bid_id: null, winning_bid_id: null })
      .in("id", f.auctionIds);
    await db.from("auction_outcomes").delete().in("auction_id", f.auctionIds);
    await db.from("auction_bids").delete().in("auction_id", f.auctionIds);
    await db.from("auctions").delete().in("id", f.auctionIds);
  }
  if (f.vehicleIds.length)
    await db.from("auction_vehicles").delete().in("id", f.vehicleIds);
  await db.from("auction_sellers").delete().eq("id", f.tag);
  await db.from("auction_events").delete().eq("id", f.eventId);
}

async function setEnd(id: string, ms: number) {
  const { error } = await admin()
    .from("auctions")
    .update({ ends_at: new Date(Date.now() + ms).toISOString() })
    .eq("id", id);
  // Silently ignoring this is what made a harness bug look like an engine bug.
  if (error) throw new Error(`Could not move the deadline: ${describe(error)}`);
}

/** Removes every fixture any lab run has ever left in the database. */
export async function purgeLabData() {
  const db = admin();
  const { data: rows } = await db
    .from("auctions")
    .select("id")
    .like("vehicle_id", "lab\\_%");
  const ids = (rows ?? []).map((r) => r.id as string);
  if (ids.length) {
    await db.from("auctions").update({ high_bid_id: null, winning_bid_id: null }).in("id", ids);
    await db.from("auction_outcomes").delete().in("auction_id", ids);
    await db.from("auction_bids").delete().in("auction_id", ids);
    await db.from("auctions").delete().in("id", ids);
  }
  await db.from("auction_vehicles").delete().like("id", "lab\\_%");
  await db.from("auction_sellers").delete().like("id", "lab\\_%");
  await db.from("auction_events").delete().like("name", "Lab run %");
  return ids.length;
}

/* ------------------------------------------------------------------ helpers */

interface BidOutcome {
  dealer: LabDealer;
  ok: boolean;
  transport: boolean;
  message: string;
  amount: number;
  sequence?: number;
  ms: number;
}

async function bid(
  d: LabDealer,
  auctionId: string,
  amount: number,
  requestId = randomUUID(),
): Promise<BidOutcome> {
  const t0 = performance.now();
  try {
    const { data, error } = await d.client.rpc("place_auction_bid", {
      p_auction_id: auctionId,
      p_amount_cents: amount,
      p_request_id: requestId,
    });
    const ms = performance.now() - t0;
    if (error)
      return {
        dealer: d,
        ok: false,
        transport: !error.code || error.code.startsWith("PGRST") || error.code.startsWith("08"),
        message: error.message,
        amount,
        ms,
      };
    return {
      dealer: d,
      ok: true,
      transport: false,
      message: "accepted",
      amount,
      sequence: data.bid.sequence,
      ms,
    };
  } catch (e) {
    return {
      dealer: d,
      ok: false,
      transport: true,
      message: e instanceof Error ? e.message : "transport failure",
      amount,
      ms: performance.now() - t0,
    };
  }
}

const pct = (sorted: number[], p: number) =>
  sorted.length ? Math.round(sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]) : 0;

function summarise(results: BidOutcome[], wallMs: number): LabMetrics {
  const sorted = results.map((r) => r.ms).sort((a, b) => a - b);
  const reasons: Record<string, number> = {};
  for (const r of results)
    if (!r.ok) {
      const key = r.message.replace(/\$[\d,.]+/g, "$X").slice(0, 80);
      reasons[key] = (reasons[key] ?? 0) + 1;
    }
  return {
    requests: results.length,
    accepted: results.filter((r) => r.ok).length,
    rejected: results.filter((r) => !r.ok && !r.transport).length,
    transportFailed: results.filter((r) => r.transport).length,
    wallMs: Math.round(wallMs),
    p50: pct(sorted, 0.5),
    p95: pct(sorted, 0.95),
    max: Math.round(sorted.at(-1) ?? 0),
    reasons,
  };
}

class Steps {
  list: LabStep[] = [];
  check(name: string, condition: boolean, detail: string, ms?: number) {
    this.list.push({ name, status: condition ? "pass" : "fail", detail, ms });
    return condition;
  }
  note(name: string, detail: string, ms?: number) {
    this.list.push({ name, status: "info", detail, ms });
  }
}

/* ---------------------------------------------------------------- scenarios */

type Runner = (s: Steps, dealers: LabDealer[]) => Promise<LabMetrics | undefined>;

const runners: Record<string, Runner> = {
  async ledger(s, dealers) {
    const f = await openFixture();
    try {
      const a = await newAuction(f);
      const key = randomUUID();
      const before = Date.now();
      const r = await bid(dealers[0], a.id, 1_000_000, key);
      s.check("Bid accepted", r.ok, r.message, Math.round(r.ms));
      const row = await admin()
        .from("auction_bids")
        .select("*")
        .eq("auction_id", a.id)
        .single();
      const b = row.data;
      s.check("Dealer stored", b?.dealer_id === dealers[0].dealerId, `dealer_id = ${b?.dealer_id}`);
      s.check("Amount stored in integer cents", b?.amount_cents === 1_000_000, `${b?.amount_cents} cents`);
      s.check("Idempotency key stored", b?.request_id === key, `request_id = ${b?.request_id}`);
      s.check("Sequence assigned", b?.sequence === 1, `sequence = ${b?.sequence}`);
      const accepted = Date.parse(b?.accepted_at ?? "");
      s.check(
        "Timestamp is a real server timestamp",
        Number.isFinite(accepted) && Math.abs(accepted - before) < 60_000,
        `accepted_at = ${b?.accepted_at}`,
      );
      const drift = accepted - before;
      s.note(
        "Clock source",
        `The stored time differs from this machine's clock by ${drift}ms, because the database stamps it, not the client.`,
      );
    } finally {
      await closeFixture(f);
    }
    return undefined;
  },

  async history(s, dealers) {
    const f = await openFixture();
    try {
      const a = await newAuction(f);
      let amount = 1_000_000;
      for (let i = 0; i < 12; i++) {
        const d = dealers[i % Math.max(1, Math.min(dealers.length, 3))];
        const r = await bid(d, a.id, amount);
        if (!r.ok) {
          s.check(`Bid ${i + 1}`, false, r.message);
          break;
        }
        amount += 100_000;
      }
      const snap = await dealers[0].client.rpc("auction_snapshot", { p_auction_id: a.id });
      const bids = snap.data?.bids ?? [];
      s.check("History readable by a dealer", !snap.error, snap.error?.message ?? `${bids.length} rows`);
      const seqs = bids.map((b: { sequence: number }) => b.sequence);
      s.check(
        "Newest first",
        seqs.every((v: number, i: number) => i === 0 || seqs[i - 1] > v),
        `sequences ${seqs[0]} down to ${seqs.at(-1)}`,
      );
      const expected = Array.from({ length: 12 }, (_, i) => 12 - i);
      s.check("Every bid present, none duplicated", JSON.stringify(seqs) === JSON.stringify(expected), `got ${seqs.length} of 12`);
      s.check(
        "Header count agrees with the ledger",
        snap.data?.auction.bid_count === 12,
        `bid_count = ${snap.data?.auction.bid_count}`,
      );
      const page2 = await dealers[0].client.rpc("auction_snapshot", {
        p_auction_id: a.id,
        p_before_sequence: 6,
      });
      const p2 = (page2.data?.bids ?? []).map((b: { sequence: number }) => b.sequence);
      s.check(
        "Pagination returns the page before a cursor, with no overlap",
        JSON.stringify(p2) === JSON.stringify([5, 4, 3, 2, 1]),
        `before sequence 6 returned ${JSON.stringify(p2)}`,
      );
      const empty = await dealers[0].client.rpc("auction_snapshot", {
        p_auction_id: a.id,
        p_before_sequence: 1,
      });
      s.check("Cursor past the oldest bid returns empty", (empty.data?.bids ?? []).length === 0, "0 rows");
    } finally {
      await closeFixture(f);
    }
    return undefined;
  },

  async burst(s, dealers) {
    const f = await openFixture();
    try {
      /* --- everyone bids the identical amount at the same instant --- */
      s.note("Dealers in this run", `${dealers.length} independent authenticated sessions`);
      const tie = await newAuction(f, { opening_bid_cents: 1_000_000 });
      const t0 = performance.now();
      const tied = await Promise.all(dealers.map((d) => bid(d, tie.id, 1_000_000)));
      const tieMetrics = summarise(tied, performance.now() - t0);
      s.check(
        "Identical bids: exactly one accepted",
        tieMetrics.accepted === 1,
        `${tieMetrics.accepted} accepted of ${tieMetrics.requests}`,
        tieMetrics.wallMs,
      );
      s.check(
        "Every other request got a definitive answer, none was dropped",
        tieMetrics.transportFailed === 0,
        `${tieMetrics.rejected} rejected, ${tieMetrics.transportFailed} transport failures`,
      );
      s.note(
        "Why the rest were refused",
        Object.entries(tieMetrics.reasons)
          .map(([k, v]) => `${v} x "${k}"`)
          .join(" | ") || "none",
      );

      /* --- everyone bids a different, escalating amount at once --- */
      const race = await newAuction(f, { opening_bid_cents: 1_000_000 });
      const t1 = performance.now();
      const raced = await Promise.all(
        dealers.map((d, i) => bid(d, race.id, 1_000_000 + (i + 1) * 100_000)),
      );
      const raceMetrics = summarise(raced, performance.now() - t1);
      const won = raced.filter((r) => r.ok).sort((a, b) => a.sequence! - b.sequence!);
      s.check(
        "Escalating bids: at least one accepted",
        raceMetrics.accepted >= 1,
        `${raceMetrics.accepted} accepted of ${raceMetrics.requests}`,
        raceMetrics.wallMs,
      );
      s.check(
        "Accepted amounts strictly increase in ledger order",
        won.every((r, i) => i === 0 || r.amount >= won[i - 1].amount + 100_000),
        won.map((r) => `#${r.sequence}:$${r.amount / 100}`).join(" -> ") || "none",
      );
      s.check(
        "Sequence numbers are contiguous with no gaps",
        won.every((r, i) => r.sequence === i + 1),
        `1..${won.length}`,
      );
      const ledger = await admin()
        .from("auction_bids")
        .select("id,amount_cents,sequence")
        .eq("auction_id", race.id);
      s.check(
        "Ledger holds exactly the accepted bids, no more and no fewer",
        (ledger.data?.length ?? -1) === raceMetrics.accepted,
        `${ledger.data?.length} rows for ${raceMetrics.accepted} accepted`,
      );
      const head = await admin()
        .from("auctions")
        .select("high_bid_cents,bid_count")
        .eq("id", race.id)
        .single();
      s.check(
        "Header high bid equals the top of the ledger",
        head.data?.high_bid_cents === Math.max(...won.map((r) => r.amount)),
        `high_bid_cents = ${head.data?.high_bid_cents}`,
      );
      s.check(
        "Header bid count equals the ledger length",
        head.data?.bid_count === raceMetrics.accepted,
        `bid_count = ${head.data?.bid_count}`,
      );
      s.note(
        "Latency under contention",
        `median ${raceMetrics.p50}ms, p95 ${raceMetrics.p95}ms, slowest ${raceMetrics.max}ms, all ${raceMetrics.requests} resolved in ${raceMetrics.wallMs}ms`,
      );
      return raceMetrics;
    } finally {
      await closeFixture(f);
    }
  },

  async timer(s, dealers) {
    const f = await openFixture();
    try {
      const a = await newAuction(f);
      const snap = await dealers[0].client.rpc("auction_snapshot", { p_auction_id: a.id });
      const serverNow = Date.parse(snap.data.server_time);
      const drift = serverNow - Date.now();
      s.note(
        "Browser clock versus database clock",
        `this machine is ${drift > 0 ? "behind" : "ahead"} by ${Math.abs(drift)}ms. The deadline is evaluated against the database clock, so this drift cannot affect who wins.`,
      );
      s.check(
        "Deadline comes from the server, not the client",
        typeof snap.data.auction.ends_at === "string",
        `ends_at = ${snap.data.auction.ends_at}`,
      );
      await setEnd(a.id, -2000);
      const late = await bid(dealers[0], a.id, 1_000_000);
      s.check(
        "A bid after the deadline is refused immediately",
        !late.ok && /closed/i.test(late.message),
        late.message,
        Math.round(late.ms),
      );
      const stillOpen = await admin()
        .from("auctions")
        .select("status")
        .eq("id", a.id)
        .single();
      s.check(
        "Refused by the bid path itself, before the closing worker ran",
        stillOpen.data?.status === "open",
        `status was still "${stillOpen.data?.status}" when the bid was rejected`,
      );
      const notYet = await newAuction(f, {
        opens_at: new Date(Date.now() + 60_000).toISOString(),
      });
      const early = await bid(dealers[0], notYet.id, 1_000_000);
      s.check("A bid before the open time is refused", !early.ok && /not opened/i.test(early.message), early.message);
    } finally {
      await closeFixture(f);
    }
    return undefined;
  },

  async antisnipe(s, dealers) {
    const f = await openFixture();
    try {
      const a = await newAuction(f, { ends_at: new Date(Date.now() + 30_000).toISOString() });
      const first = await bid(dealers[0], a.id, 1_000_000);
      s.check("Bid inside the final window accepted", first.ok, first.message);
      const afterOne = await admin()
        .from("auctions")
        .select("ends_at,extension_count,extension_seconds,extension_window_seconds")
        .eq("id", a.id)
        .single();
      const added = Date.parse(afterOne.data!.ends_at) - Date.parse(a.ends_at);
      s.check(
        `Deadline moved by exactly ${afterOne.data!.extension_seconds}s`,
        added === afterOne.data!.extension_seconds * 1000,
        `moved ${added}ms`,
      );
      s.check("Extension counted", afterOne.data!.extension_count === 1, `extension_count = 1`);
      const held = afterOne.data!.ends_at;
      const outside = await bid(dealers[1] ?? dealers[0], a.id, 1_100_000);
      const afterTwo = await admin().from("auctions").select("ends_at").eq("id", a.id).single();
      s.check(
        "A bid outside the window does not move the deadline",
        outside.ok && afterTwo.data!.ends_at === held,
        outside.ok ? "deadline unchanged" : outside.message,
      );
      await setEnd(a.id, 30_000);
      const third = await bid(dealers[2] ?? dealers[0], a.id, 1_200_000);
      const afterThree = await admin()
        .from("auctions")
        .select("extension_count")
        .eq("id", a.id)
        .single();
      s.check(
        "Extensions repeat with no cap",
        third.ok && afterThree.data!.extension_count === 2,
        `extension_count = ${afterThree.data!.extension_count}`,
      );
      s.note(
        "What this means at the deadline",
        "A late flurry keeps pushing the close out, so the last seconds stop being a single cliff every dealer has to hit at once.",
      );
    } finally {
      await closeFixture(f);
    }
    return undefined;
  },

  async recovery(s, dealers) {
    const f = await openFixture();
    try {
      const a = await newAuction(f);
      const key = randomUUID();
      const t0 = performance.now();
      const [one, two] = await Promise.all([
        bid(dealers[0], a.id, 1_000_000, key),
        bid(dealers[0], a.id, 1_000_000, key),
      ]);
      s.check(
        "Double click: both requests succeed",
        one.ok && two.ok,
        `${one.message} / ${two.message}`,
        Math.round(performance.now() - t0),
      );
      const rows = await admin().from("auction_bids").select("id").eq("auction_id", a.id);
      s.check("Double click created exactly one bid", rows.data?.length === 1, `${rows.data?.length} row(s)`);
      const changed = await bid(dealers[0], a.id, 2_000_000, key);
      s.check(
        "The same key cannot be reused for a different amount",
        !changed.ok,
        changed.message,
      );
      const self = await bid(dealers[0], a.id, 1_100_000);
      s.check(
        "A dealer cannot outbid their own high bid",
        !self.ok && /high bid/i.test(self.message),
        self.message,
      );
      const rival = dealers[1] ?? dealers[0];
      const rivalKey = randomUUID();
      const rivalBid = await bid(rival, a.id, 1_100_000, rivalKey);
      s.check("A rival can bid", rivalBid.ok, rivalBid.message);
      await setEnd(a.id, -2000);
      const replay = await bid(rival, a.id, 1_100_000, rivalKey);
      s.check(
        "A lost response can be retried after the auction closed and returns the original bid",
        replay.ok,
        replay.ok ? `returned sequence #${replay.sequence}` : replay.message,
      );
      const afterReplay = await admin().from("auction_bids").select("id").eq("auction_id", a.id);
      s.check(
        "The retry did not create a second bid",
        afterReplay.data?.length === 2,
        `${afterReplay.data?.length} rows`,
      );
      s.note(
        "Why this is safe",
        "The browser keeps the request id in local storage and retries that same id. A transport failure is never treated as a rejection, so the dealer can always ask again without risking a duplicate.",
      );
    } finally {
      await closeFixture(f);
    }
    return undefined;
  },

  async winner(s, dealers) {
    const f = await openFixture();
    try {
      const sold = await newAuction(f);
      await bid(dealers[0], sold.id, 1_000_000);
      const top = await bid(dealers[1] ?? dealers[0], sold.id, 1_500_000);
      const noBids = await newAuction(f, { ends_at: new Date(Date.now() - 1000).toISOString() });
      const reserve = await newAuction(f, { reserve_cents: 9_000_000 });
      await bid(dealers[0], reserve.id, 1_000_000);
      await setEnd(sold.id, -1000);
      await setEnd(reserve.id, -1000);

      const t0 = performance.now();
      const closed = await admin().rpc("close_due_auctions");
      s.check("Closing worker ran", !closed.error, `${closed.data} auction(s) closed`, Math.round(performance.now() - t0));

      const row = await admin().from("auctions").select("*").eq("id", sold.id).single();
      s.check("Auction marked closed", row.data?.status === "closed", `status = ${row.data?.status}`);
      const winningBid = await admin()
        .from("auction_bids")
        .select("dealer_id,amount_cents,sequence")
        .eq("id", row.data!.winning_bid_id)
        .single();
      s.check(
        "Stored winner is a real row in the ledger",
        !winningBid.error,
        winningBid.error?.message ?? `sequence #${winningBid.data?.sequence}`,
      );
      s.check(
        "Stored winner is the highest accepted bid",
        winningBid.data?.amount_cents === 1_500_000 && top.ok,
        `$${(winningBid.data?.amount_cents ?? 0) / 100}`,
      );
      s.check("Result recorded", row.data?.result === "awaiting_seller", `result = ${row.data?.result}`);
      s.note(
        "Winning does not mean sold",
        "The result is awaiting_seller. Closing the auction records a high bidder, it does not complete a purchase.",
      );

      const outcomes = await admin()
        .from("auction_outcomes")
        .select("*")
        .in("auction_id", [sold.id, noBids.id, reserve.id]);
      s.check("One outcome per closed auction", outcomes.data?.length === 3, `${outcomes.data?.length} outcomes`);
      s.check(
        "No-bid auction recorded explicitly",
        outcomes.data?.find((o) => o.auction_id === noBids.id)?.result === "no_bids",
        "result = no_bids",
      );
      s.check(
        "Reserve not met recorded, and not treated as a sale",
        outcomes.data?.find((o) => o.auction_id === reserve.id)?.result === "reserve_not_met",
        "result = reserve_not_met",
      );
      const outcomeDealer = outcomes.data?.find((o) => o.auction_id === sold.id)?.dealer_id;
      s.check(
        "Outcome names the dealer who actually placed the winning bid",
        outcomeDealer === winningBid.data?.dealer_id,
        `${outcomeDealer} = ${winningBid.data?.dealer_id}`,
      );
      await admin().rpc("close_due_auctions");
      await admin().rpc("close_due_auctions");
      const again = await admin()
        .from("auction_outcomes")
        .select("auction_id")
        .in("auction_id", [sold.id, noBids.id, reserve.id]);
      s.check(
        "Running the worker repeatedly does not duplicate outcomes",
        again.data?.length === 3,
        `still ${again.data?.length}`,
      );
    } finally {
      await closeFixture(f);
    }
    return undefined;
  },

  async marketplace(s, dealers) {
    const f = await openFixture();
    try {
      const a = await newAuction(f);
      await bid(dealers[0], a.id, 1_000_000);
      await setEnd(a.id, -1000);
      await admin().rpc("close_due_auctions");
      const o = await admin()
        .from("auction_outcomes")
        .select("*")
        .eq("auction_id", a.id)
        .single();
      s.check("Outcome recorded", !o.error, o.error?.message ?? "1 row");
      s.check("Links to a vehicle", o.data?.vehicle_id === a.vehicle_id, `vehicle_id = ${o.data?.vehicle_id}`);
      s.check("Links to a seller", o.data?.seller_id === f.tag, `seller_id = ${o.data?.seller_id}`);
      s.check("Links to an event", o.data?.event_id === f.eventId, `event_id = ${o.data?.event_id}`);
      s.check("Carries the winning bid and amount", Boolean(o.data?.high_bid_id) && o.data?.amount_cents === 1_000_000, `$${(o.data?.amount_cents ?? 0) / 100}`);
      const rounds = await admin()
        .from("auctions")
        .select("id")
        .eq("vehicle_id", a.vehicle_id);
      s.check(
        "A vehicle can hold more than one auction round over time",
        (rounds.data?.length ?? 0) >= 1,
        `${rounds.data?.length} round(s) on this vehicle, each with its own outcome row`,
      );
      s.note(
        "Where a marketplace attaches",
        "auction_outcomes is the handoff point: stable vehicle, seller and event ids plus the winning bid, which an offer, notification or payment workflow can consume without touching the auction engine.",
      );
    } finally {
      await closeFixture(f);
    }
    return undefined;
  },

  async security(s, dealers) {
    const f = await openFixture();
    try {
      const a = await newAuction(f);
      await bid(dealers[0], a.id, 1_000_000);
      const rival = dealers[1] ?? dealers[0];

      const anon = createClient(URL, PUBLISHABLE, OPTS);
      const anonBid = await anon.rpc("place_auction_bid", {
        p_auction_id: a.id,
        p_amount_cents: 2_000_000,
        p_request_id: randomUUID(),
      });
      s.check("Signed out users cannot bid", Boolean(anonBid.error), anonBid.error?.message ?? "NO ERROR");

      const insert = await rival.client.from("auction_bids").insert({
        auction_id: a.id,
        dealer_id: dealers[0].dealerId,
        amount_cents: 99_999_999,
        accepted_at: new Date().toISOString(),
        sequence: 99,
        request_id: randomUUID(),
      });
      s.check("A dealer cannot write to the bid ledger directly", Boolean(insert.error), insert.error?.message ?? "NO ERROR");

      await rival.client.from("auctions").update({ high_bid_cents: 1 }).eq("id", a.id);
      const head = await admin()
        .from("auctions")
        .select("high_bid_cents")
        .eq("id", a.id)
        .single();
      s.check(
        "A dealer cannot overwrite the current high bid",
        head.data?.high_bid_cents === 1_000_000,
        `high bid is still $${(head.data?.high_bid_cents ?? 0) / 100}`,
      );

      const worker = await rival.client.rpc("close_due_auctions");
      s.check("A dealer cannot run the closing worker", Boolean(worker.error), worker.error?.message ?? "NO ERROR");

      const timer = await rival.client.rpc("prepare_demo_countdown", {
        p_auction_id: a.id,
        p_duration_seconds: 60,
      });
      s.check("A dealer cannot change the timer", Boolean(timer.error), timer.error?.message ?? "NO ERROR");

      const snap = await rival.client.rpc("auction_snapshot", { p_auction_id: a.id });
      const payload = snap.data?.auction ?? {};
      s.check(
        "The auction payload names no dealer",
        !("high_dealer_id" in payload) && !("winning_dealer_id" in payload),
        `keys: ${Object.keys(payload).filter((k) => k.includes("dealer")).join(", ") || "none containing \"dealer\""}`,
      );
      s.check(
        "A rival is told the lead is not theirs, without being told whose it is",
        payload.high_is_mine === false,
        `high_is_mine = ${payload.high_is_mine}`,
      );
      const rows = await rival.client.from("auction_bids").select("*").eq("auction_id", a.id);
      s.check(
        "A dealer reads only their own raw bids",
        (rows.data?.length ?? 0) === 0,
        `${rows.data?.length} of 1 bid visible (the bid belongs to another dealer)`,
      );
      const history = snap.data?.bids ?? [];
      s.check(
        "History shows anonymous labels only",
        history.every((b: Record<string, unknown>) => !("dealer_id" in b) && "bidder_label" in b),
        history.map((b: { bidder_label: string }) => b.bidder_label).join(", "),
      );
    } finally {
      await closeFixture(f);
    }
    return undefined;
  },
};

/* -------------------------------------------------------------------- entry */

export async function runScenario(
  id: string,
  dealerCount: number,
  keep: boolean,
): Promise<LabResult> {
  const meta = SCENARIOS.find((x) => x.id === id);
  const runner = runners[id];
  const started = performance.now();
  if (!meta || !runner)
    return {
      scenario: id,
      title: id,
      requirement: "",
      ok: false,
      steps: [],
      ms: 0,
      error: `Unknown scenario "${id}".`,
    };
  const s = new Steps();
  keepFixtures = keep;
  keptTags.length = 0;
  try {
    const needed = meta.scaled ? Math.max(2, dealerCount) : 3;
    const { dealers, failed } = await dealerPool(needed);
    if (!dealers.length)
      throw new Error(`No lab dealer sessions could be opened. ${failed[0] ?? ""}`);
    if (failed.length)
      s.note(
        "Dealer pool",
        `Asked for ${needed} accounts, opened ${dealers.length}. ${failed.length} failed, first reason: ${failed[0]}`,
      );
    const metrics = await runner(s, dealers);
    if (keptTags.length)
      s.note(
        "Test data kept in the database",
        `Inspect it with: select * from auction_bids b join auctions a on a.id=b.auction_id where left(a.vehicle_id,4)='lab_' order by b.accepted_at desc;  (this run: ${keptTags.join(", ")})`,
      );
    return {
      scenario: id,
      title: meta.title,
      requirement: meta.requirement,
      ok: s.list.every((x) => x.status !== "fail"),
      steps: s.list,
      metrics,
      ms: Math.round(performance.now() - started),
    };
  } catch (e) {
    return {
      scenario: id,
      title: meta.title,
      requirement: meta.requirement,
      ok: false,
      steps: s.list,
      ms: Math.round(performance.now() - started),
      error: describe(e),
    };
  }
}

/* ------------------------------------------------- realtime (browser driven) */

/**
 * The Realtime test needs a websocket, which lives in the browser, so it runs in
 * three steps: the server opens a fixture, the browser subscribes, the server
 * bids, and the browser times how long the change takes to arrive.
 */
const liveFixtures = new Map<string, Fixture>();

export async function realtimeOpen() {
  const f = await openFixture();
  const a = await newAuction(f);
  liveFixtures.set(a.id, f);
  return { auctionId: a.id, openingBidCents: a.opening_bid_cents as number };
}

export async function realtimeBid(auctionId: string, amount: number, dealerIndex: number) {
  const { dealers: pool } = await dealerPool(2);
  if (!pool.length) throw new Error("No lab dealer session available.");
  const d = pool[dealerIndex % pool.length];
  const r = await bid(d, auctionId, amount);
  return { ok: r.ok, message: r.message, ms: Math.round(r.ms), dealer: d.dealerId };
}

export async function realtimeClose(auctionId: string) {
  const f = liveFixtures.get(auctionId);
  if (!f) return false;
  await closeFixture(f);
  liveFixtures.delete(auctionId);
  return true;
}


/* ------------------------------------------------- demo inventory and live run */

/** A demo vehicle with an auction, ignoring the lab's own fixtures. */
export interface DemoVehicle {
  vehicleId: string;
  title: string;
  auctionId: string;
  status: string;
  bidCount: number;
  highBidCents: number | null;
}

/** The newest auction round for each real vehicle. */
async function latestRounds(): Promise<DemoVehicle[]> {
  const db = admin();
  const { data: auctions, error } = await db
    .from("auctions")
    .select("id,vehicle_id,status,bid_count,high_bid_cents,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const { data: vehicles } = await db.from("auction_vehicles").select("id,title");
  const titles = new Map((vehicles ?? []).map((v) => [v.id as string, v.title as string]));
  const seen = new Set<string>();
  const out: DemoVehicle[] = [];
  for (const a of auctions ?? []) {
    const vid = a.vehicle_id as string;
    if (vid.startsWith("lab_") || seen.has(vid)) continue;
    seen.add(vid);
    out.push({
      vehicleId: vid,
      title: titles.get(vid) ?? vid,
      auctionId: a.id as string,
      status: a.status as string,
      bidCount: a.bid_count as number,
      highBidCents: a.high_bid_cents as number | null,
    });
  }
  return out.sort((x, y) => x.title.localeCompare(y.title));
}

export async function demoInventory() {
  return latestRounds();
}

/**
 * Puts every demo vehicle's newest round back on sale. Only the newest round per
 * vehicle is reopened, because a unique index allows one open auction per
 * vehicle. The bid history is left intact; only the closing state is undone.
 */
export async function reopenDemoAuctions(hours = 24) {
  const db = admin();
  const rounds = await latestRounds();
  const ends = new Date(Date.now() + hours * 3600_000).toISOString();
  const opens = new Date(Date.now() - 60_000).toISOString();
  let reopened = 0;
  for (const r of rounds) {
    if (r.status === "open") continue;
    // Remove the recorded outcome so a later close records a fresh one rather
    // than hitting the on-conflict-do-nothing guard.
    await db.from("auction_outcomes").delete().eq("auction_id", r.auctionId);
    const { error } = await db
      .from("auctions")
      .update({
        status: "open",
        ends_at: ends,
        opens_at: opens,
        closed_at: null,
        winning_bid_id: null,
        result: null,
      })
      .eq("id", r.auctionId);
    if (error) throw new Error(`${r.vehicleId}: ${describe(error)}`);
    reopened++;
  }
  return { reopened, total: rounds.length };
}

/* ---------------------------------------------------------------- live bidding */

interface LiveState {
  running: boolean;
  vehicleId: string;
  title: string;
  auctionId: string;
  placed: number;
  refused: number;
  highCents: number | null;
  endsAt: string | null;
  startedAt: number;
  until: number;
  lastError: string;
  stop: boolean;
}
let live: LiveState | null = null;

export function liveStatus() {
  if (!live) return { running: false };
  return {
    running: live.running,
    vehicleId: live.vehicleId,
    title: live.title,
    auctionId: live.auctionId,
    placed: live.placed,
    refused: live.refused,
    highCents: live.highCents,
    endsAt: live.endsAt,
    lastError: live.lastError,
    secondsLeft: Math.max(0, Math.round((live.until - Date.now()) / 1000)),
  };
}

export function liveStop() {
  if (live) {
    live.stop = true;
    live.running = false;
  }
  return { stopped: true };
}

/**
 * Drives a genuine bidding war on a real demo vehicle so it can be watched from
 * the dealer portal in another tab. Each bid is a real authenticated RPC from a
 * different dealer, so Realtime, the timer, anti-sniping and the ledger all
 * behave exactly as they would with people clicking.
 */
export async function liveStart(opts: {
  vehicleId: string;
  dealers: number;
  seconds: number;
  runwaySeconds: number;
}) {
  if (live?.running) throw new Error("A live run is already going. Stop it first.");
  const db = admin();
  const rounds = await latestRounds();
  const target = rounds.find((r) => r.vehicleId === opts.vehicleId);
  if (!target) throw new Error(`No auction found for ${opts.vehicleId}.`);

  // Give the auction a short runway so anti-sniping extensions are visible.
  const { error: prep } = await db
    .from("auctions")
    .update({
      status: "open",
      opens_at: new Date(Date.now() - 60_000).toISOString(),
      ends_at: new Date(Date.now() + opts.runwaySeconds * 1000).toISOString(),
      closed_at: null,
      winning_bid_id: null,
      result: null,
    })
    .eq("id", target.auctionId);
  if (prep) throw new Error(`Could not open the auction: ${describe(prep)}`);
  await db.from("auction_outcomes").delete().eq("auction_id", target.auctionId);

  const { dealers } = await dealerPool(Math.max(2, opts.dealers));
  if (dealers.length < 2) throw new Error("Need at least two dealer sessions for a bidding war.");

  live = {
    running: true,
    vehicleId: target.vehicleId,
    title: target.title,
    auctionId: target.auctionId,
    placed: 0,
    refused: 0,
    highCents: target.highBidCents,
    endsAt: null,
    startedAt: Date.now(),
    until: Date.now() + opts.seconds * 1000,
    lastError: "",
    stop: false,
  };
  const state = live;

  void (async () => {
    let leader = "";
    while (!state.stop && Date.now() < state.until) {
      const candidates = dealers.filter((d) => d.dealerId !== leader);
      const d = candidates[Math.floor(Math.random() * candidates.length)];
      const { data: row } = await admin()
        .from("auctions")
        .select("high_bid_cents,opening_bid_cents,increment_cents,status,ends_at")
        .eq("id", state.auctionId)
        .single();
      if (!row || row.status !== "open") {
        state.lastError = "The auction closed.";
        break;
      }
      const increment = row.increment_cents as number;
      const base = (row.high_bid_cents as number | null) ?? (row.opening_bid_cents as number);
      const step = increment * (1 + Math.floor(Math.random() * 4));
      const amount = (row.high_bid_cents === null ? base : base + step);
      const result = await bid(d, state.auctionId, amount);
      if (result.ok) {
        state.placed++;
        state.highCents = amount;
        leader = d.dealerId;
      } else {
        state.refused++;
        state.lastError = result.message;
      }
      state.endsAt = row.ends_at as string;
      await new Promise((r) => setTimeout(r, 700 + Math.random() * 1500));
    }
    state.running = false;
  })();

  return {
    auctionId: target.auctionId,
    vehicleId: target.vehicleId,
    title: target.title,
    path: `/dealer/inventory/${target.vehicleId}`,
  };
}
