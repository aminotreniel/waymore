"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { PortalHeader } from "@/components/portal/PortalShell";
import { Tabs } from "@/components/ui/Disclosure";
import { DataTable } from "@/components/portal/DataTable";
import { EmptyState, StatTile } from "@/components/ui/Misc";
import { Select } from "@/components/ui/Field";
import { IconCar, IconSearch } from "@/components/icons";
import { vehicles } from "@/lib/data/vehicles";
import { highBidFor } from "@/lib/data/marketplace";
import { sellerById } from "@/lib/data/people";
import { miles, money, relativeTime, vehicleTitle } from "@/lib/format";

const TABS = [
  { key: "all", label: "All" },
  { key: "listed", label: "Live" },
  { key: "pending_review", label: "Pending review" },
  { key: "sold", label: "Sold" },
];

export default function AdminVehiclesPage() {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [body, setBody] = useState("all");

  const rows = useMemo(() => {
    let out = tab === "all" ? vehicles : vehicles.filter((v) => v.status === tab);
    if (body !== "all") out = out.filter((v) => v.bodyStyle === body);
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter((v) =>
        `${v.year} ${v.make} ${v.model} ${v.trim} ${v.vin} ${v.city}`.toLowerCase().includes(q),
      );
    }
    return out;
  }, [tab, query, body]);

  const counts = {
    all: vehicles.length,
    listed: vehicles.filter((v) => v.status === "listed").length,
    pending_review: vehicles.filter((v) => v.status === "pending_review").length,
    sold: vehicles.filter((v) => v.status === "sold").length,
  } as Record<string, number>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1500px]">
      <PortalHeader title="Vehicles" lead="Every listing on the platform, in any state." />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatTile value={counts.all} label="Total listings" hint="All time" />
        <StatTile value={counts.listed} label="Live in event" tone="lime" hint="Accepting bids" />
        <StatTile value={counts.pending_review} label="Pending review" hint="Blocking the next event" />
        <StatTile value={counts.sold} label="Sold" hint="Completed transactions" />
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 pt-4 border-b border-line">
          <Tabs tabs={TABS.map((t) => ({ ...t, count: counts[t.key] }))} active={tab} onChange={setTab} />
          <div className="flex items-center gap-2.5 pb-3">
            <div className="relative">
              <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search VIN, make, model…"
                aria-label="Search vehicles"
                className="h-9 w-[230px] max-w-full rounded-lg bg-paper pl-9 pr-3 text-[13px] text-heading placeholder:text-muted ring-1 ring-inset ring-transparent focus:ring-ink-600 focus:outline-none"
              />
            </div>
            <Select
              options={[
                { value: "all", label: "All body styles" },
                { value: "Sedan", label: "Sedan" },
                { value: "SUV", label: "SUV" },
                { value: "Truck", label: "Truck" },
              ]}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              aria-label="Body style"
              className="w-[165px] [&_select]:!h-9 [&_select]:!text-[13px]"
            />
          </div>
        </div>

        <DataTable
          rows={rows}
          rowKey={(v) => v.id}
          minWidth={1000}
          empty={
            <EmptyState
              icon={<IconCar size={22} />}
              title="No vehicles match"
              body="Try a different search or clear the filters."
            />
          }
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
                    <span className="block text-[12px] text-muted font-mono">{v.vin}</span>
                  </span>
                </Link>
              ),
            },
            {
              key: "seller",
              header: "Seller",
              cell: (v) => {
                const s = sellerById(v.sellerId);
                return (
                  <span className="text-body">
                    {s ? `${s.firstName} ${s.lastName}` : "—"}
                    <span className="block text-[12px] text-muted">{v.city}, {v.state}</span>
                  </span>
                );
              },
            },
            { key: "miles", header: "Mileage", align: "right", cell: (v) => <span className="tabular-nums whitespace-nowrap">{miles(v.mileage)}</span> },
            {
              key: "est",
              header: "Estimate",
              align: "right",
              cell: (v) => (
                <span className="tabular-nums whitespace-nowrap text-muted">
                  {money(v.estimateLow)}–{money(v.estimateHigh)}
                </span>
              ),
            },
            {
              key: "bid",
              header: "High bid",
              align: "right",
              cell: (v) => {
                const b = highBidFor(v.id);
                return (
                  <span className="font-display font-bold tabular-nums">
                    {b ? money(b.amount) : "—"}
                  </span>
                );
              },
            },
            { key: "status", header: "Status", cell: (v) => <StatusBadge status={v.status} /> },
            {
              key: "submitted",
              header: "Submitted",
              align: "right",
              cell: (v) => <span className="text-muted whitespace-nowrap">{relativeTime(v.submittedAt)}</span>,
            },
            {
              key: "actions",
              header: "",
              align: "right",
              cell: (v) => (
                <Link href={`/dealer/inventory/${v.id}`}>
                  <Button size="sm" variant="outline">View</Button>
                </Link>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
