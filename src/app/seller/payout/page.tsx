"use client";

import Image from "next/image";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PortalHeader } from "@/components/portal/PortalShell";
import { Callout, Timeline } from "@/components/ui/Misc";
import { ChoiceCard, Input } from "@/components/ui/Field";
import {
  IconCheck,
  IconCreditCard,
  IconDocument,
  IconTruck,
  IconUpload,
} from "@/components/icons";
import { payoutTracker } from "@/lib/data/marketplace";
import { vehicleById } from "@/lib/data/vehicles";
import { dealerById } from "@/lib/data/people";
import { offerById } from "@/lib/data/marketplace";
import { money, vehicleTitle, cx } from "@/lib/format";

const DOCS = [
  { id: "title", label: "Vehicle title", hint: "Front and back, all corners visible" },
  { id: "id", label: "Photo ID", hint: "Driver's licence or state ID" },
  { id: "odometer", label: "Odometer photo", hint: "Dash showing current mileage" },
];

const WINDOWS = [
  { id: "w1", label: "Tomorrow, 9am – 12pm" },
  { id: "w2", label: "Tomorrow, 1pm – 5pm" },
  { id: "w3", label: "Friday, 9am – 12pm" },
  { id: "w4", label: "Saturday, 10am – 2pm" },
];

export default function SellerPayoutPage() {
  const tracker = payoutTracker;
  const vehicle = vehicleById(tracker.vehicleId)!;
  const offer = offerById(tracker.offerId)!;
  const dealer = dealerById(offer.dealerId)!;

  const [uploaded, setUploaded] = useState<string[]>([]);
  const [pickup, setPickup] = useState<string | null>(null);
  const [method, setMethod] = useState<"ach" | "check">(tracker.method);

  const allDocs = uploaded.length === DOCS.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px]">
      <PortalHeader
        title="Payout & Pickup"
        lead="Three short steps between here and the money landing in your account."
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] items-start">
        <div className="space-y-5 min-w-0">
          {/* ------------------------------------------------- summary */}
          <Card className="!p-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div className="relative w-full sm:w-[220px] shrink-0 aspect-[4/3] sm:aspect-auto sm:min-h-[170px]">
                <Image
                  src={vehicle.photos[0].url}
                  alt={vehicleTitle(vehicle)}
                  fill
                  sizes="220px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 p-5 sm:p-6">
                <Badge tone="success" dot>Offer accepted</Badge>
                <h2 className="mt-2.5 text-[20px] leading-tight">{vehicleTitle(vehicle)}</h2>
                <p className="mt-1 text-[13.5px] text-body">Sold to {dealer.name}</p>
                <p className="mt-3 font-display font-extrabold text-[32px] text-heading leading-none tracking-tight tabular-nums">
                  {money(tracker.amount)}
                </p>
              </div>
            </div>
          </Card>

          {/* ------------------------------------------------ documents */}
          <Card>
            <CardHeader
              title="1. Upload your documents"
              subtitle="Everything is encrypted and only shared with the buying dealer"
              action={
                <span className="text-[13px] font-semibold text-muted tabular-nums">
                  {uploaded.length} of {DOCS.length}
                </span>
              }
            />
            <ul className="space-y-2.5">
              {DOCS.map((d) => {
                const done = uploaded.includes(d.id);
                return (
                  <li
                    key={d.id}
                    className={cx(
                      "flex items-center gap-3.5 rounded-xl px-4 py-3.5 ring-1 transition-colors",
                      done ? "bg-mint-50 ring-lime-200" : "bg-paper ring-line",
                    )}
                  >
                    <span
                      className={cx(
                        "grid size-9 shrink-0 place-items-center rounded-lg",
                        done ? "bg-lime-400 text-ink-950" : "bg-white text-muted ring-1 ring-line-strong",
                      )}
                    >
                      {done ? <IconCheck size={17} strokeWidth={3} /> : <IconDocument size={17} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold text-heading">{d.label}</span>
                      <span className="block text-[12.5px] text-muted mt-0.5">{d.hint}</span>
                    </span>
                    <Button
                      size="sm"
                      variant={done ? "ghost" : "outline"}
                      onClick={() =>
                        setUploaded((u) => (done ? u.filter((x) => x !== d.id) : [...u, d.id]))
                      }
                    >
                      {done ? "Replace" : <><IconUpload size={14} /> Upload</>}
                    </Button>
                  </li>
                );
              })}
            </ul>
            {allDocs && (
              <div className="mt-4">
                <Callout tone="success">
                  <strong>All documents received.</strong> {dealer.name} has been notified and will
                  confirm the vehicle before pickup.
                </Callout>
              </div>
            )}
          </Card>

          {/* --------------------------------------------------- pickup */}
          <Card>
            <CardHeader
              title="2. Choose a pickup window"
              subtitle={`Free pickup at ${tracker.pickupAddress}`}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {WINDOWS.map((w) => (
                <ChoiceCard
                  key={w.id}
                  label={w.label}
                  description="Free — the dealer comes to you"
                  selected={pickup === w.id}
                  onSelect={() => setPickup(w.id)}
                  icon={<IconTruck size={19} />}
                />
              ))}
            </div>
            <p className="mt-4 text-[12.5px] text-muted">
              Need a different time? Message {dealer.name} directly and we&apos;ll adjust it.
            </p>
          </Card>

          {/* -------------------------------------------------- payment */}
          <Card>
            <CardHeader
              title="3. How would you like to be paid?"
              subtitle="Funds release once the vehicle is collected"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceCard
                label="ACH direct deposit"
                description="Lands in 1–2 business days. Most popular."
                selected={method === "ach"}
                onSelect={() => setMethod("ach")}
                icon={<IconCreditCard size={19} />}
              />
              <ChoiceCard
                label="Printed check at pickup"
                description="Handed to you when the dealer collects the car."
                selected={method === "check"}
                onSelect={() => setMethod("check")}
                icon={<IconDocument size={19} />}
              />
            </div>

            {method === "ach" && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Input label="Routing number" inputMode="numeric" placeholder="081000032" />
                <Input
                  label="Account number"
                  inputMode="numeric"
                  placeholder={`••••••${tracker.accountLast4}`}
                />
              </div>
            )}
          </Card>

          <div className="flex justify-end">
            <Button size="lg" disabled={!allDocs || !pickup} withArrow>
              Confirm pickup &amp; payout
            </Button>
          </div>
        </div>

        {/* ------------------------------------------------------- rail */}
        <div className="space-y-5">
          <Card>
            <CardHeader title="Progress" />
            <Timeline
              steps={tracker.steps.map((s, i) => ({
                label: s.label,
                description: s.description,
                completedAt:
                  s.completedAt ??
                  (i === 1 && allDocs ? new Date().toISOString() : null),
                active: i === 1 ? !allDocs : i === 3 ? allDocs && !pickup : false,
              }))}
            />
          </Card>

          <Card className="!bg-ink-950 !ring-ink-800">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-lime-400">
              Your payout
            </p>
            <p className="mt-2 font-display font-extrabold text-[30px] text-white leading-none tracking-tight tabular-nums">
              {money(tracker.amount)}
            </p>
            <dl className="mt-4 space-y-2 border-t border-white/10 pt-4 text-[13px]">
              {[
                ["Way More fee", "$0"],
                ["Pickup", "Free"],
                ["Method", method === "ach" ? "ACH deposit" : "Check at pickup"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-white/50">{k}</dt>
                  <dd className="text-white font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Callout tone="neutral">
            <strong>Still owe on the car?</strong> Tell us your lender and we&apos;ll handle the
            payoff directly — you receive the difference.
          </Callout>
        </div>
      </div>
    </div>
  );
}
