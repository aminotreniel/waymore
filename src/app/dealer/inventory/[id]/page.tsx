"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Checkbox } from "@/components/ui/Field";
import { Countdown } from "@/components/ui/Countdown";
import { VehicleGallery } from "@/components/vehicle/VehicleGallery";
import { DealerMark } from "@/components/brand/DealerMark";
import { Callout, EmptyState } from "@/components/ui/Misc";
import {
  IconAlert,
  IconArrowLeft,
  IconCar,
  IconCheck,
  IconGavel,
  IconHeart,
  IconMapPin,
  IconShieldCheck,
} from "@/components/icons";
import { useSession } from "@/context/SessionContext";
import { vehicleById } from "@/lib/data/vehicles";
import { bidsForVehicle, currentEvent, highBidFor } from "@/lib/data/marketplace";
import { dealerById } from "@/lib/data/people";
import { CURRENT_EVENT_CLOSES_AT, eventDeadlineLabel } from "@/lib/data/clock";
import { cx, miles, money, relativeTime, vehicleTitle } from "@/lib/format";

export default function DealerVehicleDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { dealer, isSaved, toggleSaved } = useSession();
  const vehicle = vehicleById(params.id);

  const [bidOpen, setBidOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [autoBid, setAutoBid] = useState(false);
  const [maxAuto, setMaxAuto] = useState("");
  const [placed, setPlaced] = useState<number | null>(null);

  if (!vehicle) {
    return (
      <div className="p-8">
        <EmptyState
          icon={<IconCar size={22} />}
          title="Vehicle not found"
          body="This listing may have closed or been withdrawn."
          action={
            <Button variant="outline" size="sm" onClick={() => router.push("/dealer/inventory")}>
              Back to inventory
            </Button>
          }
        />
      </div>
    );
  }

  const bids = bidsForVehicle(vehicle.id);
  const top = highBidFor(vehicle.id);
  const currentHigh = placed ?? top?.amount ?? 0;
  const myBid = bids.find((b) => b.dealerId === dealer.id);
  const iAmWinning = placed !== null || myBid?.status === "winning";
  const minBid = currentHigh + 100;
  const saved = isSaved(vehicle.id);

  const specs: [string, string][] = [
    ["VIN", vehicle.vin],
    ["Mileage", miles(vehicle.mileage)],
    ["Body style", vehicle.bodyStyle],
    ["Drivetrain", vehicle.drivetrain],
    ["Transmission", vehicle.transmission],
    ["Fuel", vehicle.fuelType],
    ["Exterior", vehicle.exteriorColor],
    ["Interior", vehicle.interiorColor],
    ["Title", vehicle.titleStatus === "clean" ? "Clean" : vehicle.titleStatus],
    ["Owners", String(vehicle.owners)],
    ["Accidents reported", String(vehicle.accidents)],
    ["Keys", String(vehicle.keys)],
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1500px]">
      <Link
        href="/dealer/inventory"
        className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-body hover:text-heading transition-colors"
      >
        <IconArrowLeft size={16} />
        Back to Inventory
      </Link>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] items-start">
        <div className="space-y-5 min-w-0">
          <Card className="!p-4 sm:!p-5">
            <VehicleGallery photos={vehicle.photos} alt={vehicleTitle(vehicle)} />
          </Card>

          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-[26px] leading-tight">{vehicleTitle(vehicle)}</h1>
                <p className="mt-1.5 flex items-center gap-1.5 text-[14px] text-body">
                  <IconMapPin size={15} className="text-muted" />
                  {vehicle.city}, {vehicle.state} {vehicle.zip} · {miles(vehicle.mileage)}
                </p>
              </div>
              <button
                onClick={() => toggleSaved(vehicle.id)}
                aria-pressed={saved}
                className={cx(
                  "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[13.5px] font-display font-semibold transition-colors",
                  saved
                    ? "bg-lime-400 text-ink-950"
                    : "bg-white text-ink-900 ring-1 ring-inset ring-line-strong hover:bg-paper",
                )}
              >
                <IconHeart size={16} fill={saved ? "currentColor" : "none"} />
                {saved ? "Saved" : "Save"}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {vehicle.titleStatus === "clean" && <Badge tone="success" dot>Clean title</Badge>}
              {vehicle.owners === 1 && <Badge tone="neutral">1 owner</Badge>}
              <Badge tone="neutral">{vehicle.drivetrain}</Badge>
              <Badge tone="neutral">{vehicle.transmission}</Badge>
              <Badge tone="neutral">{vehicle.fuelType}</Badge>
              <Badge tone={vehicle.condition === "excellent" ? "lime" : "neutral"}>
                Condition: {vehicle.condition}
              </Badge>
            </div>

            {vehicle.highlights.length > 0 && (
              <div className="mt-5 border-t border-line pt-5">
                <h2 className="text-[15px] font-bold text-heading mb-3">Highlights</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {vehicle.highlights.map((h) => (
                    <li key={h} className="flex gap-2.5 text-[13.5px] text-body">
                      <IconCheck size={15} className="mt-0.5 shrink-0 text-success" strokeWidth={3} />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {vehicle.disclosures.length > 0 && (
              <div className="mt-5 border-t border-line pt-5">
                <h2 className="text-[15px] font-bold text-heading mb-3">Seller disclosures</h2>
                <ul className="space-y-2">
                  {vehicle.disclosures.map((d) => (
                    <li key={d} className="flex gap-2.5 text-[13.5px] text-body">
                      <IconAlert size={15} className="mt-0.5 shrink-0 text-warn" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Vehicle details" />
            <dl className="grid gap-x-8 sm:grid-cols-2">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-line py-2.5 last:border-0">
                  <dt className="text-[13.5px] text-muted">{k}</dt>
                  <dd className="text-[13.5px] font-medium text-heading text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <CardHeader
              title="Bid history"
              subtitle={`${bids.length} bid${bids.length === 1 ? "" : "s"} from ${new Set(bids.map((b) => b.dealerId)).size} dealers`}
            />
            <ul className="divide-y divide-line">
              {placed !== null && (
                <li className="flex items-center gap-3 py-3">
                  <DealerMark initials={dealer.markInitials} color={dealer.markColor} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-heading">You</span>
                    <span className="block text-[12px] text-muted">just now</span>
                  </span>
                  <Badge tone="success">Winning</Badge>
                  <span className="w-24 text-right font-display font-bold text-[15px] text-heading tabular-nums">
                    {money(placed)}
                  </span>
                </li>
              )}
              {bids.map((b) => {
                const d = dealerById(b.dealerId)!;
                const mine = b.dealerId === dealer.id;
                return (
                  <li key={b.id} className="flex items-center gap-3 py-3">
                    <DealerMark initials={d.markInitials} color={d.markColor} size={34} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-heading truncate">
                        {mine ? "You" : "Dealer " + d.dealerNumber.slice(-3)}
                      </span>
                      <span className="block text-[12px] text-muted">{relativeTime(b.placedAt)}</span>
                    </span>
                    <Badge tone={b.status === "winning" && placed === null ? "success" : "neutral"}>
                      {b.status === "winning" && placed === null ? "Winning" : b.status}
                    </Badge>
                    <span className="w-24 text-right font-display font-bold text-[15px] text-heading tabular-nums">
                      {money(b.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-[12px] text-muted">
              Competing dealers are anonymised until an offer is accepted.
            </p>
          </Card>
        </div>

        {/* ------------------------------------------------------- bidding */}
        <div className="space-y-5 xl:sticky xl:top-[84px]">
          <Card className="!bg-ink-950 !ring-ink-800">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-lime-400">
              Current high bid
            </p>
            <p className="mt-2 font-display font-extrabold text-[38px] text-white leading-none tracking-tight tabular-nums">
              {currentHigh ? money(currentHigh) : "No bids yet"}
            </p>
            {iAmWinning ? (
              <p className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-lime-400">
                <IconCheck size={14} strokeWidth={3} />
                You&apos;re the high bidder
              </p>
            ) : myBid ? (
              <p className="mt-2.5 text-[13px] text-danger font-semibold">
                You&apos;ve been outbid — your bid was {money(myBid.amount)}
              </p>
            ) : (
              <p className="mt-2.5 text-[13px] text-white/50">
                {bids.length} bid{bids.length === 1 ? "" : "s"} so far
              </p>
            )}

            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="text-[12px] text-white/50 mb-2.5">Bidding ends in</p>
              <Countdown to={CURRENT_EVENT_CLOSES_AT} tone="light" size="sm" />
              <p className="mt-3 text-[12px] text-white/45">
                {eventDeadlineLabel(CURRENT_EVENT_CLOSES_AT)}
              </p>
            </div>

            <div className="mt-5">
              <Button
                fullWidth
                size="lg"
                onClick={() => {
                  setAmount(String(minBid));
                  setBidOpen(true);
                }}
              >
                <IconGavel size={18} />
                {myBid || placed !== null ? "Raise my bid" : "Place a bid"}
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Seller's estimate" subtitle="What we told the seller to expect" />
            <p className="font-display font-extrabold text-[22px] text-heading leading-none tracking-tight tabular-nums">
              {money(vehicle.estimateLow)} – {money(vehicle.estimateHigh)}
            </p>
            {vehicle.reservePrice ? (
              <p className="mt-3 text-[13px] text-body">
                <strong className="text-heading">Reserve: {money(vehicle.reservePrice)}.</strong>{" "}
                The seller won&apos;t accept below this.
              </p>
            ) : (
              <p className="mt-3 text-[13px] text-body">
                <strong className="text-heading">No reserve.</strong> The seller may accept any
                offer — or none.
              </p>
            )}
          </Card>

          <Card>
            <CardHeader title="This listing" />
            <dl className="space-y-2.5 text-[13.5px]">
              {[
                ["Event", currentEvent.name],
                ["Dealer views", String(vehicle.viewCount)],
                ["Dealers watching", String(vehicle.saveCount)],
                ["Listed", relativeTime(vehicle.submittedAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-heading font-medium text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Callout tone="neutral" icon={<IconShieldCheck size={17} />}>
            <strong>Condition is seller-disclosed.</strong> Way More verifies the VIN and title
            status. Anything undisclosed at pickup is grounds to unwind the sale at no cost to you.
          </Callout>
        </div>
      </div>

      {/* ---------------------------------------------------------- modal */}
      <Modal
        open={bidOpen}
        onClose={() => setBidOpen(false)}
        title={`Bid on the ${vehicleTitle(vehicle)}`}
        description={`Current high bid is ${currentHigh ? money(currentHigh) : "—"}. Minimum increment is $100.`}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setBidOpen(false)}>Cancel</Button>
            <Button
              disabled={Number(amount) < minBid}
              onClick={() => {
                setPlaced(Number(amount));
                setBidOpen(false);
              }}
            >
              Place bid of {money(Number(amount) || 0)}
            </Button>
          </div>
        }
      >
        <Input
          label="Your bid"
          prefix="$"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
          error={amount && Number(amount) < minBid ? `Must be at least ${money(minBid)}` : undefined}
          hint={`minimum ${money(minBid)}`}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {[minBid, currentHigh + 500, currentHigh + 1000, currentHigh + 2000].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAmount(String(v))}
              className="rounded-lg bg-paper px-3 py-2 text-[13px] font-semibold text-ink-800 ring-1 ring-inset ring-line-strong hover:bg-mint-50 hover:ring-ink-200 transition-colors tabular-nums"
            >
              {money(v)}
            </button>
          ))}
        </div>

        <div className="mt-5 border-t border-line pt-5">
          <Checkbox
            label="Set a maximum automatic bid"
            description="We'll bid the minimum needed to keep you in front, up to your maximum."
            checked={autoBid}
            onChange={setAutoBid}
          />
          {autoBid && (
            <Input
              className="mt-4 max-w-xs"
              label="Maximum"
              prefix="$"
              inputMode="numeric"
              value={maxAuto}
              onChange={(e) => setMaxAuto(e.target.value.replace(/[^\d]/g, ""))}
              placeholder={String(currentHigh + 3000)}
            />
          )}
        </div>

        <div className="mt-5">
          <Callout tone="warn" icon={<IconAlert size={17} />}>
            Bids are binding for 48 hours after the event closes. If the seller accepts, you&apos;re
            committed to the purchase at that price.
          </Callout>
        </div>
      </Modal>
    </div>
  );
}
