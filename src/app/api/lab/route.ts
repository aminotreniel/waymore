import { createClient } from "@supabase/supabase-js";
import {
  demoInventory,
  labConfigError,
  liveStart,
  liveStatus,
  liveStop,
  reopenDemoAuctions,
  realtimeBid,
  realtimeClose,
  realtimeOpen,
  purgeLabData,
  runScenario,
  teardownPool,
} from "@/lib/lab/runner";

export const runtime = "nodejs";
/** A 100 dealer burst plus pool warm up can take a while on a cold run. */
export const maxDuration = 300;

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (process.env.WAYMORE_LAB !== "true")
    return json({ error: "The auction lab is disabled. Set WAYMORE_LAB=true in .env.local." }, 404);

  // The caller must be a signed in administrator. The browser sends its own
  // Supabase access token; we ask the database who that is rather than trusting
  // anything in the request body.
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer "))
    return json({ error: "Sign in as the demo administrator first." }, 401);
  const caller = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: authorization } },
    },
  );
  const { data: isAdmin, error } = await caller.rpc("is_auction_admin");
  if (error || !isAdmin)
    return json({ error: "Administrator access is required to run the lab." }, 403);

  // Checked only after the caller is known to be an administrator, so the
  // configuration diagnostics are not readable by anyone who finds the URL.
  const config = labConfigError();
  if (config) return json({ error: config }, 503);

  let body: {
    action?: string;
    scenario?: string;
    dealers?: number;
    auctionId?: string;
    amount?: number;
    dealerIndex?: number;
    keep?: boolean;
    vehicleId?: string;
    seconds?: number;
    runwaySeconds?: number;
    hours?: number;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Malformed request." }, 400);
  }

  try {
    if (body.action === "realtime-open") return json(await realtimeOpen());
    if (body.action === "realtime-bid")
      return json(
        await realtimeBid(body.auctionId!, Number(body.amount), Number(body.dealerIndex) || 0),
      );
    if (body.action === "realtime-close")
      return json({ closed: await realtimeClose(body.auctionId!) });
    if (body.action === "inventory") return json({ vehicles: await demoInventory() });
    if (body.action === "reopen") return json(await reopenDemoAuctions(body.hours ?? 24));
    if (body.action === "live-start")
      return json(
        await liveStart({
          vehicleId: body.vehicleId!,
          dealers: Math.min(60, Math.max(2, Number(body.dealers) || 12)),
          seconds: Math.min(600, Math.max(10, Number(body.seconds) || 90)),
          runwaySeconds: Math.min(3600, Math.max(30, Number(body.runwaySeconds) || 120)),
        }),
      );
    if (body.action === "live-status") return json(liveStatus());
    if (body.action === "live-stop") return json(liveStop());
    if (body.action === "purge") {
      const removed = await purgeLabData();
      return json({ purged: removed });
    }
    if (body.action === "teardown") {
      const removed = await teardownPool();
      return json({ removed });
    }
    if (!body.scenario) return json({ error: "No scenario given." }, 400);
    const dealers = Math.min(100, Math.max(2, Number(body.dealers) || 25));
    const result = await runScenario(body.scenario, dealers, body.keep !== false);
    return json(result);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "The run failed." }, 500);
  }
}
