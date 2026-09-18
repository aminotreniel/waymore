"use client";
import { useAuctions } from "@/context/AuctionContext";
import type { Auction } from "@/lib/auction";
export function AuctionTimer({
  auction,
  className = "",
}: {
  auction: Auction;
  className?: string;
}) {
  const { now } = useAuctions();
  const remaining = Math.max(
    0,
    Math.ceil((Date.parse(auction.ends_at) - now) / 1000),
  );
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  return (
    <span
      className={`font-display font-bold tabular-nums ${className}`}
      aria-label="Auction time remaining"
    >
      {auction.status === "closed"
        ? "Closed"
        : !now
          ? "Syncing…"
          : !remaining
            ? "Finalizing…"
            : `${h ? `${h}h ` : ""}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`}
    </span>
  );
}
