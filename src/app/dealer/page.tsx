"use client";

import Image from "next/image";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Disclosure";
import { Countdown } from "@/components/ui/Countdown";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { ActivityFeed } from "@/components/portal/ActivityFeed";
import { ScriptMark } from "@/components/brand/ScriptMark";
import { LinkRow, TrustItem } from "@/components/ui/Misc";
import {
  IconCalendar,
  IconCar,
  IconChart,
  IconClock,
  IconDollarCircle,
  IconGavel,
  IconHeart,
  IconPhone,
  IconSearch,
  IconShieldCheck,
  IconTrophy,
} from "@/components/icons";
import { useSession } from "@/context/SessionContext";
import { listedVehicles } from "@/lib/data/vehicles";
import { bidsForDealer, currentEvent, dealerActivity } from "@/lib/data/marketplace";
import { CURRENT_EVENT_CLOSES_AT, eventDeadlineLabel } from "@/lib/data/clock";
import { marketingImages } from "@/lib/images";

const TABS = [
  { key: "all", label: "All Vehicles" },
  { key: "Sedan", label: "Cars" },
  { key: "SUV", label: "SUVs" },
  { key: "Truck", label: "Trucks" },
  { key: "luxury", label: "Luxury" },
];

const LUXURY = ["BMW", "Acura", "Tesla", "Mercedes-Benz", "Lexus"];

export default function DealerDashboard() {
  const { dealer, savedVehicles } = useSession();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const myBids = bidsForDealer(dealer.id);
  const active = myBids.filter((b) => ["active", "winning", "outbid"].includes(b.status));
  const winning = myBids.filter((b) => b.status === "winning");

  const filtered = listedVehicles
    .filter((v) =>
      tab === "all"
        ? true
        : tab === "luxury"
          ? LUXURY.includes(v.make)
          : v.bodyStyle === tab,
    )
    .filter((v) =>
      `${v.year} ${v.make} ${v.model} ${v.trim}`.toLowerCase().includes(query.toLowerCase()),
    );

  const counts = {
    all: listedVehicles.length,
    Sedan: listedVehicles.filter((v) => v.bodyStyle === "Sedan").length,
    SUV: listedVehicles.filter((v) => v.bodyStyle === "SUV").length,
    Truck: listedVehicles.filter((v) => v.bodyStyle === "Truck").length,
    luxury: listedVehicles.filter((v) => LUXURY.includes(v.make)).length,
  } as Record<string, number>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1500px]">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px] items-start">
        <div className="space-y-5 min-w-0">
          {/* ------------------------------------------------------ hero */}
          <section className="relative overflow-hidden rounded-2xl bg-ink-950">
            <Image
              src={marketingImages.dealerLot}
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-[65%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/92 to-ink-950/30" />
            <div className="relative p-6 sm:p-8">
              <div className="flex items-start justify-between gap-6">
                <div className="max-w-xl">
                  <h1 className="text-white text-[28px] sm:text-[34px] leading-tight">
                    Welcome back, {dealer.name}!
                  </h1>
                  <p className="mt-1.5 text-[15.5px] text-white/70">
                    Great cars. Real sellers. A better way to buy.
                  </p>
                </div>
                <ScriptMark
                  lines={["More", "Inventory.", "More Profit.", "Way More."]}
                  size="sm"
                  align="right"
                  className="hidden lg:block shrink-0"
                />
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-3 max-w-2xl">
                <TrustItem tone="light" icon={<IconCar size={24} />} title="Local Inventory" sub="Sourced from real sellers in your area." />
                <TrustItem tone="light" icon={<IconDollarCircle size={24} />} title="No Fees" sub="No membership fees. No subscriptions." />
                <TrustItem tone="light" icon={<IconClock size={24} />} title="Competitive Bidding" sub="Transparent, timed dealer events." />
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------- event */}
          <Card className="!bg-mint-50 !ring-lime-200">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="flex items-start gap-3.5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-ink-800 ring-1 ring-lime-200">
                  <IconCalendar size={22} />
                </span>
                <div>
                  <p className="text-[15.5px] font-bold text-heading">This Week&apos;s Dealer Event</p>
                  <p className="text-[13px] text-body mt-0.5">
                    Bidding ends {eventDeadlineLabel(CURRENT_EVENT_CLOSES_AT)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <Countdown to={CURRENT_EVENT_CLOSES_AT} />
                <ButtonLink href="/dealer/inventory" withArrow className="!rounded-full">
                  View All Vehicles
                </ButtonLink>
              </div>
            </div>
          </Card>

          {/* ------------------------------------------------- inventory */}
          <Card className="!p-0 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 pt-4 border-b border-line">
              <Tabs
                tabs={TABS.map((t) => ({ ...t, count: counts[t.key] }))}
                active={tab}
                onChange={setTab}
              />
              <div className="flex items-center gap-2.5 pb-3">
                <div className="relative">
                  <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by make, model, or keyword"
                    aria-label="Search inventory"
                    className="h-9 w-[260px] max-w-full rounded-lg bg-paper pl-9 pr-3 text-[13px] text-heading placeholder:text-muted ring-1 ring-inset ring-transparent focus:ring-ink-600 focus:outline-none"
                  />
                </div>
                <ButtonLink href="/dealer/inventory" variant="outline" size="sm">
                  Filters
                </ButtonLink>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {filtered.slice(0, 6).map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
              {filtered.length > 6 && (
                <div className="mt-5 text-center">
                  <LinkRow href="/dealer/inventory">
                    See all {filtered.length} vehicles in this event
                  </LinkRow>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* -------------------------------------------------------- rail */}
        <div className="space-y-5">
          <Card>
            <CardHeader
              title="My Activity"
              action={
                <LinkRow href="/dealer/bids">View All</LinkRow>
              }
            />
            <ul className="space-y-3.5">
              {[
                { icon: <IconGavel size={17} />, v: active.length, l: "Active Bids" },
                { icon: <IconShieldCheck size={17} />, v: winning.length, l: "Winning Bids (This Month)" },
                { icon: <IconHeart size={17} />, v: savedVehicles.length, l: "Vehicles Saved" },
              ].map((s) => (
                <li key={s.l} className="flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-mint-50 text-ink-700">
                    {s.icon}
                  </span>
                  <span>
                    <span className="block font-display font-extrabold text-[19px] text-heading leading-none tabular-nums">
                      {s.v}
                    </span>
                    <span className="block text-[12.5px] text-muted mt-0.5">{s.l}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Recent Activity" />
            <ActivityFeed items={dealerActivity.slice(0, 5)} dense />
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mint-50 text-ink-800">
                <IconPhone size={19} />
              </span>
              <div>
                <p className="text-[14.5px] font-semibold text-heading">Need Help?</p>
                <p className="text-[12.5px] text-muted mt-0.5">Our team is here to help.</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <ButtonLink href="/dealer/support" variant="dark" fullWidth size="sm">
                Contact Support
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
            <div className="flex items-start gap-2.5">
              <IconChart size={20} className="shrink-0 mt-0.5 text-lime-600" />
              <div>
                <p className="text-[14px] font-bold text-heading">Quality inventory.</p>
                <p className="text-[14px] font-bold text-heading">Real opportunities.</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-body">
                  Way More connects you with motivated sellers and great vehicles in your market.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2.5">
              <IconTrophy size={20} className="text-warn shrink-0" />
              <p className="text-[13px] text-body">
                <strong className="text-heading">{currentEvent.registeredDealers} dealers</strong>{" "}
                registered for this event.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
