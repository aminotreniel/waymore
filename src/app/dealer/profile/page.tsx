"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { PortalHeader } from "@/components/portal/PortalShell";
import { Tabs } from "@/components/ui/Disclosure";
import { Checkbox, Input, Select } from "@/components/ui/Field";
import { DealerMark } from "@/components/brand/DealerMark";
import { Callout, StatTile } from "@/components/ui/Misc";
import { IconCheck, IconShieldCheck, IconStar } from "@/components/icons";
import { useSession } from "@/context/SessionContext";
import { Time } from "@/components/ui/Time";

export default function DealerProfilePage() {
  const { dealer } = useSession();
  const [tab, setTab] = useState("business");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1150px]">
      <PortalHeader title="My Profile" lead="Your dealership, users, and bidding preferences." />

      <Card>
        <div className="flex flex-wrap items-center gap-5">
          <DealerMark initials={dealer.markInitials} color={dealer.markColor} size={72} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[22px] leading-tight">{dealer.name}</h2>
              <StatusBadge status={dealer.status} />
              <Badge tone="neutral">
                <IconStar size={12} fill="currentColor" strokeWidth={1} className="text-warn" />
                {dealer.rating.toFixed(1)}
              </Badge>
            </div>
            <p className="mt-1 text-[13.5px] text-body">
              {dealer.legalName} · Dealer #{dealer.dealerNumber} · {dealer.city}, {dealer.state}
            </p>
            <p className="mt-0.5 text-[12.5px] text-muted">
              Member since <Time iso={dealer.joinedAt} format="longdate" />
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3 border-t border-line pt-5">
          <StatTile value={dealer.purchases} label="Vehicles purchased" hint="All time" />
          <StatTile value={dealer.rating.toFixed(1)} label="Seller rating" hint="Across all sales" />
          <StatTile value="100%" label="Pickup completion" hint="No renegotiations" tone="lime" />
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <div className="px-5 sm:px-6 pt-4 border-b border-line">
          <Tabs
            tabs={[
              { key: "business", label: "Business details" },
              { key: "users", label: "Users" },
              { key: "bidding", label: "Bidding preferences" },
              { key: "compliance", label: "Licence & compliance" },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        <div className="p-5 sm:p-6">
          {tab === "business" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Trading name" defaultValue={dealer.name} />
                <Input label="Legal entity" defaultValue={dealer.legalName} />
                <Input label="Primary contact" defaultValue={dealer.contactName} />
                <Input label="Contact email" type="email" defaultValue={dealer.email} />
                <Input label="Phone" type="tel" defaultValue={dealer.phone} />
                <Input label="City" defaultValue={dealer.city} />
                <Select label="State" options={["MO", "IL", "KS", "AR", "TN"]} defaultValue={dealer.state} />
                <Input label="Dealer number" defaultValue={dealer.dealerNumber} />
              </div>
              <div className="flex justify-end gap-3 border-t border-line pt-5">
                <Button variant="outline">Cancel</Button>
                <Button>Save changes</Button>
              </div>
            </div>
          )}

          {tab === "users" && (
            <div className="space-y-5">
              <CardHeader
                title="Team access"
                subtitle="Anyone here can bid on behalf of the dealership."
                action={<Button size="sm" variant="outline">Invite user</Button>}
              />
              <ul className="divide-y divide-line">
                {[
                  { n: dealer.contactName, e: dealer.email, r: "Owner", last: "Active now" },
                  { n: "Marcus Bell", e: "marcus@sunsetmotors.com", r: "Buyer", last: "2 hours ago" },
                  { n: "Priya Shah", e: "priya@sunsetmotors.com", r: "Buyer", last: "Yesterday" },
                  { n: "Accounts Payable", e: "ap@sunsetmotors.com", r: "Billing only", last: "3 days ago" },
                ].map((u) => (
                  <li key={u.e} className="flex flex-wrap items-center gap-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-heading">{u.n}</p>
                      <p className="text-[12.5px] text-muted">{u.e}</p>
                    </div>
                    <Badge tone={u.r === "Owner" ? "ink" : "neutral"}>{u.r}</Badge>
                    <span className="text-[12.5px] text-muted w-24 text-right">{u.last}</span>
                    <Button size="sm" variant="ghost">Manage</Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "bidding" && (
            <div className="space-y-5">
              <CardHeader
                title="Defaults for new bids"
                subtitle="These pre-fill the bid dialog. You can always override per vehicle."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Default bid increment"
                  options={[
                    { value: "100", label: "$100" },
                    { value: "250", label: "$250" },
                    { value: "500", label: "$500" },
                  ]}
                  defaultValue="250"
                />
                <Select
                  label="Notify me when outbid"
                  options={[
                    { value: "instant", label: "Immediately" },
                    { value: "hourly", label: "Hourly summary" },
                    { value: "off", label: "Don't notify" },
                  ]}
                  defaultValue="instant"
                />
                <Input label="Weekly purchase ceiling" prefix="$" inputMode="numeric" defaultValue="150000" />
                <Select
                  label="Preferred body styles"
                  options={["All", "SUVs and trucks", "Sedans", "Luxury only"]}
                  defaultValue="All"
                />
              </div>
              <div className="space-y-3.5 border-t border-line pt-5">
                <Checkbox
                  label="Enable automatic bidding by default"
                  description="We bid the minimum needed to keep you in front, up to your maximum."
                  checked
                  onChange={() => {}}
                />
                <Checkbox
                  label="Hide vehicles with branded titles"
                  description="Salvage and rebuilt titles won't appear in your inventory feed."
                  checked={false}
                  onChange={() => {}}
                />
                <Checkbox
                  label="Email me a digest when each event opens"
                  checked
                  onChange={() => {}}
                />
              </div>
              <div className="flex justify-end border-t border-line pt-5">
                <Button>Save preferences</Button>
              </div>
            </div>
          )}

          {tab === "compliance" && (
            <div className="space-y-5">
              <Callout tone="success" icon={<IconShieldCheck size={17} />}>
                <strong>Verified dealer.</strong> Your state licence and surety bond are on file and
                current. Re-verification happens automatically each year.
              </Callout>

              <ul className="divide-y divide-line">
                {[
                  { d: "State dealer licence", v: `MO-${dealer.dealerNumber}`, s: "Verified", exp: "Expires 31 Dec 2026" },
                  { d: "Surety bond", v: "$50,000", s: "Verified", exp: "Expires 30 Jun 2027" },
                  { d: "Sales tax licence", v: "On file", s: "Verified", exp: "—" },
                  { d: "W-9", v: "On file", s: "Verified", exp: "—" },
                ].map((r) => (
                  <li key={r.d} className="flex flex-wrap items-center gap-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-heading">{r.d}</p>
                      <p className="text-[12.5px] text-muted">{r.v} · {r.exp}</p>
                    </div>
                    <Badge tone="success">
                      <IconCheck size={11} strokeWidth={3} />
                      {r.s}
                    </Badge>
                    <Button size="sm" variant="ghost">View</Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
