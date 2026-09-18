/** Run with: npx tsx --env-file=.env.local scripts/seed-auctions.ts
 * Uses the authenticated CLI to obtain an admin key in memory; never logs/saves it.
 * Account passwords are written only to ignored work/demo-accounts.json.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { listedVehicles } from "../src/lib/data/vehicles";
import { dealers } from "../src/lib/data/people";
const ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(
  ".",
)[0];
const raw = JSON.parse(
  execFileSync(
    "supabase",
    ["projects", "api-keys", "--project-ref", ref, "--reveal", "-o", "json"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ),
);
const keys = Array.isArray(raw) ? raw : (raw.api_keys ?? raw.keys);
const key = keys.find(
  (k: { name: string; type?: string }) =>
    k.name === "service_role" || k.type === "secret",
)?.api_key;
if (!key) throw new Error("No service key available to the authenticated CLI.");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
async function check(result: { error: unknown }) {
  if (result.error) throw result.error;
}
async function main() {
  mkdirSync("work", { recursive: true });
  for (const d of dealers.slice(0, 3))
    await check(
      await db
        .from("auction_dealers")
        .upsert({
          id: d.id,
          name: d.name,
          bidder_label: `Dealer ${d.dealerNumber.slice(-3)}`,
        }),
    );
  for (const v of listedVehicles) {
    await check(await db.from("auction_sellers").upsert({ id: v.sellerId }));
    await check(
      await db
        .from("auction_vehicles")
        .upsert({
          id: v.id,
          seller_id: v.sellerId,
          title: `${v.year} ${v.make} ${v.model}`,
          reserve_cents: v.reservePrice === null ? null : v.reservePrice * 100,
          details: v,
        }),
    );
  }
  const { data: existing, error } = await db
    .from("auctions")
    .select("id")
    .limit(1);
  if (error) throw error;
  if (!existing?.length) {
    const { data: event, error } = await db
      .from("auction_events")
      .insert({ name: "Way More · interview demonstration" })
      .select()
      .single();
    if (error) throw error;
    await check(
      await db
        .from("auctions")
        .insert(
          listedVehicles.map((v) => ({
            event_id: event.id,
            vehicle_id: v.id,
            opens_at: new Date().toISOString(),
            ends_at: new Date(Date.now() + 24 * 3600_000).toISOString(),
            opening_bid_cents: v.estimateLow * 100,
            reserve_cents:
              v.reservePrice === null ? null : v.reservePrice * 100,
          })),
        ),
    );
  }
  if (!existsSync("work/demo-accounts.json")) {
    const accounts = [];
    for (const [i, d] of dealers.slice(0, 3).entries()) {
      const email = `dealer${i + 1}@waymore-demo.example`;
      const password = randomBytes(18).toString("base64url");
      const { data, error } = await db.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error) throw error;
      await check(
        await db
          .from("dealer_memberships")
          .insert({ user_id: data.user.id, dealer_id: d.id }),
      );
      if (i === 0)
        await check(
          await db.from("auction_admins").insert({ user_id: data.user.id }),
        );
      accounts.push({ email, password, dealer: d.name, admin: i === 0 });
      writeFileSync(
        "work/demo-accounts.json",
        JSON.stringify(accounts, null, 2),
        { mode: 0o600 },
      );
    }
  }
  console.log(
    `Seeded ${listedVehicles.length} vehicles. Private demo credentials saved in work/demo-accounts.json.`,
  );
}
main().catch((e) => {
  console.error(e.message ?? e);
  process.exitCode = 1;
});
