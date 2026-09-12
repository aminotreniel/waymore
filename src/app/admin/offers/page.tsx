"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { PortalHeader } from "@/components/portal/PortalShell";
import { Tabs } from "@/components/ui/Disclosure";
import { DataTable } from "@/components/portal/DataTable";
import { DealerMark } from "@/components/brand/DealerMark";
import { EmptyState, StatTile } from "@/components/ui/Misc";
import { IconTag } from "@/components/icons";
import { offers } from "@/lib/data/marketplace";
import { dealerById, sellerById } from "@/lib/data/people";
import { vehicleById } from "@/lib/data/vehicles";
import { money, vehicleTitle } from "@/lib/format";
import { Time } from "@/components/ui/Time";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Live" },
  { key: "countered", label: "Countered" },
  { key: "declined", label: "Declined" },
];

export default function AdminOffersPage() {
  const [tab, setTab] = useState("all");

  const rows = useMemo(
    () =>
      (tab === "all" ? offers : offers.filter((o) => o.status === tab)).slice().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [tab],
  );

  const counts = {
    all: offers.length,
    pending: offers.filter((o) => o.status === "pending").length,
    countered: offers.filter((o) => o.status === "countered").length,
    declined: offers.filter((o) => o.status === "declined").length,
  } as Record<string, number>;

  const live = offers.filter((o) => o.status === "pending");
  const totalLive = live.reduce((n, o) => n + o.amount, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1500px]">
      <PortalHeader title="Offers & Sales" lead="Every dealer offer across the marketplace." />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatTile value={counts.all} label="Offers made" hint="This event" />
        <StatTile value={counts.pending} label="Awaiting seller" tone="lime" hint="Live right now" />
        <StatTile value={money(totalLive)} label="Live offer value" hint="Sum of pending offers" />
        <StatTile
          value={money(Math.round(totalLive / Math.max(1, live.length)))}
          label="Average live offer"
        />
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="px-5 pt-4 border-b border-line">
          <Tabs tabs={TABS.map((t) => ({ ...t, count: counts[t.key] }))} active={tab} onChange={setTab} />
        </div>

        <DataTable
          rows={rows}
          rowKey={(o) => o.id}
          minWidth={980}
          empty={
            <EmptyState icon={<IconTag size={22} />} title="No offers in this view" />
          }
          columns={[
            {
              key: "dealer",
              header: "Dealer",
              cell: (o) => {
                const d = dealerById(o.dealerId)!;
                return (
                  <span className="flex items-center gap-2.5">
                    <DealerMark initials={d.markInitials} color={d.markColor} size={32} />
                    <span className="min-w-0">
                      <span className="block font-semibold truncate">{d.name}</span>
                      <span className="block text-[12px] text-muted">#{d.dealerNumber}</span>
                    </span>
                  </span>
                );
              },
            },
            {
              key: "vehicle",
              header: "Vehicle",
              cell: (o) => {
                const v = vehicleById(o.vehicleId)!;
                return (
                  <Link href={`/dealer/inventory/${v.id}`} className="text-body hover:text-lime-600 transition-colors">
                    <span className="block truncate max-w-[200px]">{vehicleTitle(v)}</span>
                    <span className="block text-[12px] text-muted font-mono">{v.vin.slice(-8)}</span>
                  </Link>
                );
              },
            },
            {
              key: "seller",
              header: "Seller",
              cell: (o) => {
                const s = sellerById(o.sellerId);
                return <span className="text-body">{s ? `${s.firstName} ${s.lastName}` : "—"}</span>;
              },
            },
            {
              key: "amount",
              header: "Offer",
              align: "right",
              cell: (o) => (
                <span className="font-display font-bold tabular-nums">
                  {money(o.amount)}
                  {o.counterAmount && (
                    <span className="block text-[12px] font-sans font-normal text-info">
                      countered {money(o.counterAmount)}
                    </span>
                  )}
                </span>
              ),
            },
            {
              key: "vs",
              header: "vs estimate",
              align: "right",
              cell: (o) => {
                const v = vehicleById(o.vehicleId)!;
                const mid = (v.estimateLow + v.estimateHigh) / 2;
                const pct = Math.round(((o.amount - mid) / mid) * 100);
                return (
                  <span
                    className={
                      pct >= 0
                        ? "text-success font-semibold tabular-nums"
                        : "text-danger font-semibold tabular-nums"
                    }
                  >
                    {pct >= 0 ? "+" : ""}
                    {pct}%
                  </span>
                );
              },
            },
            { key: "status", header: "Status", cell: (o) => <StatusBadge status={o.status} /> },
            {
              key: "created",
              header: "Placed",
              align: "right",
              cell: (o) => <Time iso={o.createdAt} className="text-muted whitespace-nowrap" />,
            },
          ]}
        />
      </Card>
    </div>
  );
}
