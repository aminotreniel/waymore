"use client";

import Link from "next/link";
import type { Offer } from "@/lib/types";
import { DealerMark } from "@/components/brand/DealerMark";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { IconClock, IconStar } from "@/components/icons";
import { dealerById } from "@/lib/data/people";
import { money, cx } from "@/lib/format";
import { Time } from "@/components/ui/Time";

export function OfferRow({ offer, href }: { offer: Offer; href: string }) {
  const dealer = dealerById(offer.dealerId)!;
  const live = offer.status === "pending";

  return (
    <Link
      href={href}
      className={cx(
        "flex flex-wrap items-center gap-4 rounded-2xl bg-surface ring-1 p-4 sm:p-5 transition-all hover:shadow-lift",
        offer.isTopOffer ? "ring-2 ring-lime-400" : "ring-line shadow-card hover:ring-ink-200",
      )}
    >
      <DealerMark initials={dealer.markInitials} color={dealer.markColor} size={46} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[15px] font-semibold text-heading truncate">{dealer.name}</span>
          {offer.isTopOffer && <Badge tone="lime">Top offer</Badge>}
        </div>
        <p className="mt-0.5 text-[12.5px] text-muted flex items-center gap-2 flex-wrap">
          <span>{dealer.city}, {dealer.state}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <IconStar size={12} fill="currentColor" strokeWidth={1} className="text-warn" />
            {dealer.rating.toFixed(1)}
          </span>
          <span aria-hidden="true">·</span>
          <Time iso={offer.createdAt} format="relative" />
        </p>
        {offer.notes && (
          <p className="mt-1.5 text-[12.5px] text-body line-clamp-1 italic">“{offer.notes}”</p>
        )}
      </div>

      <div className="text-right shrink-0">
        <p className="font-display font-extrabold text-[22px] text-heading leading-none tabular-nums">
          {money(offer.amount)}
        </p>
        <div className="mt-2 flex items-center justify-end gap-2">
          {live ? (
            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-muted">
              <IconClock size={12} />
              <Time iso={offer.expiresAt} format="countdown" suffix=" left" />
            </span>
          ) : (
            <StatusBadge status={offer.status} />
          )}
        </div>
        {offer.counterAmount && (
          <p className="mt-1.5 text-[12px] text-info font-medium">
            You countered {money(offer.counterAmount)}
          </p>
        )}
      </div>
    </Link>
  );
}
