"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { PortalHeader } from "@/components/portal/PortalShell";
import { DataTable } from "@/components/portal/DataTable";
import { Avatar } from "@/components/brand/DealerMark";
import { EmptyState, StatTile } from "@/components/ui/Misc";
import { IconSearch, IconUsers } from "@/components/icons";
import { sellers } from "@/lib/data/people";
import { vehicleById } from "@/lib/data/vehicles";
import { offers } from "@/lib/data/marketplace";
import { vehicleTitle } from "@/lib/format";
import { Time } from "@/components/ui/Time";

export default function AdminSellersPage() {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    if (!query.trim()) return sellers;
    const q = query.toLowerCase();
    return sellers.filter((s) =>
      `${s.firstName} ${s.lastName} ${s.email} ${s.city} ${s.zip}`.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px]">
      <PortalHeader title="Sellers" lead="Everyone who has listed a vehicle with Way More." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile value={sellers.length} label="Registered sellers" hint="All time" />
        <StatTile
          value={sellers.reduce((n, s) => n + s.vehicleIds.length, 0)}
          label="Vehicles listed"
          hint="Across all sellers"
        />
        <StatTile
          value={`${Math.round((offers.filter((o) => o.status !== "declined").length / Math.max(1, offers.length)) * 100)}%`}
          label="Offers not declined"
          tone="lime"
          hint="Seller engagement signal"
        />
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center justify-between gap-4 p-5 border-b border-line">
          <h2 className="text-[15.5px] font-bold text-heading">All sellers</h2>
          <div className="relative">
            <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sellers…"
              aria-label="Search sellers"
              className="h-9 w-[230px] max-w-full rounded-lg bg-paper pl-9 pr-3 text-[13px] text-heading placeholder:text-muted ring-1 ring-inset ring-transparent focus:ring-ink-600 focus:outline-none"
            />
          </div>
        </div>

        <DataTable
          rows={rows}
          rowKey={(s) => s.id}
          minWidth={860}
          empty={<EmptyState icon={<IconUsers size={22} />} title="No sellers match" />}
          columns={[
            {
              key: "seller",
              header: "Seller",
              cell: (s) => (
                <span className="flex items-center gap-3">
                  <Avatar initials={s.avatarInitials} size={36} tone="muted" />
                  <span className="min-w-0">
                    <span className="block font-semibold truncate">
                      {s.firstName} {s.lastName}
                    </span>
                    <span className="block text-[12px] text-muted truncate">{s.email}</span>
                  </span>
                </span>
              ),
            },
            { key: "location", header: "Location", cell: (s) => <span className="text-body whitespace-nowrap">{s.city}, {s.state} {s.zip}</span> },
            { key: "phone", header: "Phone", cell: (s) => <span className="text-body whitespace-nowrap">{s.phone}</span> },
            {
              key: "vehicle",
              header: "Vehicle",
              cell: (s) => {
                const v = vehicleById(s.vehicleIds[0]);
                return <span className="text-body truncate block max-w-[190px]">{v ? vehicleTitle(v) : "—"}</span>;
              },
            },
            {
              key: "status",
              header: "Listing status",
              cell: (s) => {
                const v = vehicleById(s.vehicleIds[0]);
                return v ? <StatusBadge status={v.status} /> : <span className="text-muted">—</span>;
              },
            },
            { key: "joined", header: "Joined", align: "right", cell: (s) => <Time iso={s.joinedAt} format="longdate" className="text-muted whitespace-nowrap" /> },
            {
              key: "actions",
              header: "",
              align: "right",
              cell: () => <Button size="sm" variant="outline">View</Button>,
            },
          ]}
        />
      </Card>
    </div>
  );
}
