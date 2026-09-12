"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Countdown } from "@/components/ui/Countdown";
import { ButtonLink } from "@/components/ui/Button";
import { ActivityFeed } from "@/components/portal/ActivityFeed";
import { ChecklistRow, LinkRow } from "@/components/ui/Misc";
import { ScriptMark } from "@/components/brand/ScriptMark";
import {
  IconCalendar,
  IconCamera,
  IconCheckCircle,
  IconInfo,
  IconPencil,
  IconPhone,
  IconTrophy,
} from "@/components/icons";
import { useSession } from "@/context/SessionContext";
import { vehicleById } from "@/lib/data/vehicles";
import { currentEvent, offersForVehicle, sellerActivity } from "@/lib/data/marketplace";
import { CURRENT_EVENT_CLOSES_AT, eventDeadlineLabel } from "@/lib/data/clock";
import { money, miles, vehicleTitle } from "@/lib/format";
import { marketingImages } from "@/lib/images";

export default function SellerDashboard() {
  const { seller } = useSession();
  const vehicle = vehicleById(seller.vehicleIds[0])!;
  const offers = offersForVehicle(vehicle.id);
  const liveOffers = offers.filter((o) => o.status === "pending");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px]">
      {/* ---------------------------------------------------------- hero */}
      <section className="relative overflow-hidden rounded-2xl bg-ink-950">
        <Image
          src={marketingImages.sunsetDrive}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[72%_45%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/90 to-surface/60 sm:bg-gradient-to-r sm:from-surface sm:via-surface/92 sm:to-surface/10" />
        <div className="relative flex items-center justify-between gap-6 p-6 sm:p-7">
          <div>
            <h1 className="text-[28px] sm:text-[34px] leading-tight">
              Welcome back, {seller.firstName}!
            </h1>
            <p className="mt-1 text-[16px] text-body">Here&apos;s the latest on your car.</p>
          </div>
          <ScriptMark
            lines={["More", "Money.", "Less Hassle.", "Way More."]}
            tone="dark"
            size="sm"
            className="hidden md:block shrink-0"
          />
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] items-start">
        <div className="space-y-5 min-w-0">
          {/* ------------------------------------------------ event strip */}
          <Card className="!bg-mint-50 !ring-lime-200">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="flex items-start gap-3.5 min-w-0">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-ink-800 ring-1 ring-lime-200">
                  <IconCalendar size={22} />
                </span>
                <div className="min-w-0">
                  <p className="text-[15.5px] font-bold text-heading">
                    Your car is in this week&apos;s dealer event!
                  </p>
                  <p className="text-[13px] text-body mt-0.5">
                    Dealer bidding ends {eventDeadlineLabel(CURRENT_EVENT_CLOSES_AT)}
                  </p>
                </div>
              </div>
              <Countdown to={CURRENT_EVENT_CLOSES_AT} />
            </div>
          </Card>

          {/* ---------------------------------------------------- vehicle */}
          <Card className="!p-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <Link
                href="/seller/vehicle"
                className="relative w-full sm:w-[268px] shrink-0 aspect-[4/3] sm:aspect-auto sm:min-h-[196px] group"
              >
                <Image
                  src={vehicle.photos[0].url}
                  alt={vehicleTitle(vehicle)}
                  fill
                  sizes="(max-width: 640px) 100vw, 268px"
                  className="object-cover"
                />
                <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-lg bg-ink-950/75 backdrop-blur px-2.5 py-1.5 text-[11.5px] font-semibold text-white">
                  <IconCamera size={13} />
                  View Photos
                </span>
              </Link>

              <div className="flex-1 min-w-0 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-[19px] leading-tight">{vehicleTitle(vehicle)}</h2>
                  <Link
                    href="/seller/vehicle"
                    className="shrink-0 inline-flex items-center gap-1 text-[12.5px] font-semibold text-ink-700 hover:text-lime-600 transition-colors"
                  >
                    <IconPencil size={13} />
                    Edit
                  </Link>
                </div>
                <dl className="mt-2.5 space-y-1 text-[13.5px] text-body">
                  <div><dt className="inline text-muted">VIN: </dt><dd className="inline font-medium text-heading">{vehicle.vin}</dd></div>
                  <div><dt className="inline text-muted">Mileage: </dt><dd className="inline font-medium text-heading">{miles(vehicle.mileage)}</dd></div>
                  <div><dt className="inline text-muted">Location: </dt><dd className="inline font-medium text-heading">{vehicle.city}, {vehicle.state}</dd></div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge tone="success" dot>Listed for {new Date(currentEvent.closesAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} event</Badge>
                  <Badge tone="lime" dot>Visible to Dealers</Badge>
                  <Badge tone="neutral">{vehicle.reservePrice ? `Reserve ${money(vehicle.reservePrice)}` : "No Reserve"}</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* --------------------------------------------------- activity */}
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-5 mb-4">
              <div>
                <h2 className="text-[16px] font-bold text-heading flex items-center gap-2">
                  Live Activity
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-[13px] text-body">
                  <span className="size-2 rounded-full bg-success animate-pulse-dot" />
                  Dealers are viewing your car now.
                </p>
              </div>
              <div className="flex gap-7 sm:gap-9">
                {[
                  { v: vehicle.viewCount, l: "Dealer Views" },
                  { v: new Set(offers.map((o) => o.dealerId)).size, l: "Active Bidders" },
                  { v: vehicle.bidCount, l: "Total Bids" },
                ].map((s) => (
                  <div key={s.l} className="text-center">
                    <div className="font-display font-extrabold text-[23px] text-heading leading-none tabular-nums">
                      {s.v}
                    </div>
                    <div className="mt-1 text-[11.5px] text-muted">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-line">
              <ActivityFeed items={sellerActivity.slice(0, 5)} dense />
            </div>
            <div className="mt-3 text-center">
              <LinkRow href="/seller/vehicle">View All Activity</LinkRow>
            </div>
          </Card>

          {/* ---------------------------------------------------- control */}
          <Card className="!bg-mint-50 !ring-lime-200">
            <div className="flex items-center justify-between gap-5">
              <div className="flex items-start gap-3.5">
                <span className="shrink-0 text-ink-800"><IconTrophy size={26} /></span>
                <div>
                  <p className="text-[15.5px] font-bold text-heading">You&apos;re in the driver&apos;s seat.</p>
                  <p className="text-[13px] text-body mt-0.5">
                    You choose whether to accept the top offer — no obligation.
                  </p>
                </div>
              </div>
              <span className="script-mark hidden sm:block text-[19px] text-ink-950 shrink-0 -rotate-3">
                Get <span className="font-extrabold">WAY</span> more.
              </span>
            </div>
          </Card>
        </div>

        {/* --------------------------------------------------------- rail */}
        <div className="space-y-5 min-w-0">
          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-1.5">
                  Estimated Value
                  <IconInfo size={14} className="text-muted" />
                </span>
              }
            />
            <p className="font-display font-extrabold text-[27px] text-heading leading-none tracking-tight tabular-nums">
              {money(vehicle.estimateLow)} – {money(vehicle.estimateHigh)}
            </p>
            <p className="mt-3 text-[12.5px] leading-relaxed text-body">
              Based on your details, current market data, and local dealer demand.
            </p>
            <div className="mt-3.5">
              <LinkRow href="/seller/vehicle">How we calculate this</LinkRow>
            </div>
          </Card>

          {liveOffers.length > 0 && (
            <Card className="!bg-ink-950 !ring-ink-800">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-lime-400">
                Top offer so far
              </p>
              <p className="mt-2 font-display font-extrabold text-[30px] text-white leading-none tracking-tight tabular-nums">
                {money(liveOffers[0].amount)}
              </p>
              <p className="mt-2 text-[13px] text-white/60">
                {liveOffers.length} live offer{liveOffers.length === 1 ? "" : "s"} on your car
              </p>
              <div className="mt-4">
                <ButtonLink href="/seller/offers" fullWidth size="sm" withArrow>
                  Review offers
                </ButtonLink>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="Your To-Do List" />
            <ul>
              <ChecklistRow label="Vehicle details submitted" done />
              <ChecklistRow label="Photos uploaded" done />
              <ChecklistRow label="Listed for dealer event" done />
              <ChecklistRow label="Review your offers" done={false} />
            </ul>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mint-50 text-ink-800">
                <IconPhone size={19} />
              </span>
              <div>
                <p className="text-[14.5px] font-semibold text-heading">Questions?</p>
                <p className="text-[12.5px] text-muted mt-0.5">Our team is here to help.</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <ButtonLink href="/seller/messages" variant="dark" fullWidth size="sm">
                Chat with Us
              </ButtonLink>
              <a
                href="tel:+13145550123"
                className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-white text-[13px] font-display font-semibold text-ink-900 ring-1 ring-inset ring-line-strong hover:bg-paper transition-colors"
              >
                Call 314-555-0123
              </a>
              <p className="text-center text-[12px] text-muted pt-1">Mon – Fri: 8am – 6pm CT</p>
            </div>
          </Card>

          <Card className="!bg-mint-50 !ring-lime-200">
            <div className="flex gap-2.5">
              <IconCheckCircle size={18} className="shrink-0 mt-0.5 text-lime-600" />
              <p className="text-[12.5px] leading-relaxed text-body">
                <strong className="text-heading">You&apos;re in control.</strong> We only share your
                information with verified, trusted dealers.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
