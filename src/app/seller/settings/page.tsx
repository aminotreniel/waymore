"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PortalHeader } from "@/components/portal/PortalShell";
import { Tabs } from "@/components/ui/Disclosure";
import { Checkbox, Input, Select } from "@/components/ui/Field";
import { Avatar } from "@/components/brand/DealerMark";
import { Callout } from "@/components/ui/Misc";
import { IconLock } from "@/components/icons";
import { useSession } from "@/context/SessionContext";

export default function SellerSettingsPage() {
  const { seller } = useSession();
  const [tab, setTab] = useState("profile");
  const [prefs, setPrefs] = useState({
    bidEmail: true,
    bidSms: true,
    digest: false,
    marketing: false,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1100px]">
      <PortalHeader title="Account Settings" lead="Your details, notifications, and security." />

      <Card className="!p-0 overflow-hidden">
        <div className="px-5 sm:px-6 pt-4 border-b border-line">
          <Tabs
            tabs={[
              { key: "profile", label: "Profile" },
              { key: "notifications", label: "Notifications" },
              { key: "security", label: "Security" },
              { key: "privacy", label: "Privacy" },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        <div className="p-5 sm:p-6">
          {tab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar initials={seller.avatarInitials} size={64} tone="muted" />
                <div>
                  <p className="text-[16px] font-semibold text-heading">
                    {seller.firstName} {seller.lastName}
                  </p>
                  <p className="text-[13px] text-muted">
                    Member since{" "}
                    {new Date(seller.joinedAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="First name" defaultValue={seller.firstName} />
                <Input label="Last name" defaultValue={seller.lastName} />
                <Input label="Email" type="email" defaultValue={seller.email} className="sm:col-span-2" />
                <Input label="Mobile number" type="tel" defaultValue={seller.phone} />
                <Input label="ZIP code" defaultValue={seller.zip} maxLength={5} />
                <Input label="City" defaultValue={seller.city} />
                <Select
                  label="State"
                  options={["MO", "IL", "KS", "AR", "TN"]}
                  defaultValue={seller.state}
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-line pt-5">
                <Button variant="outline">Cancel</Button>
                <Button>Save changes</Button>
              </div>
            </div>
          )}

          {tab === "notifications" && (
            <div className="space-y-5">
              <CardHeader
                title="How we reach you"
                subtitle="Dealers never contact you directly — everything comes through Way More."
              />
              <div className="space-y-4">
                <Checkbox
                  label="Email me when a dealer bids"
                  description="The single most useful alert — this is how most sellers find out they have offers."
                  checked={prefs.bidEmail}
                  onChange={(v) => setPrefs((p) => ({ ...p, bidEmail: v }))}
                />
                <Checkbox
                  label="Text me when a dealer bids"
                  description="A short SMS with the amount and the dealer name."
                  checked={prefs.bidSms}
                  onChange={(v) => setPrefs((p) => ({ ...p, bidSms: v }))}
                />
                <Checkbox
                  label="Daily activity digest"
                  description="One summary a day instead of individual alerts."
                  checked={prefs.digest}
                  onChange={(v) => setPrefs((p) => ({ ...p, digest: v }))}
                />
                <Checkbox
                  label="Product news from Way More"
                  description="Occasional updates. Never more than once a month."
                  checked={prefs.marketing}
                  onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
                />
              </div>
              <div className="flex justify-end border-t border-line pt-5">
                <Button>Save preferences</Button>
              </div>
            </div>
          )}

          {tab === "security" && (
            <div className="space-y-6">
              <div className="grid gap-4 max-w-md">
                <Input label="Current password" type="password" autoComplete="current-password" />
                <Input label="New password" type="password" autoComplete="new-password" hint="8+ characters" />
                <Input label="Confirm new password" type="password" autoComplete="new-password" />
              </div>
              <div className="flex justify-end border-t border-line pt-5">
                <Button>Update password</Button>
              </div>

              <div className="border-t border-line pt-6">
                <CardHeader
                  title="Two-factor authentication"
                  subtitle="Require a code from your phone when signing in."
                  action={<Button variant="outline" size="sm">Enable</Button>}
                />
              </div>

              <div className="border-t border-line pt-6">
                <CardHeader title="Signed-in devices" subtitle="You're signed in on 2 devices." />
                <ul className="divide-y divide-line">
                  {[
                    { d: "Chrome on macOS", l: "St. Louis, MO — current session" },
                    { d: "Safari on iPhone", l: "St. Louis, MO — 2 days ago" },
                  ].map((s) => (
                    <li key={s.d} className="flex items-center justify-between gap-4 py-3">
                      <span>
                        <span className="block text-[14px] font-medium text-heading">{s.d}</span>
                        <span className="block text-[12.5px] text-muted">{s.l}</span>
                      </span>
                      <Button variant="ghost" size="sm" className="!text-danger hover:!bg-danger-bg">
                        Sign out
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === "privacy" && (
            <div className="space-y-5">
              <Callout tone="neutral" icon={<IconLock size={17} />}>
                <strong>Dealers never receive your contact details.</strong> They see your vehicle,
                your city, and messages you choose to send. Your name, email, phone number and exact
                address stay with Way More until you accept an offer.
              </Callout>

              <div className="space-y-4">
                <Checkbox
                  label="Show my first name to dealers in messages"
                  description="Off by default. Dealers see 'Seller' instead."
                  checked={false}
                  onChange={() => {}}
                />
                <Checkbox
                  label="Include my vehicle in market research"
                  description="Anonymised — helps us improve estimate accuracy for everyone."
                  checked
                  onChange={() => {}}
                />
              </div>

              <div className="border-t border-line pt-6">
                <CardHeader
                  title="Your data"
                  subtitle="Download everything we hold, or close your account."
                />
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm">Download my data</Button>
                  <Button variant="ghost" size="sm" className="!text-danger hover:!bg-danger-bg">
                    Close account
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
