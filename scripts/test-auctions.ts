/** Integration tests against the linked demonstration project. Creates and removes only test-owned fixtures. */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const raw = JSON.parse(
  execFileSync(
    "supabase",
    [
      "projects",
      "api-keys",
      "--project-ref",
      new URL(url).hostname.split(".")[0],
      "--reveal",
      "-o",
      "json",
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ),
);
const keys = Array.isArray(raw) ? raw : (raw.api_keys ?? raw.keys);
const key = keys.find(
  (k: { name: string; type?: string }) =>
    k.name === "service_role" || k.type === "secret",
)?.api_key;
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, key, options);
const anon = createClient(url, publishable, options);
const accounts = JSON.parse(readFileSync("work/demo-accounts.json", "utf8"));
const clients = accounts.map(() => createClient(url, publishable, options));
const tag = `test_${randomUUID()}`;
const ids: string[] = [];
let eventId: string;
let count = 0;
function ok(value: unknown, label: string) {
  assert.ok(value, label);
  console.log(`PASS ${++count}: ${label}`);
}
async function must(result: { error: unknown }) {
  if (result.error) throw result.error;
}
async function auction(overrides: Record<string, unknown> = {}) {
  const vid = `${tag}_${ids.length}`;
  await must(
    await admin
      .from("auction_vehicles")
      .insert({
        id: vid,
        seller_id: tag,
        title: "Integration test vehicle",
        details: {},
      }),
  );
  const { data, error } = await admin
    .from("auctions")
    .insert({
      event_id: eventId,
      vehicle_id: vid,
      opens_at: new Date(Date.now() - 1000).toISOString(),
      ends_at: new Date(Date.now() + 3600_000).toISOString(),
      opening_bid_cents: 10000,
      ...overrides,
    })
    .select()
    .single();
  if (error) throw error;
  ids.push(data.id);
  return data;
}
async function bid(
  client: typeof anon,
  id: string,
  amount: number,
  request = randomUUID(),
) {
  return client.rpc("place_auction_bid", {
    p_auction_id: id,
    p_amount_cents: amount,
    p_request_id: request,
  });
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function main() {
  for (let i = 0; i < clients.length; i++)
    await must(await clients[i].auth.signInWithPassword(accounts[i]));
  await must(await admin.from("auction_sellers").insert({ id: tag }));
  const ev = await admin
    .from("auction_events")
    .insert({ name: tag })
    .select()
    .single();
  if (ev.error) throw ev.error;
  eventId = ev.data.id;
  const a = await auction();
  ok(Boolean((await bid(anon, a.id, 10000)).error), "Anonymous bidding denied");
  const collision = await Promise.all([
    bid(clients[0], a.id, 10000),
    bid(clients[1], a.id, 10000),
  ]);
  ok(
    collision.filter((r) => !r.error).length === 1,
    "Simultaneous equal bids accept exactly one",
  );
  // Use the dealer who lost the race so the self-outbid guard does not mask
  // the duplicate-request and minimum-increment assertions.
  const nextBidder = clients[collision[0].error ? 0 : 1];
  const incrementBidder = clients[collision[0].error ? 1 : 0];
  const request = randomUUID();
  const duplicates = await Promise.all([
    bid(nextBidder, a.id, 20000, request),
    bid(nextBidder, a.id, 20000, request),
  ]);
  ok(
    duplicates.every((r) => !r.error) &&
      duplicates[0].data.bid.id === duplicates[1].data.bid.id,
    "Double click creates one durable bid",
  );
  ok(
    Boolean((await bid(nextBidder, a.id, 30000, request)).error),
    "Idempotency key cannot change amount",
  );
  ok(
    Boolean((await bid(incrementBidder, a.id, 25000)).error),
    "Minimum increment enforced in database",
  );
  ok(
    Boolean((await bid(clients[1], a.id, -100)).error),
    "Negative bids denied",
  );
  const burst = await Promise.all(
    Array.from({ length: 100 }, (_, i) =>
      bid(clients[i % clients.length], a.id, 30000),
    ),
  );
  ok(
    burst.filter((r) => !r.error).length === 1,
    "100 simultaneous equal bid requests accept exactly one",
  );
  const history = await clients[1].rpc("auction_snapshot", {
    p_auction_id: a.id,
  });
  ok(
    !history.error && history.data.bids.length === 3,
    "Complete history survives a fresh database read",
  );
  ok(
    history.data.bids.every(
      (b: Record<string, unknown>) =>
        b.accepted_at && !("dealer_id" in b) && !("request_id" in b),
    ),
    "Public bid history has exact timestamps and anonymised bidder labels",
  );
  ok(
    Boolean(
      (
        await clients[1]
          .from("auction_bids")
          .insert({
            auction_id: a.id,
            dealer_id: "dlr_kia",
            amount_cents: 999999,
            accepted_at: new Date().toISOString(),
            sequence: 99,
            request_id: randomUUID(),
          })
      ).error,
    ),
    "Direct client bid insertion denied",
  );
  await clients[1]
    .from("auctions")
    .update({ high_bid_cents: 1 })
    .eq("id", a.id);
  const protectedRow = await admin
    .from("auctions")
    .select("high_bid_cents")
    .eq("id", a.id)
    .single();
  ok(
    protectedRow.data?.high_bid_cents === 30000,
    "Client cannot overwrite current high bid",
  );
  ok(
    Boolean((await clients[1].rpc("close_due_auctions")).error),
    "Dealers cannot invoke privileged closing worker",
  );
  ok(
    Boolean(
      (
        await clients[1].rpc("prepare_demo_countdown", {
          p_auction_id: a.id,
          p_duration_seconds: 60,
        })
      ).error,
    ),
    "Ordinary dealer cannot alter timers",
  );
  const privacy = await auction();
  const lead = await bid(clients[0], privacy.id, 10000);
  if (lead.error) throw lead.error;
  ok(
    !("high_dealer_id" in lead.data.auction) &&
      !("winning_dealer_id" in lead.data.auction),
    "Auction payload carries no bidder identity column",
  );
  ok(
    lead.data.auction.high_is_mine === true,
    "The high bidder is told the bid is theirs",
  );
  ok(
    Boolean((await bid(clients[0], privacy.id, 20000)).error),
    "The high bidder cannot outbid themselves",
  );
  const rival = await clients[1].rpc("auction_snapshot", {
    p_auction_id: privacy.id,
  });
  ok(
    !rival.error &&
      rival.data.auction.high_is_mine === false &&
      !("high_dealer_id" in rival.data.auction),
    "A rival dealer learns neither who leads nor that the lead is theirs",
  );
  ok(
    !rival.data.bids.some((b: { mine: boolean }) => b.mine),
    "A rival's history marks none of another dealer's bids as their own",
  );
  const directRow = await clients[1]
    .from("auctions")
    .select("*")
    .eq("id", privacy.id)
    .single();
  ok(
    !directRow.error &&
      !("high_dealer_id" in (directRow.data ?? {})) &&
      !("winning_dealer_id" in (directRow.data ?? {})),
    "A direct table read (and so the Realtime payload) exposes no identity",
  );
  const extension = await auction({
    ends_at: new Date(Date.now() + 45_000).toISOString(),
  });
  const ext = await bid(clients[0], extension.id, 10000);
  if (ext.error) throw ext.error;
  ok(
    Date.parse(ext.data.auction.ends_at) - Date.parse(extension.ends_at) ===
      90_000,
    "Final-minute bid adds exactly 90 seconds",
  );
  const firstEnd = ext.data.auction.ends_at;
  const early = await bid(clients[1], extension.id, 20000);
  if (early.error) throw early.error;
  ok(
    early.data.auction.ends_at === firstEnd,
    "Bid outside final minute does not extend",
  );
  await must(
    await admin
      .from("auctions")
      .update({ ends_at: new Date(Date.now() + 45_000).toISOString() })
      .eq("id", extension.id),
  );
  const repeat = await bid(clients[0], extension.id, 30000);
  if (repeat.error) throw repeat.error;
  ok(repeat.data.auction.extension_count === 2, "Anti-sniping can repeat");
  const retryId = randomUUID();
  const ending = await auction({
    extension_window_seconds: 1,
    ends_at: new Date(Date.now() + 60_000).toISOString(),
  });
  await must(await bid(clients[0], ending.id, 10000, retryId));
  await must(
    await admin
      .from("auctions")
      .update({ ends_at: new Date(Date.now() - 100).toISOString() })
      .eq("id", ending.id),
  );
  ok(
    Boolean((await bid(clients[1], ending.id, 20000)).error),
    "Bid after deadline rejected even before worker finalizes",
  );
  const retry = await bid(clients[0], ending.id, 10000, retryId);
  ok(
    !retry.error && retry.data.duplicate,
    "Lost-response retry after deadline returns original bid",
  );
  const noBid = await auction({
    opens_at: new Date(Date.now() - 60_000).toISOString(),
    ends_at: new Date(Date.now() - 1000).toISOString(),
  });
  const reserve = await auction({ reserve_cents: 100000 });
  await must(await bid(clients[0], reserve.id, 10000));
  await must(
    await admin
      .from("auctions")
      .update({ ends_at: new Date(Date.now() - 100).toISOString() })
      .eq("id", reserve.id),
  );
  // Do not call the finalizer: verify Cron works with no connected viewers.
  for (let i = 0; i < 15; i++) {
    const row = await admin
      .from("auctions")
      .select("status")
      .eq("id", ending.id)
      .single();
    if (row.data?.status === "closed") break;
    await delay(1000);
  }
  const closed = await admin
    .from("auctions")
    .select("*")
    .eq("id", ending.id)
    .single();
  ok(
    closed.data?.status === "closed" &&
      closed.data.winning_bid_id === retry.data.bid.id,
    "Background Cron stores winner without viewers",
  );
  await must(await admin.rpc("close_due_auctions"));
  await must(await admin.rpc("close_due_auctions"));
  const outcomes = await admin
    .from("auction_outcomes")
    .select("*")
    .in("auction_id", [ending.id, noBid.id, reserve.id]);
  ok(
    outcomes.data?.length === 3,
    "Repeated finalization creates exactly one outcome per auction",
  );
  ok(
    outcomes.data?.find((r) => r.auction_id === noBid.id)?.result === "no_bids",
    "No-bid auction has explicit outcome",
  );
  ok(
    outcomes.data?.find((r) => r.auction_id === reserve.id)?.result ===
      "reserve_not_met",
    "Reserve-not-met outcome does not mark sale complete",
  );
  const refreshClient = createClient(url, publishable, options);
  await must(await refreshClient.auth.signInWithPassword(accounts[0]));
  const restored = await refreshClient.rpc("auction_snapshot", {
    p_auction_id: ending.id,
  });
  ok(
    restored.data?.auction.winning_bid_id === closed.data.winning_bid_id,
    "New authenticated session sees durable result",
  );
  ok(
    restored.data?.auction.won_by_me === true,
    "The winner's own session sees the win without naming a dealer",
  );
  const losing = await clients[1].rpc("auction_snapshot", {
    p_auction_id: ending.id,
  });
  ok(
    losing.data?.auction.won_by_me === false &&
      !("winning_dealer_id" in losing.data.auction),
    "A losing dealer cannot see who won",
  );
  const outcomeRow = await admin
    .from("auction_outcomes")
    .select("dealer_id,high_bid_id")
    .eq("auction_id", ending.id)
    .single();
  const winningBid = await admin
    .from("auction_bids")
    .select("dealer_id")
    .eq("id", closed.data.winning_bid_id)
    .single();
  ok(
    outcomeRow.data?.dealer_id === winningBid.data?.dealer_id &&
      outcomeRow.data?.high_bid_id === closed.data.winning_bid_id,
    "The stored outcome names the dealer who actually placed the winning bid",
  );
  let resolveUpdate: (value: boolean) => void;
  const update = new Promise<boolean>((resolve) => {
    resolveUpdate = resolve;
  });
  const channel = clients[1].channel(`test-live-${tag}`);
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Realtime subscribe timed out")),
      10000,
    );
    channel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "auctions",
          filter: `id=eq.${a.id}`,
        },
        () => resolveUpdate(true),
      )
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timeout);
          resolve();
        }
      });
  });
  const burstWinnerIndex = burst.findIndex((result) => !result.error) % clients.length;
  const realtimeBidder = clients[(burstWinnerIndex + 1) % clients.length];
  await must(await bid(realtimeBidder, a.id, 40000));
  const delivered = await Promise.race([update, delay(8000).then(() => false)]);
  ok(
    delivered,
    "A second authenticated viewer receives a Realtime auction update",
  );
  await clients[1].removeChannel(channel);
  console.log(`Completed ${count} integration assertions.`);
}
main()
  .catch((e) => {
    console.error(e.message ?? e);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (ids.length) {
      await must(
        await admin
          .from("auctions")
          .update({ high_bid_id: null, winning_bid_id: null })
          .in("id", ids),
      );
      await must(
        await admin.from("auction_outcomes").delete().in("auction_id", ids),
      );
      await must(
        await admin.from("auction_bids").delete().in("auction_id", ids),
      );
      await must(await admin.from("auctions").delete().in("id", ids));
    }
    await admin.from("auction_vehicles").delete().eq("seller_id", tag);
    await admin.from("auction_sellers").delete().eq("id", tag);
    if (eventId) await admin.from("auction_events").delete().eq("id", eventId);
    for (const c of clients) await c.removeAllChannels();
  });
