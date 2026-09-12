"use client";

import Image from "next/image";
import { Card, CardHeader } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { PortalHeader } from "@/components/portal/PortalShell";
import { Countdown } from "@/components/ui/Countdown";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { StatTile, Timeline } from "@/components/ui/Misc";
import { IconCalendar } from "@/components/icons";
import { listedVehicles } from "@/lib/data/vehicles";
import { events } from "@/lib/data/marketplace";
import { CURRENT_EVENT_CLOSES_AT, eventDeadlineLabel } from "@/lib/data/clock";
import { money, number } from "@/lib/format";
import { marketingImages } from "@/lib/images";
import { Time } from "@/components/ui/Time";

export default function DealerEventPage() {
  const [current, next, previous] = events;

  const byBody = ["Sedan", "SUV", "Truck"].map((b) => ({
    body: b,
    count: listedVehicles.filter((v) => v.bodyStyle === b).length,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1500px]">
      <PortalHeader
        title="This Week's Event"
        lead={`${current.name} · ${current.region}`}
        action={<StatusBadge status={current.status} />}
      />

      <section className="relative overflow-hidden rounded-2xl bg-ink-950">
        <Image
          src={marketingImages.dealerLot}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[60%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/92 to-ink-950/35" />
        <div className="relative p-6 sm:p-8 flex flex-wrap items-center justify-between gap-8">
          <div>
            <p className="inline-flex items-center gap-2 text-[12.5px] font-semibold uppercase tracking-[0.13em] text-lime-400">
              <IconCalendar size={15} />
              Bidding closes
            </p>
            <p className="mt-2.5 text-white text-[21px] sm:text-[25px] font-display font-bold">
              {eventDeadlineLabel(CURRENT_EVENT_CLOSES_AT)}
            </p>
            <p className="mt-1.5 text-[14px] text-white/60">
              Opened <Time iso={current.opensAt} format="longdate" />
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-7">
            <Countdown to={CURRENT_EVENT_CLOSES_AT} tone="light" />
            <ButtonLink href="/dealer/inventory" size="lg" withArrow>
              Browse all vehicles
            </ButtonLink>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile value={listedVehicles.length} label="Vehicles in this event" hint="All accepting bids" />
        <StatTile value={number(current.registeredDealers)} label="Registered dealers" hint="Bidding this week" />
        <StatTile value={number(current.totalBids)} label="Bids placed" hint="Across all vehicles" />
        <StatTile
          value={money(Math.round(listedVehicles.reduce((n, v) => n + (v.estimateLow + v.estimateHigh) / 2, 0)))}
          label="Estimated event value"
          hint="Midpoint of seller estimates"
          tone="lime"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px] items-start">
        <Card className="!p-0 overflow-hidden min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-line">
            <CardHeader
              className="!mb-0"
              title="Vehicles in this event"
              subtitle="Sorted by dealer interest"
            />
            <div className="flex flex-wrap gap-2">
              {byBody.map((b) => (
                <Badge key={b.body} tone="neutral">
                  {b.count} {b.body.toLowerCase()}
                  {b.count === 1 ? "" : "s"}
                </Badge>
              ))}
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {[...listedVehicles]
                .sort((a, b) => b.bidCount - a.bidCount)
                .map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="How the event runs" />
            <Timeline
              steps={[
                { label: "Listings lock", description: "New sellers stop entering this event 24 hours before close.", completedAt: current.opensAt },
                { label: "Bidding open", description: "All registered dealers can bid on every vehicle.", completedAt: null, active: true },
                { label: "Bidding closes", description: eventDeadlineLabel(CURRENT_EVENT_CLOSES_AT), completedAt: null },
                { label: "Sellers review", description: "Sellers have 48 hours to accept, counter, or decline.", completedAt: null },
                { label: "Pickup & payment", description: "Winning dealers collect and pay, usually within three days.", completedAt: null },
              ]}
            />
          </Card>

          <Card>
            <CardHeader title="Next event" />
            <Time iso={next.closesAt} format="longdate" className="block text-[14.5px] font-semibold text-heading" />
            <p className="mt-1 text-[13px] text-body">
              Opens the moment this one closes. Vehicles that don&apos;t sell roll over automatically.
            </p>
            <div className="mt-4 pt-4 border-t border-line">
              <StatusBadge status={next.status} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Last event" subtitle={<Time iso={previous.closesAt} format="longdate" />} />
            <dl className="space-y-2.5 text-[13.5px]">
              {[
                ["Vehicles", String(previous.vehicleIds.length)],
                ["Bids placed", number(previous.totalBids)],
                ["Dealers", number(previous.registeredDealers)],
                ["Gross volume", money(previous.grossVolume)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-heading font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
