"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { PortalHeader } from "@/components/portal/PortalShell";
import { Tabs } from "@/components/ui/Disclosure";
import { OfferRow } from "@/components/portal/OfferCard";
import { Callout, EmptyState, StatTile } from "@/components/ui/Misc";
import { Countdown } from "@/components/ui/Countdown";
import { IconTag, IconTrophy } from "@/components/icons";
import { useSession } from "@/context/SessionContext";
import { vehicleById } from "@/lib/data/vehicles";
import { offersForVehicle } from "@/lib/data/marketplace";
import { CURRENT_EVENT_CLOSES_AT, eventDeadlineLabel } from "@/lib/data/clock";
import { money, vehicleTitle } from "@/lib/format";

export default function SellerOffersPage() {
  const { seller } = useSession();
  const vehicle = vehicleById(seller.vehicleIds[0])!;
  const all = offersForVehicle(vehicle.id);
  const [tab, setTab] = useState("live");

  const live = all.filter((o) => o.status === "pending");
  const countered = all.filter((o) => o.status === "countered");
  const closed = all.filter((o) => ["declined", "expired", "withdrawn"].includes(o.status));

  const shown = tab === "live" ? live : tab === "countered" ? countered : closed;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px]">
      <PortalHeader
        title="Offers"
        lead={`Dealer offers on your ${vehicleTitle(vehicle)}. Nothing is binding until you accept.`}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] items-start">
        <div className="space-y-5 min-w-0">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile
              value={live.length ? money(live[0].amount) : "—"}
              label="Highest live offer"
              tone="lime"
              hint={live.length ? "No obligation to accept" : undefined}
            />
            <StatTile value={live.length} label="Live offers" hint="Awaiting your decision" />
            <StatTile value={all.length} label="Total offers received" hint="Including closed" />
          </div>

          <Card className="!p-0 overflow-hidden">
            <div className="px-5 sm:px-6 pt-4 border-b border-line">
              <Tabs
                tabs={[
                  { key: "live", label: "Live", count: live.length },
                  { key: "countered", label: "Countered", count: countered.length },
                  { key: "closed", label: "Closed", count: closed.length },
                ]}
                active={tab}
                onChange={setTab}
              />
            </div>

            <div className="p-4 sm:p-5">
              {shown.length === 0 ? (
                <EmptyState
                  icon={<IconTag size={22} />}
                  title="Nothing here yet"
                  body={
                    tab === "live"
                      ? "New dealer offers will appear here as bidding progresses."
                      : "Offers move into this tab once they're countered or closed."
                  }
                />
              ) : (
                <ul className="space-y-3">
                  {shown.map((o) => (
                    <li key={o.id}>
                      <OfferRow offer={o} href={`/seller/offers/${o.id}`} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="!bg-mint-50 !ring-lime-200">
            <h3 className="text-[15.5px]">Bidding closes in</h3>
            <div className="mt-3.5">
              <Countdown to={CURRENT_EVENT_CLOSES_AT} size="sm" />
            </div>
            <p className="mt-3.5 text-[12.5px] leading-relaxed text-body">
              {eventDeadlineLabel(CURRENT_EVENT_CLOSES_AT)}. Offers stay open for 48 hours after
              that.
            </p>
          </Card>

          <Card>
            <CardHeader title="How to read an offer" />
            <ul className="space-y-3.5">
              {[
                { t: "The number is what you receive", d: "No fees are deducted. Liens are handled separately." },
                { t: "Counters are one round", d: "Suggest a price and the dealer accepts, re-counters, or stands pat." },
                { t: "Declining is free", d: "You can decline everything and relist next week at no cost." },
              ].map((r) => (
                <li key={r.t}>
                  <p className="text-[13.5px] font-semibold text-heading">{r.t}</p>
                  <p className="text-[12.5px] text-body mt-0.5 leading-snug">{r.d}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Callout tone="success" icon={<IconTrophy size={17} />}>
            <strong>You&apos;re in the driver&apos;s seat.</strong> Accept the offer you like best —
            or none of them.
          </Callout>
        </div>
      </div>
    </div>
  );
}
