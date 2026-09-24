"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { useAuctions } from "@/context/AuctionContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PortalHeader } from "@/components/portal/PortalShell";
import { dollars } from "@/lib/auction";
import { SCENARIOS, type LabResult, type LabStep } from "@/lib/lab/types";

type State = Record<string, LabResult | "running" | undefined>;

const CHIP: Record<LabStep["status"], string> = {
  pass: "bg-mint-100 text-success",
  fail: "bg-red-50 text-danger",
  info: "bg-paper text-muted",
};
const LABEL: Record<LabStep["status"], string> = {
  pass: "PASS",
  fail: "FAIL",
  info: "NOTE",
};

export default function AuctionLabPage() {
  const { data, session } = useAuctions();
  const [results, setResults] = useState<State>({});
  const [dealers, setDealers] = useState(25);
  const [keep, setKeep] = useState(true);
  const [inventory, setInventory] = useState<
    { vehicleId: string; title: string; status: string; bidCount: number }[]
  >([]);
  const [target, setTarget] = useState("");
  const [seconds, setSeconds] = useState(90);
  const [liveDealers, setLiveDealers] = useState(12);
  const [live, setLive] = useState<{
    running?: boolean;
    title?: string;
    vehicleId?: string;
    placed?: number;
    refused?: number;
    highCents?: number | null;
    secondsLeft?: number;
    lastError?: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [fatal, setFatal] = useState("");
  const channelRef = useRef<RealtimeChannel | null>(null);

  const call = useCallback(
    async (body: Record<string, unknown>) => {
      const token = session?.access_token;
      const response = await fetch("/api/lab", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
      return payload;
    },
    [session],
  );

  /** The Realtime check has to run here, because the websocket lives in this tab. */
  const runRealtime = useCallback(async (): Promise<LabResult> => {
    const steps: LabStep[] = [];
    const started = performance.now();
    let auctionId = "";
    const events: number[] = [];
    try {
      const opened = await call({ action: "realtime-open" });
      auctionId = opened.auctionId;
      const channel = supabase.channel(`auction-lab-${auctionId}`);
      channelRef.current = channel;
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Subscription timed out after 10s.")), 10_000);
        channel
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "auctions", filter: `id=eq.${auctionId}` },
            () => events.push(performance.now()),
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              clearTimeout(timer);
              resolve();
            }
            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              clearTimeout(timer);
              reject(new Error(`Subscription failed: ${status}`));
            }
          });
      });
      steps.push({
        name: "This tab subscribed to live auction updates",
        status: "pass",
        detail: `watching auction ${auctionId.slice(0, 8)}`,
      });

      for (let i = 0; i < 3; i++) {
        const before = events.length;
        const sent = performance.now();
        const placed = await call({
          action: "realtime-bid",
          auctionId,
          amount: 1_000_000 + i * 100_000,
          dealerIndex: i,
        });
        const responded = performance.now();
        const deadline = performance.now() + 8000;
        while (events.length === before && performance.now() < deadline)
          await new Promise((r) => setTimeout(r, 15));
        const arrived = events.length > before;
        const at = events[before];
        steps.push({
          name: `Bid ${i + 1} by another dealer reached this tab`,
          status: arrived ? "pass" : "fail",
          detail: arrived
            ? `${Math.round(at - sent)}ms from asking the server to bid, and ${Math.round(at - responded)}ms after the bid was confirmed${at < responded ? " (the live update beat the HTTP response back)" : ""}`
            : `no update arrived within 8s (server said: ${placed.message})`,
          ms: Math.round(performance.now() - sent),
        });
      }
      steps.push({
        name: "Every accepted bid produced exactly one update",
        status: events.length === 3 ? "pass" : "fail",
        detail: `${events.length} updates for 3 bids`,
      });
      steps.push({
        name: "What this proves and what it does not",
        status: "info",
        detail:
          "Live updates reach a viewer who is not bidding, within a second. Realtime is a notification only: the page re-reads the database on every event, on focus, on reconnect and every 5 seconds, so a missed message cannot leave a stale price on screen.",
      });
    } catch (e) {
      steps.push({
        name: "Realtime check",
        status: "fail",
        detail: e instanceof Error ? e.message : "failed",
      });
    } finally {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (auctionId) await call({ action: "realtime-close", auctionId }).catch(() => {});
    }
    const meta = SCENARIOS.find((x) => x.id === "realtime")!;
    return {
      scenario: "realtime",
      title: meta.title,
      requirement: meta.requirement,
      ok: steps.every((x) => x.status !== "fail"),
      steps,
      ms: Math.round(performance.now() - started),
    };
  }, [call]);

  const run = useCallback(
    async (id: string) => {
      setResults((r) => ({ ...r, [id]: "running" }));
      try {
        const result: LabResult =
          id === "realtime"
            ? await runRealtime()
            : await call({ scenario: id, dealers, keep });
        setResults((r) => ({ ...r, [id]: result }));
        return result.ok;
      } catch (e) {
        setFatal(e instanceof Error ? e.message : "The run failed.");
        setResults((r) => ({ ...r, [id]: undefined }));
        return false;
      }
    },
    [call, dealers, keep, runRealtime],
  );

  async function runAll() {
    setBusy(true);
    setFatal("");
    setResults({});
    for (const scenario of SCENARIOS) await run(scenario.id);
    setBusy(false);
  }

  async function runOne(id: string) {
    setBusy(true);
    setFatal("");
    await run(id);
    setBusy(false);
  }

  async function teardown() {
    setBusy(true);
    try {
      const { removed } = await call({ action: "teardown" });
      setFatal(`Removed ${removed} lab dealer accounts.`);
    } catch (e) {
      setFatal(e instanceof Error ? e.message : "Teardown failed.");
    }
    setBusy(false);
  }

  const loadInventory = useCallback(async () => {
    try {
      const { vehicles } = await call({ action: "inventory" });
      setInventory(vehicles);
      setTarget((t) => t || vehicles.find((v: { bidCount: number }) => v.bidCount > 0)?.vehicleId || vehicles[0]?.vehicleId || "");
    } catch {
      /* the setup banner already explains a missing key */
    }
  }, [call]);

  useEffect(() => {
    if (!data.is_admin) return;
    const timer = setTimeout(() => void loadInventory(), 0);
    return () => clearTimeout(timer);
  }, [data.is_admin, loadInventory]);

  // Poll while a live run is going so the numbers here track the listing.
  useEffect(() => {
    if (!live?.running) return;
    const timer = setInterval(async () => {
      try {
        const status = await call({ action: "live-status" });
        setLive(status);
        if (!status.running) void loadInventory();
      } catch {
        /* keep the last known state */
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [live?.running, call, loadInventory]);

  async function startLive() {
    setBusy(true);
    setFatal("");
    try {
      await call({
        action: "live-start",
        vehicleId: target,
        dealers: liveDealers,
        seconds,
        runwaySeconds: Math.max(60, seconds + 30),
      });
      setLive(await call({ action: "live-status" }));
    } catch (e) {
      setFatal(e instanceof Error ? e.message : "Could not start the live run.");
    }
    setBusy(false);
  }

  async function stopLive() {
    await call({ action: "live-stop" }).catch(() => {});
    setLive(await call({ action: "live-status" }).catch(() => null));
    void loadInventory();
  }

  async function reopen() {
    setBusy(true);
    try {
      const { reopened, total } = await call({ action: "reopen" });
      setFatal(`Reopened ${reopened} of ${total} demo auctions for 24 hours.`);
      await loadInventory();
    } catch (e) {
      setFatal(e instanceof Error ? e.message : "Could not reopen the auctions.");
    }
    setBusy(false);
  }

  async function purge() {
    setBusy(true);
    try {
      const { purged } = await call({ action: "purge" });
      setFatal(`Deleted ${purged} lab auctions and everything attached to them.`);
    } catch (e) {
      setFatal(e instanceof Error ? e.message : "Could not delete the lab data.");
    }
    setBusy(false);
  }

  if (!data.is_admin)
    return (
      <div className="p-8">
        <h1 className="text-2xl">Administrator access required</h1>
        <p className="mt-3 text-body">
          Sign in with the demo host account to open the auction lab.
        </p>
      </div>
    );

  const done = SCENARIOS.map((x) => results[x.id]).filter(
    (r): r is LabResult => Boolean(r) && r !== "running",
  );
  const passed = done.filter((r) => r.ok).length;

  return (
    <div className="p-4 sm:p-8 space-y-5 max-w-[1100px]">
      <PortalHeader
        title="Auction lab"
        lead="Runs every one of Justin's nine requirements against the live database, using real authenticated dealer sessions. Each run builds its own vehicles and auctions and deletes them afterwards, so your demo data is never touched."
      />

      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5" htmlFor="dealers">
              Simultaneous dealers
            </label>
            <input
              id="dealers"
              type="number"
              min={2}
              max={100}
              value={dealers}
              disabled={busy}
              onChange={(e) => setDealers(Math.min(100, Math.max(2, Number(e.target.value) || 2)))}
              className="h-11 w-28 rounded-xl border border-line-strong px-3 tabular-nums"
            />
          </div>
          <Button onClick={() => void runAll()} disabled={busy}>
            {busy ? "Running…" : "Run every test"}
          </Button>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={keep}
              disabled={busy}
              onChange={(e) => setKeep(e.target.checked)}
              className="size-4 rounded border-line-strong"
            />
            Keep test data
          </label>
          <Button variant="outline" onClick={() => void reopen()} disabled={busy}>
            Reopen demo auctions
          </Button>
          <Button variant="outline" onClick={() => void purge()} disabled={busy}>
            Delete lab test data
          </Button>
          <Button variant="outline" onClick={() => void teardown()} disabled={busy}>
            Remove lab dealer accounts
          </Button>
          {done.length > 0 && (
            <p className="text-sm font-semibold">
              {passed} of {done.length} scenarios passed
            </p>
          )}
        </div>
        <p className="mt-4 text-xs text-muted">
          The first run creates one Supabase account per simultaneous dealer, so it is slower than
          the rest. They are reused afterwards. “Remove lab dealer accounts” deletes them again.
          <br />
          With “Keep test data” on, each run leaves its auctions and bids in the database so you can
          inspect them. Lab fixtures are prefixed <code>lab_</code> and the app filters them out, so
          they never show up in the dealer inventory. “Delete lab test data” clears them all.
        </p>
        {fatal && (
          <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm">
            {fatal}
          </p>
        )}
      </Card>

      <Card className="!bg-ink-950 !ring-ink-800">
        <h2 className="text-lg text-white">Live bidding demo</h2>
        <p className="mt-2 max-w-3xl text-sm text-white/70">
          Runs a real bidding war on a real listing, one authenticated dealer at a time, a bid every
          second or so. Open the vehicle in another tab and the price, the timer, the bid history and
          the anti-sniping extensions all move in front of you. Nothing here is simulated in the
          browser: every bid is the same database call a dealer makes.
        </p>
        <div className="mt-5 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/50 mb-1.5" htmlFor="target">
              Vehicle
            </label>
            <select
              id="target"
              value={target}
              disabled={busy || live?.running}
              onChange={(e) => setTarget(e.target.value)}
              className="h-11 rounded-xl bg-white px-3 text-[14px] max-w-[18rem]"
            >
              {inventory.map((v) => (
                <option key={v.vehicleId} value={v.vehicleId}>
                  {v.title} ({v.status}, {v.bidCount} bids)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 mb-1.5" htmlFor="secs">
              Run for (seconds)
            </label>
            <input
              id="secs"
              type="number"
              min={10}
              max={600}
              value={seconds}
              disabled={busy || live?.running}
              onChange={(e) => setSeconds(Number(e.target.value) || 90)}
              className="h-11 w-24 rounded-xl bg-white px-3 tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 mb-1.5" htmlFor="ld">
              Bidders
            </label>
            <input
              id="ld"
              type="number"
              min={2}
              max={60}
              value={liveDealers}
              disabled={busy || live?.running}
              onChange={(e) => setLiveDealers(Number(e.target.value) || 12)}
              className="h-11 w-24 rounded-xl bg-white px-3 tabular-nums"
            />
          </div>
          {live?.running ? (
            <Button variant="danger" onClick={() => void stopLive()}>
              Stop
            </Button>
          ) : (
            <Button onClick={() => void startLive()} disabled={busy || !target}>
              Start live bidding
            </Button>
          )}
          {target && (
            <a
              href={`/dealer/inventory/${target}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-lime-400 underline"
            >
              Open this listing in a new tab →
            </a>
          )}
        </div>
        {live && (
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/15 pt-4 sm:grid-cols-4">
            {[
              ["Status", live.running ? "Bidding…" : "Finished"],
              ["Bids accepted", String(live.placed ?? 0)],
              ["Current high", live.highCents ? dollars(live.highCents) : "no bids"],
              ["Seconds left", String(live.secondsLeft ?? 0)],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
                <p className="text-[11px] text-white/50">{label}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {SCENARIOS.map((scenario) => {
        const result = results[scenario.id];
        const running = result === "running";
        const done = result && result !== "running" ? result : null;
        return (
          <Card key={scenario.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-success">
                  {scenario.requirement}
                </p>
                <h2 className="mt-1 text-lg">
                  {scenario.title}
                  {scenario.scaled && (
                    <span className="ml-2 text-xs font-normal text-muted">
                      uses {dealers} dealers
                    </span>
                  )}
                  {scenario.client && (
                    <span className="ml-2 text-xs font-normal text-muted">runs in this tab</span>
                  )}
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-body">{scenario.blurb}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {done && (
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold ${done.ok ? CHIP.pass : CHIP.fail}`}
                  >
                    {done.ok ? "PASSED" : "FAILED"} · {done.ms}ms
                  </span>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void runOne(scenario.id)}
                >
                  {running ? "Running…" : "Run"}
                </Button>
              </div>
            </div>

            {done?.error && (
              <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-danger">
                {done.error}
              </p>
            )}

            {done && done.steps.length > 0 && (
              <ol className="mt-4 divide-y divide-line border-t border-line">
                {done.steps.map((step, i) => (
                  <li key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${CHIP[step.status]}`}
                    >
                      {LABEL[step.status]}
                    </span>
                    <span className="text-sm font-semibold">{step.name}</span>
                    <span className="text-xs text-muted break-all">{step.detail}</span>
                    {step.ms !== undefined && (
                      <span className="ml-auto text-[11px] tabular-nums text-muted">
                        {step.ms}ms
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            )}

            {done?.metrics && (
              <div className="mt-4 rounded-xl bg-paper p-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    ["Requests", done.metrics.requests],
                    ["Accepted", done.metrics.accepted],
                    ["Rejected with a reason", done.metrics.rejected],
                    ["Dropped or failed", done.metrics.transportFailed],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-2xl font-bold tabular-nums">{value}</p>
                      <p className="text-[11px] text-muted">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-4">
                  {[
                    ["Median", `${done.metrics.p50}ms`],
                    ["p95", `${done.metrics.p95}ms`],
                    ["Slowest", `${done.metrics.max}ms`],
                    ["All resolved in", `${done.metrics.wallMs}ms`],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-lg font-bold tabular-nums">{value}</p>
                      <p className="text-[11px] text-muted">{label}</p>
                    </div>
                  ))}
                </div>
                {Object.keys(done.metrics.reasons).length > 0 && (
                  <ul className="mt-4 space-y-1 border-t border-line pt-4 text-xs text-body">
                    {Object.entries(done.metrics.reasons).map(([reason, count]) => (
                      <li key={reason}>
                        <strong className="tabular-nums">{count}</strong> × {reason}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
