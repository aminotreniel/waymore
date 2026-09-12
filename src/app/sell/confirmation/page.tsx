"use client";

import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Countdown } from "@/components/ui/Countdown";
import { Timeline } from "@/components/ui/Misc";
import { IconCheck } from "@/components/icons";
import { useSellFlow } from "@/context/SellFlowContext";
import { CURRENT_EVENT_CLOSES_AT, eventDeadlineLabel } from "@/lib/data/clock";
import { money } from "@/lib/format";

export default function SellConfirmationPage() {
  const { data, estimate } = useSellFlow();
  const title = [data.year, data.make, data.model, data.trim].filter(Boolean).join(" ");

  return (
    <div className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-lime-400 text-ink-950 animate-fade-up">
          <IconCheck size={32} strokeWidth={3} />
        </div>
        <h1 className="mt-6 text-[32px] sm:text-[40px] leading-[1.1]">
          Your listing is in.
        </h1>
        <p className="mt-4 text-[16.5px] leading-relaxed text-body">
          Thanks{data.firstName ? `, ${data.firstName}` : ""} — your {title || "vehicle"} has been
          submitted for review. We&apos;ll email{" "}
          <strong className="text-heading font-semibold">{data.email || "you"}</strong> as soon as
          it&apos;s approved, usually within a couple of hours.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-4xl grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <Card>
          <h2 className="text-[17px] mb-5">What happens from here</h2>
          <Timeline
            steps={[
              { label: "Listing submitted", description: "We have everything we need from you for now.", completedAt: new Date().toISOString() },
              { label: "Way More review", description: "We check your photos and details, usually within two hours.", completedAt: null, active: true },
              { label: "Live in the dealer event", description: `Dealers bid until ${eventDeadlineLabel(CURRENT_EVENT_CLOSES_AT)}.`, completedAt: null },
              { label: "Offers arrive", description: "Review them in your portal. Accept, counter or decline — no obligation.", completedAt: null },
              { label: "Free pickup and payment", description: "The dealer collects the car and you're paid, usually the same day.", completedAt: null },
            ]}
          />
        </Card>

        <div className="space-y-5">
          <Card className="!bg-mint-50 !ring-lime-200">
            <h3 className="text-[15.5px]">Bidding closes in</h3>
            <div className="mt-3.5">
              <Countdown to={CURRENT_EVENT_CLOSES_AT} size="sm" />
            </div>
            <p className="mt-4 text-[12.5px] leading-relaxed text-body">
              {eventDeadlineLabel(CURRENT_EVENT_CLOSES_AT)}
            </p>
          </Card>

          <Card>
            <p className="text-[12px] font-semibold uppercase tracking-[0.11em] text-muted">
              Your estimate
            </p>
            <p className="mt-2 font-display font-extrabold text-[23px] text-heading leading-none tracking-tight tabular-nums">
              {money(estimate.low)} – {money(estimate.high)}
            </p>
          </Card>

          <div className="space-y-2.5">
            <ButtonLink href="/seller" fullWidth withArrow>
              Go to my portal
            </ButtonLink>
            <ButtonLink href="/" variant="outline" fullWidth>
              Back to home
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
