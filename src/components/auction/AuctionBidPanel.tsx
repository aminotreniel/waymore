"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuctions } from "@/context/AuctionContext";
import { supabase } from "@/lib/supabase/client";
import {
  minimumBid,
  outcomeLabel,
  dollars,
  type Auction,
  type HistoryBid,
} from "@/lib/auction";
import { AuctionTimer } from "./AuctionTimer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";

export function AuctionBidPanel({ auction }: { auction: Auction }) {
  const { data, now, refresh, session } = useAuctions();
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  const [history, setHistory] = useState<HistoryBid[]>([]);
  const [historyError, setHistoryError] = useState("");
  const [more, setMore] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const sending = useRef(false);
  const historyRequest = useRef(0);
  const [pending, setPending] = useState<{ id: string; amount: number } | null>(
    null,
  );
  const storageKey = `waymore-bid:${session?.user.id}:${auction.id}`;
  const minimum = minimumBid(auction);
  const active =
    auction.status === "open" &&
    now > 0 &&
    now >= Date.parse(auction.opens_at) &&
    now < Date.parse(auction.ends_at);
  const mine = data.my_bids.find((b) => b.auction_id === auction.id);
  const winning = auction.high_is_mine;
  // The database refuses a bid from the dealer already holding the high bid.
  const locked = winning && auction.status === "open" && !pending;
  const loadHistory = useCallback(
    async (before?: number) => {
      const ticket = ++historyRequest.current;
      setLoadingHistory(true);
      const { data: result, error } = await supabase.rpc("auction_snapshot", {
        p_auction_id: auction.id,
        p_before_sequence: before ?? null,
      });
      if (ticket !== historyRequest.current) return;
      setLoadingHistory(false);
      if (error) {
        setHistoryError(error.message);
        return;
      }
      setHistoryError("");
      const rows = result.bids as HistoryBid[];
      // Merge rather than replace: a new bid refreshes the first page, and older
      // pages the dealer has already loaded stay where they are.
      setHistory((current) => {
        const byId = new Map(current.map((b) => [b.id, b]));
        for (const b of rows) byId.set(b.id, b);
        return [...byId.values()].sort((x, y) => y.sequence - x.sequence);
      });
      setMore((previous) =>
        before ? rows.length === 50 : previous || rows.length === 50,
      );
    },
    [auction.id],
  );
  const invalidateHistory = useCallback(() => {
    historyRequest.current++;
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => void loadHistory(), 0);
    return () => {
      clearTimeout(timer);
      invalidateHistory();
    };
  }, [loadHistory, auction.version, invalidateHistory]);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const value = JSON.parse(saved);
          if (
            typeof value.id === "string" &&
            Number.isSafeInteger(value.amount)
          )
            setPending(value);
        }
      } catch {
        /* local storage is optional; the server still deduplicates the active request */
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [storageKey]);
  const clearPending = () => {
    setPending(null);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  };
  async function submit() {
    if (sending.current) return;
    const cents = pending?.amount ?? Number(amount) * 100;
    if (!Number.isSafeInteger(cents) || cents <= 0) {
      setFailure("Enter a valid whole-dollar bid.");
      return;
    }
    sending.current = true;
    setBusy(true);
    setFailure("");
    setMessage("");
    const intent = pending ?? { id: crypto.randomUUID(), amount: cents };
    setPending(intent);
    try {
      localStorage.setItem(storageKey, JSON.stringify(intent));
    } catch {}
    try {
      try {
        const { data: result, error } = await supabase.rpc(
          "place_auction_bid",
          {
            p_auction_id: auction.id,
            p_amount_cents: intent.amount,
            p_request_id: intent.id,
          },
        );
        if (error) {
          // Only a definitive database rejection clears the intent. Transport failures retain it.
          const definitive = Boolean(
            error.code &&
            !error.code.startsWith("PGRST") &&
            !error.code.startsWith("08"),
          );
          if (definitive) clearPending();
          setFailure(
            error.message +
              (!definitive
                ? " Your result is unconfirmed. Retry this same bid to check it safely."
                : ""),
          );
        } else {
          clearPending();
          setOpen(false);
          setAmount("");
          setMessage(
            `${dollars(result.bid.amount_cents)} bid ${result.duplicate ? "was already recorded" : "accepted"}.`,
          );
        }
      } catch {
        setFailure(
          "Connection lost. Retry to check this same bid safely; it will not be placed twice.",
        );
      }
      // Reloading is a separate concern. A failed refresh must never be reported
      // as a failed bid: the bid above has already been decided by the database.
      // It stays inside the busy window so the button cannot be pressed again
      // against the pre-refresh minimum.
      try {
        await refresh();
        await loadHistory();
      } catch {}
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }
  async function demo(seconds: number) {
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    setFailure("");
    const name =
      auction.status === "closed"
        ? "start_demo_auction"
        : "prepare_demo_countdown";
    const args =
      auction.status === "closed"
        ? { p_vehicle_id: auction.vehicle_id, p_duration_seconds: seconds }
        : { p_auction_id: auction.id, p_duration_seconds: seconds };
    try {
      const { error } = await supabase.rpc(name, args);
      if (error) setFailure(error.message);
      await refresh();
    } catch {
      setFailure("Could not reach the server. Check the connection and retry.");
    } finally {
      // Without this the controls stay disabled until the page is reloaded.
      sending.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="space-y-5">
      <Card className="!bg-ink-950 !ring-ink-800 !p-6">
        <p className="text-xs uppercase tracking-widest font-bold text-lime-400">
          {auction.status === "closed" ? "Final high bid" : "Current high bid"}
        </p>
        <p className="mt-3 text-4xl font-display font-extrabold text-white">
          {auction.high_bid_cents === null
            ? "No bids yet"
            : dollars(auction.high_bid_cents)}
        </p>
        <p className="mt-3 text-sm text-lime-400">
          {auction.status === "closed"
            ? `${auction.won_by_me ? "You finished highest · " : ""}${outcomeLabel(auction)}`
            : winning
              ? "You're the high bidder"
              : mine
                ? `Outbid · your latest bid ${dollars(mine.amount_cents)}`
                : `${auction.bid_count} accepted bids`}
        </p>
        <div className="mt-5 border-t border-white/15 pt-4">
          <p className="text-xs text-white/60 mb-2">
            {auction.status === "closed"
              ? "Auction complete"
              : "Time remaining"}
          </p>
          <AuctionTimer auction={auction} className="text-4xl text-white" />
          <p className="mt-3 text-xs text-white/60">
            Closes {new Date(auction.ends_at).toLocaleString()} (your local
            time)
          </p>
        </div>
        {auction.extension_count > 0 && (
          <p role="status" className="mt-3 text-sm text-lime-400">
            Extended {auction.extension_count}{" "}
            {auction.extension_count === 1 ? "time" : "times"} · bidding is
            still competitive.
          </p>
        )}
        <Button
          fullWidth
          className="mt-5"
          disabled={(!active && !pending) || busy || !data.dealer_id || locked}
          onClick={() => {
            setAmount(String((pending?.amount ?? minimum) / 100));
            setFailure("");
            setOpen(true);
          }}
        >
          {pending
            ? "Check previous bid"
            : locked
              ? "You hold the high bid"
              : active
                ? mine
                  ? "Raise my bid"
                  : "Place a bid"
                : auction.status === "closed"
                  ? "Bidding closed"
                  : "Waiting for server"}
        </Button>
        <p className="mt-3 text-xs text-white/60">
          {locked
            ? "You cannot bid against your own high bid. The button reopens when another dealer raises."
            : `Minimum ${dollars(minimum)} · ${dollars(auction.increment_cents)} increment`}
        </p>
        <p className="mt-3 text-xs text-white/60">
          An accepted bid in the final {auction.extension_window_seconds}{" "}
          seconds adds {auction.extension_seconds} seconds. Extensions continue
          until bidding stops.
        </p>
      </Card>
      {message && (
        <p
          role="status"
          className="rounded-xl bg-mint-50 p-4 text-sm text-success"
        >
          {message}
        </p>
      )}
      {failure && !open && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-danger"
        >
          {failure}
        </p>
      )}
      <Card>
        <h2 className="text-lg">Complete bid history</h2>
        <p className="mt-1 text-xs text-muted">
          {auction.bid_count} accepted bids · newest first · exact UTC
          timestamps
        </p>
        {historyError && (
          <p role="alert" className="my-3 text-sm text-danger">
            {historyError}{" "}
            <button className="underline" onClick={() => void loadHistory()}>
              Retry
            </button>
          </p>
        )}
        {!history.length && !historyError && (
          <p className="py-6 text-sm text-muted">
            {loadingHistory
              ? "Loading bids…"
              : "No bids yet. Be the first dealer to bid."}
          </p>
        )}
        <ol className="mt-3 divide-y divide-line">
          {history.map((b) => (
            <li key={b.id} className="py-3">
              <div className="flex justify-between gap-3 text-sm">
                <strong>{b.mine ? "You" : b.bidder_label}</strong>
                <strong>{dollars(b.amount_cents)}</strong>
              </div>
              <p className="mt-1 text-[11px] text-muted break-all">
                #{b.sequence} ·{" "}
                <time dateTime={b.accepted_at}>
                  {b.accepted_at.replace("T", " ")}
                </time>
                {b.id === auction.high_bid_id ? " · High bid" : ""}
              </p>
            </li>
          ))}
        </ol>
        {more && (
          <Button
            variant="outline"
            size="sm"
            disabled={loadingHistory}
            onClick={() => void loadHistory(history.at(-1)?.sequence)}
          >
            Load older bids
          </Button>
        )}
      </Card>
      {data.is_admin && (
        <Card>
          <h2 className="text-base">Demo controls</h2>
          <p className="my-3 text-xs text-muted">
            Run a short round to demonstrate extensions and closing. An open
            auction can only be shortened before its first bid. Closed rounds
            remain in the database.
          </p>
          <div className="flex flex-wrap gap-2">
            {[60, 180].map((s) => (
              <Button
                key={s}
                variant="outline"
                size="sm"
                disabled={
                  busy || (auction.status === "open" && auction.bid_count > 0)
                }
                onClick={() => void demo(s)}
              >
                {auction.status === "closed" ? "New round:" : "Set timer:"} {s}s
              </Button>
            ))}
          </div>
        </Card>
      )}
      <Modal
        open={open}
        onClose={() => {
          if (!busy) setOpen(false);
        }}
        title="Confirm your bid"
        description="Demo auction · no purchase or payment is created."
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={
                busy ||
                (!pending &&
                  (!active ||
                    locked ||
                    Number(amount) * 100 < minimum ||
                    !Number.isSafeInteger(Number(amount) * 100)))
              }
              onClick={() => void submit()}
            >
              {busy
                ? "Submitting…"
                : pending
                  ? "Check / retry bid"
                  : `Bid ${dollars(Number(amount) * 100 || 0)}`}
            </Button>
          </div>
        }
      >
        <Input
          label="Your bid (USD)"
          prefix="$"
          inputMode="numeric"
          value={amount}
          disabled={busy || Boolean(pending)}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
          hint={`Current minimum: ${dollars(minimum)}`}
        />
        {pending && (
          <p className="mt-3 text-sm text-body">
            A previous submission needs confirmation. Retry checks the same
            request, even if the auction has closed.
          </p>
        )}
        {failure && (
          <p role="alert" className="mt-4 text-danger text-sm">
            {failure}
          </p>
        )}
      </Modal>
    </div>
  );
}
