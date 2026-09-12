"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { PortalHeader } from "@/components/portal/PortalShell";
import { Tabs } from "@/components/ui/Disclosure";
import { DataTable } from "@/components/portal/DataTable";
import { DealerMark } from "@/components/brand/DealerMark";
import { Callout, EmptyState, StatTile } from "@/components/ui/Misc";
import { IconBuilding, IconSearch, IconStar } from "@/components/icons";
import { dealers } from "@/lib/data/people";
import { bidsForDealer } from "@/lib/data/marketplace";
import { money } from "@/lib/format";
import { Time } from "@/components/ui/Time";

const TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending approval" },
  { key: "suspended", label: "Suspended" },
];

export default function AdminDealersPage() {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    let out = tab === "all" ? dealers : dealers.filter((d) => d.status === tab);
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter((d) =>
        `${d.name} ${d.legalName} ${d.dealerNumber} ${d.city} ${d.contactName}`.toLowerCase().includes(q),
      );
    }
    return out;
  }, [tab, query]);

  const counts = {
    all: dealers.length,
    active: dealers.filter((d) => d.status === "active").length,
    pending: dealers.filter((d) => d.status === "pending").length,
    suspended: dealers.filter((d) => d.status === "suspended").length,
  } as Record<string, number>;

  const pending = dealers.filter((d) => d.status === "pending");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1500px]">
      <PortalHeader
        title="Dealers"
        lead="Every dealership on the platform and their standing."
        action={<Button size="sm" variant="dark">Invite a dealer</Button>}
      />

      {pending.length > 0 && (
        <Callout tone="warn" icon={<IconBuilding size={17} />}>
          <strong>
            {pending.length} dealer application{pending.length === 1 ? "" : "s"} awaiting verification.
          </strong>{" "}
          Licence and bond checks must clear before they can bid.
        </Callout>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <StatTile value={counts.active} label="Active dealers" tone="lime" hint="Can bid today" />
        <StatTile value={counts.pending} label="Pending verification" hint="Blocking their first bid" />
        <StatTile
          value={dealers.reduce((n, d) => n + d.purchases, 0)}
          label="Vehicles purchased"
          hint="All dealers, all time"
        />
        <StatTile
          value={(
            dealers.filter((d) => d.rating > 0).reduce((n, d) => n + d.rating, 0) /
            Math.max(1, dealers.filter((d) => d.rating > 0).length)
          ).toFixed(1)}
          label="Average dealer rating"
        />
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 pt-4 border-b border-line">
          <Tabs tabs={TABS.map((t) => ({ ...t, count: counts[t.key] }))} active={tab} onChange={setTab} />
          <div className="relative pb-3">
            <IconSearch size={15} className="absolute left-3 top-[13px] text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dealers…"
              aria-label="Search dealers"
              className="h-9 w-[230px] max-w-full rounded-lg bg-paper pl-9 pr-3 text-[13px] text-heading placeholder:text-muted ring-1 ring-inset ring-transparent focus:ring-ink-600 focus:outline-none"
            />
          </div>
        </div>

        <DataTable
          rows={rows}
          rowKey={(d) => d.id}
          minWidth={1000}
          empty={<EmptyState icon={<IconBuilding size={22} />} title="No dealers match" />}
          columns={[
            {
              key: "dealer",
              header: "Dealer",
              cell: (d) => (
                <span className="flex items-center gap-3">
                  <DealerMark initials={d.markInitials} color={d.markColor} size={38} />
                  <span className="min-w-0">
                    <span className="block font-semibold truncate">{d.name}</span>
                    <span className="block text-[12px] text-muted truncate">{d.legalName}</span>
                  </span>
                </span>
              ),
            },
            {
              key: "contact",
              header: "Contact",
              cell: (d) => (
                <span className="text-body">
                  {d.contactName}
                  <span className="block text-[12px] text-muted">{d.email}</span>
                </span>
              ),
            },
            { key: "location", header: "Location", cell: (d) => <span className="text-body whitespace-nowrap">{d.city}, {d.state}</span> },
            { key: "number", header: "Dealer #", cell: (d) => <span className="font-mono text-[12.5px] text-muted">{d.dealerNumber}</span> },
            {
              key: "rating",
              header: "Rating",
              align: "right",
              cell: (d) =>
                d.rating > 0 ? (
                  <span className="inline-flex items-center gap-1 font-semibold tabular-nums">
                    <IconStar size={13} fill="currentColor" strokeWidth={1} className="text-warn" />
                    {d.rating.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-muted">—</span>
                ),
            },
            {
              key: "activity",
              header: "Active bids",
              align: "right",
              cell: (d) => {
                const n = bidsForDealer(d.id).filter((b) =>
                  ["active", "winning", "outbid"].includes(b.status),
                ).length;
                return <span className="tabular-nums">{n}</span>;
              },
            },
            { key: "purchases", header: "Purchases", align: "right", cell: (d) => <span className="tabular-nums">{d.purchases}</span> },
            { key: "status", header: "Status", cell: (d) => <StatusBadge status={d.status} /> },
            {
              key: "joined",
              header: "Joined",
              align: "right",
              cell: (d) => (
                <Time
                  iso={d.joinedAt}
                  format={d.status === "pending" ? "relative" : "longdate"}
                  className="text-muted whitespace-nowrap"
                />
              ),
            },
            {
              key: "actions",
              header: "",
              align: "right",
              cell: (d) => (
                <Button size="sm" variant={d.status === "pending" ? "primary" : "outline"}>
                  {d.status === "pending" ? "Review" : "Manage"}
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <p className="text-[12.5px] text-muted">
        Total dealer spend on the platform:{" "}
        <strong className="text-heading">
          {money(dealers.reduce((n, d) => n + d.purchases * 22_000, 0))}
        </strong>{" "}
        (estimated at average sale price).
      </p>
    </div>
  );
}
