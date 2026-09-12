"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PortalHeader } from "@/components/portal/PortalShell";
import { Tabs } from "@/components/ui/Disclosure";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/Field";
import { Avatar } from "@/components/brand/DealerMark";
import { Callout } from "@/components/ui/Misc";
import { IconAlert } from "@/components/icons";
import { adminUsers } from "@/lib/data/people";

export default function AdminSettingsPage() {
  const [tab, setTab] = useState("marketplace");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1100px]">
      <PortalHeader title="Settings" lead="Marketplace rules, team access, and integrations." />

      <Card className="!p-0 overflow-hidden">
        <div className="px-5 sm:px-6 pt-4 border-b border-line">
          <Tabs
            tabs={[
              { key: "marketplace", label: "Marketplace rules" },
              { key: "team", label: "Team" },
              { key: "notifications", label: "Notifications" },
              { key: "integrations", label: "Integrations" },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        <div className="p-5 sm:p-6">
          {tab === "marketplace" && (
            <div className="space-y-6">
              <CardHeader
                title="Event defaults"
                subtitle="Applied to every new event unless overridden."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Close day"
                  options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]}
                  defaultValue="Wednesday"
                />
                <Input label="Close time (CT)" type="time" defaultValue="18:00" />
                <Input label="Minimum bid increment" prefix="$" inputMode="numeric" defaultValue="100" />
                <Input label="Offer window (hours)" inputMode="numeric" defaultValue="48" />
                <Input label="Listing lock (hours before close)" inputMode="numeric" defaultValue="24" />
                <Input label="Manual review threshold" prefix="$" inputMode="numeric" defaultValue="40000" />
              </div>

              <div className="space-y-3.5 border-t border-line pt-5">
                <Checkbox
                  label="Require manual review for branded titles"
                  description="Salvage and rebuilt listings never auto-approve."
                  checked
                  onChange={() => {}}
                />
                <Checkbox
                  label="Auto-roll unsold vehicles into the next event"
                  description="Sellers are emailed and can opt out."
                  checked
                  onChange={() => {}}
                />
                <Checkbox
                  label="Hide competing dealer names in bid history"
                  description="Dealers see anonymised bidders until an offer is accepted."
                  checked
                  onChange={() => {}}
                />
              </div>

              <div className="flex justify-end border-t border-line pt-5">
                <Button>Save marketplace rules</Button>
              </div>
            </div>
          )}

          {tab === "team" && (
            <div className="space-y-5">
              <CardHeader
                title="Way More team"
                subtitle="Who can access this console."
                action={<Button size="sm" variant="outline">Invite teammate</Button>}
              />
              <ul className="divide-y divide-line">
                {adminUsers.map((u) => (
                  <li key={u.id} className="flex flex-wrap items-center gap-4 py-3.5">
                    <Avatar initials={u.avatarInitials} size={38} tone="muted" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-heading">{u.name}</p>
                      <p className="text-[12.5px] text-muted">{u.email}</p>
                    </div>
                    <Badge tone={u.role === "owner" ? "ink" : "neutral"}>{u.role}</Badge>
                    <Button size="sm" variant="ghost">Manage</Button>
                  </li>
                ))}
              </ul>

              <Callout tone="warn" icon={<IconAlert size={17} />}>
                Console access grants visibility of seller contact details and payout information.
                Grant it sparingly and remove it the day someone leaves.
              </Callout>
            </div>
          )}

          {tab === "notifications" && (
            <div className="space-y-5">
              <CardHeader title="Operational alerts" subtitle="Where the team gets paged." />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Ops email" type="email" defaultValue="ops@trywaymore.com" />
                <Input label="Escalation phone" type="tel" defaultValue="(314) 555-0123" />
              </div>
              <div className="space-y-3.5 border-t border-line pt-5">
                {[
                  { l: "A listing sits unreviewed for 4 hours", c: true },
                  { l: "A dealer application is submitted", c: true },
                  { l: "An event closes with unsold vehicles", c: true },
                  { l: "A seller reports an issue at pickup", c: true },
                  { l: "Daily marketplace summary", c: false },
                ].map((n) => (
                  <Checkbox key={n.l} label={n.l} checked={n.c} onChange={() => {}} />
                ))}
              </div>
              <div className="flex justify-end border-t border-line pt-5">
                <Button>Save notification settings</Button>
              </div>
            </div>
          )}

          {tab === "integrations" && (
            <div className="space-y-5">
              <CardHeader
                title="Connected services"
                subtitle="Third-party systems the platform talks to."
              />
              <ul className="divide-y divide-line">
                {[
                  { n: "Stripe", d: "Seller payouts and dealer billing", s: "Connected" },
                  { n: "Twilio", d: "SMS alerts for bids and offers", s: "Connected" },
                  { n: "Resend", d: "Transactional email", s: "Connected" },
                  { n: "VIN decode API", d: "Year, make, model, trim and factory options", s: "Connected" },
                  { n: "Market data feed", d: "Wholesale and retail comparables", s: "Not connected" },
                ].map((i) => (
                  <li key={i.n} className="flex flex-wrap items-center gap-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-heading">{i.n}</p>
                      <p className="text-[12.5px] text-muted">{i.d}</p>
                    </div>
                    <Badge tone={i.s === "Connected" ? "success" : "neutral"}>{i.s}</Badge>
                    <Button size="sm" variant="outline">
                      {i.s === "Connected" ? "Configure" : "Connect"}
                    </Button>
                  </li>
                ))}
              </ul>

              <div className="border-t border-line pt-5">
                <Textarea
                  label="Webhook endpoint"
                  hint="receives event lifecycle notifications"
                  defaultValue="https://api.trywaymore.com/hooks/events"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
