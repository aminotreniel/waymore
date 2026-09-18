import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * Per-instance throttle. This is a speed bump for the demo deployment, not a
 * real limiter: a serverless deployment runs several instances and each keeps
 * its own counter. A production deployment needs a shared store (or the gateway's
 * own rate limiting) — but this endpoint should not exist in production at all.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const attempts = new Map<string, { count: number; resets: number }>();
function throttled(key: string) {
  const now = Date.now();
  const seen = attempts.get(key);
  if (!seen || now > seen.resets) {
    attempts.set(key, { count: 1, resets: now + WINDOW_MS });
    if (attempts.size > 5000)
      for (const [k, v] of attempts) if (now > v.resets) attempts.delete(k);
    return false;
  }
  seen.count++;
  return seen.count > MAX_PER_WINDOW;
}

// Explicitly enabled only for the demonstration. Passwords stay on the server.
export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (process.env.WAYMORE_DEMO_LOGIN !== "true") {
    return Response.json(
      { error: "Demo access is disabled." },
      { status: 404, headers },
    );
  }
  // Require a same-origin browser request. Comparing against the Host header
  // rather than request.url keeps this correct behind a proxy that terminates
  // TLS; a request with no Origin at all (curl, a server-side script) is refused
  // instead of being waved through.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  let sameOrigin = false;
  try {
    sameOrigin = Boolean(origin && host && new URL(origin).host === host);
  } catch {
    sameOrigin = false;
  }
  if (!sameOrigin) {
    return Response.json(
      { error: "Invalid request origin." },
      { status: 403, headers },
    );
  }
  const caller =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (throttled(caller)) {
    return Response.json(
      { error: "Too many attempts. Wait a minute and try again." },
      { status: 429, headers: { ...headers, "Retry-After": "60" } },
    );
  }
  let account: unknown;
  try {
    ({ account } = await request.json());
  } catch {
    return Response.json(
      { error: "Choose a demo account." },
      { status: 400, headers },
    );
  }
  if (
    typeof account !== "number" ||
    !Number.isInteger(account) ||
    account < 0 ||
    account > 2
  ) {
    return Response.json(
      { error: "Unknown demo account." },
      { status: 400, headers },
    );
  }
  try {
    const accounts = JSON.parse(
      process.env.WAYMORE_DEMO_ACCOUNTS || "[]",
    ) as Array<{ email: string; password: string }>;
    const credentials = accounts[account];
    if (!credentials)
      return Response.json(
        { error: "Demo accounts are not configured." },
        { status: 503, headers },
      );
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    const { data, error } = await client.auth.signInWithPassword(credentials);
    if (error || !data.session)
      return Response.json(
        { error: "Could not open this account. Please try again." },
        { status: 503, headers },
      );
    return Response.json(
      {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
      { headers },
    );
  } catch {
    return Response.json(
      { error: "Demo access is unavailable. Please try again." },
      { status: 503, headers },
    );
  }
}
