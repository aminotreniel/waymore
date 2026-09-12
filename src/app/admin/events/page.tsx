"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { PortalHeader } from "@/components/portal/PortalShell";
import { Countdown } from "@/components/ui/Countdown";
import { DataTable } from "@/components/portal/DataTable";
import { StatTile, Timeline } from "@/components/ui/Misc";
import { IconCalendar } from "@/components/icons";
import { events, currentEvent } from "@/lib/data/marketplace";
import { CURRENT_EVENT_CLOSES_AT, eventDeadlineLabel } from "@/lib/data/clock";
import { money, number } from "@/lib/format";
import { Time } from "@/components/ui/Time";

export default function AdminEventsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px]">
      <PortalHeader
        title="Events"
        lead="One timed dealer event a week, per region."
        action={<Button size="sm" variant="dark">Schedule an event</Button>}
      />

      <Card className="!bg-ink-950 !ring-ink-800">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.13em] text-lime-400">
              <IconCalendar size={14} />
              Live now
            </p>
            <p className="mt-2.5 text-white text-[21px] font-display font-bold">{currentEvent.name}</p>
            <p className="mt-1 text-[14px] text-white/60">
              {currentEvent.region} · closes {eventDeadlineLabel(CURRENT_EVENT_CLOSES_AT)}
            </p>
          </div>
          <Countdown to={CURRENT_EVENT_CLOSES_AT} tone="light" />
          <div className="flex gap-2.5">
            <Button variant="outline" size="sm">Extend by 1 hour</Button>
            <Button variant="primary" size="sm">Close early</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatTile value={currentEvent.vehicleIds.length} label="Vehicles this event" />
        <StatTile value={number(currentEvent.registeredDealers)} label="Registered dealers" />
        <StatTile value={number(currentEvent.totalBids)} label="Bids placed" />
        <StatTile
          value={(currentEvent.totalBids / Math.max(1, currentEvent.vehicleIds.length)).toFixed(1)}
          label="Bids per vehicle"
          tone="lime"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px] items-start">
        <Card className="!p-0 overflow-hidden min-w-0">
          <div className="p-5 border-b border-line">
            <CardHeader className="!mb-0" title="All events" subtitle="Most recent first" />
          </div>
          <DataTable
            rows={events}
            rowKey={(e) => e.id}
            minWidth={820}
            columns={[
              {
                key: "name",
                header: "Event",
                cell: (e) => (
                  <span>
                    <span className="block font-semibold">{e.name}</span>
                    <span className="block text-[12px] text-muted">{e.region}</span>
                  </span>
                ),
              },
              { key: "opens", header: "Opens", cell: (e) => <Time iso={e.opensAt} format="longdate" className="whitespace-nowrap text-body" /> },
              { key: "closes", header: "Closes", cell: (e) => <Time iso={e.closesAt} format="longdate" className="whitespace-nowrap text-body" /> },
              { key: "vehicles", header: "Vehicles", align: "right", cell: (e) => <span className="tabular-nums">{e.vehicleIds.length}</span> },
              { key: "dealers", header: "Dealers", align: "right", cell: (e) => <span className="tabular-nums">{e.registeredDealers}</span> },
              { key: "bids", header: "Bids", align: "right", cell: (e) => <span className="tabular-nums">{e.totalBids}</span> },
              {
                key: "gmv",
                header: "Volume",
                align: "right",
                cell: (e) => (
                  <span className="font-display font-bold tabular-nums">
                    {e.grossVolume ? money(e.grossVolume) : "—"}
                  </span>
                ),
              },
              { key: "status", header: "Status", cell: (e) => <StatusBadge status={e.status} /> },
            ]}
          />
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Weekly cadence" subtitle="How each event progresses" />
            <Timeline
              steps={[
                { label: "Friday — event opens", description: "Approved listings become visible to dealers.", completedAt: currentEvent.opensAt },
                { label: "Tuesday — listings lock", description: "New sellers roll into the following week.", completedAt: currentEvent.opensAt },
                { label: "Wednesday 6:00 PM — bidding closes", description: "Top bids convert into offers automatically.", completedAt: null, active: true },
                { label: "Friday — offers expire", description: "Sellers have 48 hours to accept, counter or decline.", completedAt: null },
                { label: "Following week — settlement", description: "Pickups complete and payouts batch.", completedAt: null },
              ]}
            />
          </Card>

          <Card>
            <CardHeader title="Event settings" />
            <dl className="space-y-2.5 text-[13.5px]">
              {[
                ["Close time", "Wednesday 6:00 PM CT"],
                ["Minimum increment", "$100"],
                ["Offer window", "48 hours"],
                ["Listing lock", "24 hours before close"],
                ["Region", "Greater St. Louis"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-heading font-medium text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4">
              <Button variant="outline" size="sm" fullWidth>Edit defaults</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
