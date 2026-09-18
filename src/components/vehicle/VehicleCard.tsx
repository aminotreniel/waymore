"use client";

import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { IconHeart } from "@/components/icons";
import { useSession } from "@/context/SessionContext";
import { useAuctions } from "@/context/AuctionContext";
import { AuctionTimer } from "@/components/auction/AuctionTimer";
import { currentRound } from "@/lib/auction";

import { cx, miles, money, vehicleShortTitle } from "@/lib/format";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const { isSaved, toggleSaved } = useSession();
  const saved = isSaved(vehicle.id);
  const { data } = useAuctions();
  const auction = currentRound(data.auctions, vehicle.id);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface ring-1 ring-line shadow-card transition-shadow hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden bg-paper">
        <Image
          src={vehicle.photos[0].url}
          alt={vehicleShortTitle(vehicle)}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {vehicle.tag && (
          <span className="absolute left-3 top-3">
            <Badge
              tone="lime"
              className="!bg-lime-400 !text-ink-950 !ring-0 shadow-card"
            >
              {vehicle.tag}
            </Badge>
          </span>
        )}
        <button
          onClick={() => toggleSaved(vehicle.id)}
          aria-pressed={saved}
          aria-label={
            saved
              ? `Remove ${vehicleShortTitle(vehicle)} from saved`
              : `Save ${vehicleShortTitle(vehicle)}`
          }
          className={cx(
            "absolute right-3 top-3 grid size-9 place-items-center rounded-full backdrop-blur transition-colors",
            saved
              ? "bg-lime-400 text-ink-950"
              : "bg-white/85 text-ink-700 hover:bg-white hover:text-danger",
          )}
        >
          <IconHeart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[15.5px] leading-snug">
          <Link
            href={`/dealer/inventory/${vehicle.id}`}
            className="after:absolute after:inset-0"
          >
            {vehicleShortTitle(vehicle)} {vehicle.trim}
          </Link>
        </h3>
        <p className="mt-1 text-[12.5px] text-muted">
          {miles(vehicle.mileage)} &nbsp;|&nbsp; {vehicle.city}, {vehicle.state}
        </p>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {vehicle.titleStatus === "clean" && (
            <Badge tone="neutral" dot>
              Clean Title
            </Badge>
          )}
          {vehicle.owners === 1 && <Badge tone="neutral">1 Owner</Badge>}
          {["AWD", "4x4"].includes(vehicle.drivetrain) && (
            <Badge tone="neutral">{vehicle.drivetrain}</Badge>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-3.5">
          <div>
            <p className="text-[11px] text-muted">Current High Bid</p>
            <p className="font-display font-bold text-[17px] text-heading leading-tight tabular-nums">
              {auction?.high_bid_cents
                ? money(auction.high_bid_cents / 100)
                : "No bids yet"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-muted">Time Left</p>
            {auction ? (
              <AuctionTimer
                auction={auction}
                className="block text-[17px] text-heading"
              />
            ) : (
              <span>Not scheduled</span>
            )}
          </div>
          <span className="relative z-10 inline-flex h-9 items-center rounded-lg bg-white px-3 text-[12.5px] font-display font-semibold text-ink-900 ring-1 ring-inset ring-line-strong transition-colors group-hover:bg-ink-900 group-hover:text-white group-hover:ring-ink-900">
            View Details
          </span>
        </div>
      </div>
    </article>
  );
}
