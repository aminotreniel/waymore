"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { PortalHeader } from "@/components/portal/PortalShell";
import { Countdown } from "@/components/ui/Countdown";
import { StatTile, LinkRow } from "@/components/ui/Misc";
import { DataTable } from "@/components/portal/DataTable";
import { DealerMark } from "@/components/brand/DealerMark";
import { IconAlert, IconCalendar, IconTruck } from "@/components/icons";
import { adminMetrics, adminUpcoming, approvalQueue, bids, currentEvent, offers } from "@/lib/data/marketplace";
import { listedVehicles, vehicleById } from "@/lib/data/vehicles";
import { dealerById, dealers, sellers } from "@/lib/data/people";
import { CURRENT_EVENT_CLOSES_AT, eventDeadlineLabel } from "@/lib/data/clock";
import { money, relativeTime, vehicleTitle } from "@/lib/format";
import { Time } from "@/components/ui/Time";

export default function AdminOverview() {
  const topVehicles = [...listedVehicles].sort((a, b) => b.bidCount - a.bidCount).slice(0, 5);
  const recentOffers = [...offers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1500px]">
      <PortalHeader
        title="Overview"
        lead={`${currentEvent.name} · ${currentEvent.region}`}
        action={
          <div className="flex items-center gap-4 rounded-2xl bg-surface ring-1 ring-line shadow-card px-5 py-3">
            <span className="text-[12.5px] font-semibold text-muted">Event closes in</span>
            <Countdown to={CURRENT_EVENT_CLOSES_AT} size="sm" />
          </div>
        }
      />

      {approvalQueue.length > 0 && (
        <Card className="!bg-warn-bg !ring-warn/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-warn ring-1 ring-warn/20">
                <IconAlert size={20} />
              </span>
              <div>
                <p className="text-[15px] font-bold text-heading">
                  {approvalQueue.length} listing{approvalQueue.length === 1 ? "" : "s"} waiting on review
                </p>
                <p className="text-[13px] text-body mt-0.5">
                  Oldest submitted {relativeTime(approvalQueue[approvalQueue.length - 1].submittedAt)}.
                  Listings must clear review before the event locks.
                </p>
              </div>
            </div>
            <ButtonLink href="/admin/approvals" variant="dark" size="sm" withArrow>
              Open queue
            </ButtonLink>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {adminMetrics.map((m) => (
          <StatTile key={m.key} value={m.value} label={m.label} hint={m.hint ?? undefined} delta={m.delta} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] items-start">
        <div className="space-y-5 min-w-0">
          <Card className="!p-0 overflow-hidden">
            <div className="p-5 border-b border-line">
              <CardHeader
                className="!mb-0"
                title="Most contested vehicles"
                subtitle="Where the bidding is heaviest this event"
                action={<LinkRow href="/admin/vehicles">All vehicles</LinkRow>}
              />
            </div>
            <DataTable
              rows={topVehicles}
              rowKey={(v) => v.id}
              columns={[
                {
                  key: "vehicle",
                  header: "Vehicle",
                  cell: (v) => (
                    <Link href={`/dealer/inventory/${v.id}`} className="flex items-center gap-3 group">
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-lg">
                        <Image src={v.photos[0].url} alt="" fill sizes="44px" className="object-cover" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold truncate group-hover:text-lime-600 transition-colors">
                          {vehicleTitle(v)}
                        </span>
                        <span className="block text-[12px] text-muted">
                          {v.city}, {v.state}
                        </span>
                      </span>
                    </Link>
                  ),
                },
                { key: "bids", header: "Bids", align: "right", cell: (v) => <span className="tabular-nums">{v.bidCount}</span> },
                { key: "views", header: "Views", align: "right", cell: (v) => <span className="tabular-nums">{v.viewCount}</span> },
                {
                  key: "high",
                  header: "High bid",
                  align: "right",
                  cell: (v) => {
                    const top = bids.filter((b) => b.vehicleId === v.id).sort((a, b) => b.amount - a.amount)[0];
                    return (
                      <span className="font-display font-bold tabular-nums">
                        {top ? money(top.amount) : "—"}
                      </span>
                    );
                  },
                },
                {
                  key: "est",
                  header: "Estimate",
                  align: "right",
                  cell: (v) => (
                    <span className="text-muted tabular-nums whitespace-nowrap">
                      {money(v.estimateLow)}–{money(v.estimateHigh)}
                    </span>
                  ),
                },
              ]}
            />
          </Card>

          <Card className="!p-0 overflow-hidden">
            <div className="p-5 border-b border-line">
              <CardHeader
                className="!mb-0"
                title="Recent offers"
                subtitle="Live across all sellers"
                action={<LinkRow href="/admin/offers">All offers</LinkRow>}
              />
            </div>
            <DataTable
              rows={recentOffers}
              rowKey={(o) => o.id}
              minWidth={720}
              columns={[
                {
                  key: "dealer",
                  header: "Dealer",
                  cell: (o) => {
                    const d = dealerById(o.dealerId)!;
                    return (
                      <span className="flex items-center gap-2.5">
                        <DealerMark initials={d.markInitials} color={d.markColor} size={30} />
                        <span className="font-medium truncate">{d.name}</span>
                      </span>
                    );
                  },
                },
                {
                  key: "vehicle",
                  header: "Vehicle",
                  cell: (o) => (
                    <span className="text-body truncate block max-w-[190px]">
                      {vehicleTitle(vehicleById(o.vehicleId)!)}
                    </span>
                  ),
                },
                {
                  key: "amount",
                  header: "Amount",
                  align: "right",
                  cell: (o) => <span className="font-display font-bold tabular-nums">{money(o.amount)}</span>,
                },
                { key: "status", header: "Status", cell: (o) => <StatusBadge status={o.status} /> },
                {
                  key: "when",
                  header: "Placed",
                  align: "right",
                  cell: (o) => <Time iso={o.createdAt} format="relative" className="text-muted whitespace-nowrap" />,
                },
              ]}
            />
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="This event" action={<StatusBadge status={currentEvent.status} />} />
            <dl className="space-y-2.5 text-[13.5px]">
              {[
                ["Closes", eventDeadlineLabel(CURRENT_EVENT_CLOSES_AT)],
                ["Vehicles", String(listedVehicles.length)],
                ["Registered dealers", String(currentEvent.registeredDealers)],
                ["Bids placed", String(currentEvent.totalBids)],
                ["Live offers", String(offers.filter((o) => o.status === "pending").length)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-muted shrink-0">{k}</dt>
                  <dd className="text-heading font-medium text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4">
              <ButtonLink href="/admin/events" fullWidth size="sm" variant="outline" withArrow>
                Manage events
              </ButtonLink>
            </div>
          </Card>

          <Card>
            <CardHeader title="Upcoming" />
            <ul className="space-y-3.5">
              {adminUpcoming.map((u) => (
                <li key={u.label} className="flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-mint-50 text-ink-700">
                    {u.label === "Payout batch" ? <IconTruck size={16} /> : <IconCalendar size={16} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-semibold text-heading">{u.label}</span>
                    <span className="block text-[12.5px] text-muted">{u.value}</span>
                    <Time iso={u.at} className="block text-[12px] text-muted mt-0.5" />
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Marketplace health" />
            <dl className="space-y-3">
              {[
                ["Active dealers", `${dealers.filter((d) => d.status === "active").length} of ${dealers.length}`],
                ["Pending dealer applications", String(dealers.filter((d) => d.status === "pending").length)],
                ["Registered sellers", String(sellers.length)],
                ["Listings awaiting review", String(approvalQueue.length)],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <dt className="text-[13px] text-body">{k}</dt>
                  <dd>
                    <Badge tone={k.includes("Pending") || k.includes("awaiting") ? "warn" : "neutral"}>{v}</Badge>
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
