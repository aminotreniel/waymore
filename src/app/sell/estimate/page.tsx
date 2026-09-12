"use client";

import Link from "next/link";
import { FunnelShell } from "@/components/marketing/FunnelShell";
import { Card } from "@/components/ui/Card";
import { Callout, TrustItem } from "@/components/ui/Misc";
import { IconCalendar, IconClock, IconDollarCircle, IconInfo, IconShieldCheck, IconUsers } from "@/components/icons";
import { useSellFlow } from "@/context/SellFlowContext";
import { money } from "@/lib/format";
import { CURRENT_EVENT_CLOSES_AT, eventDeadlineLabel } from "@/lib/data/clock";
import { Countdown } from "@/components/ui/Countdown";

export default function SellEstimatePage() {
  const { data, estimate } = useSellFlow();
  const title = [data.year, data.make, data.model, data.trim].filter(Boolean).join(" ");

  return (
    <FunnelShell
      stepIndex={2}
      title="Here's what your car should sell for"
      lead="This is a live market range — not an offer. The real number comes from dealers bidding against each other in Wednesday's event."
      backHref="/sell/condition"
      nextHref="/sell/account"
      nextLabel="Get real offers"
      wide
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <Card className="!p-0 overflow-hidden">
          <div className="bg-ink-950 px-6 py-8 text-center">
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.13em] text-lime-400">
              Estimated value
            </p>
            <p className="mt-3 font-display font-extrabold text-[38px] sm:text-[46px] text-white leading-none tracking-tight tabular-nums">
              {money(estimate.low)} – {money(estimate.high)}
            </p>
            <p className="mt-3.5 text-[14px] text-white/60">
              {title || "Your vehicle"} · {Number(data.mileage || 0).toLocaleString()} mi ·{" "}
              {data.zip}
            </p>
          </div>

          <div className="p-6">
            <h2 className="text-[16.5px]">How we calculated this</h2>
            <ul className="mt-3.5 space-y-3">
              {[
                { l: "Live wholesale auction data", d: "What comparable cars actually sold for in the last 30 days." },
                { l: "Retail listings near " + (data.zip || "you"), d: "What dealers in your metro are asking for the same year and trim." },
                { l: "Recent Way More results", d: "What our own dealers have paid for similar vehicles in past events." },
                { l: "Your condition answers", d: "Mileage, ownership history, title status and disclosed issues." },
              ].map((r) => (
                <li key={r.l} className="flex gap-3">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-lime-400" />
                  <span>
                    <span className="block text-[14px] font-semibold text-heading">{r.l}</span>
                    <span className="block text-[13px] text-body mt-0.5">{r.d}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Callout tone="neutral" icon={<IconInfo size={17} />}>
                Sellers whose cars go to a full dealer event finish, on average,{" "}
                <strong>above the midpoint</strong> of this range. Cars with all six photos and no
                undisclosed damage do best.
              </Callout>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="!bg-mint-50 !ring-lime-200">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-ink-800 ring-1 ring-lime-200">
                <IconCalendar size={21} />
              </span>
              <div className="min-w-0">
                <h3 className="text-[15.5px] leading-snug">This week&apos;s dealer event</h3>
                <p className="text-[13px] text-body mt-0.5">
                  Bidding ends {eventDeadlineLabel(CURRENT_EVENT_CLOSES_AT)}
                </p>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-lime-200/70">
              <Countdown to={CURRENT_EVENT_CLOSES_AT} size="sm" />
            </div>
            <p className="mt-4 text-[12.5px] leading-relaxed text-body">
              Finish your listing before bidding closes and your car goes into this event. Otherwise
              it rolls into next Wednesday&apos;s — either way it&apos;s free.
            </p>
          </Card>

          <Card>
            <h3 className="text-[15.5px] mb-4">What happens next</h3>
            <div className="space-y-4">
              <TrustItem icon={<IconUsers size={22} />} title="Create a free account" sub="Takes about 60 seconds" />
              <TrustItem icon={<IconClock size={22} />} title="Add six quick photos" sub="From your phone, in your driveway" />
              <TrustItem icon={<IconDollarCircle size={22} />} title="Receive real offers" sub="No obligation to accept any" />
              <TrustItem icon={<IconShieldCheck size={22} />} title="Free pickup and payment" sub="Usually same day" />
            </div>
          </Card>

          <p className="text-[12.5px] leading-relaxed text-muted px-1">
            Not ready?{" "}
            <Link href="/how-it-works" className="font-semibold text-ink-800 underline underline-offset-2 hover:text-lime-600">
              Read how the event works
            </Link>{" "}
            first — nothing here expires.
          </p>
        </div>
      </div>
    </FunnelShell>
  );
}
