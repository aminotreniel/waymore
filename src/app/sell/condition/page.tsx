"use client";

import { EstimateAside, FunnelShell } from "@/components/marketing/FunnelShell";
import { Checkbox, ChoiceCard, Select, Textarea } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Misc";
import { IconAlert } from "@/components/icons";
import { useSellFlow } from "@/context/SellFlowContext";

const CONDITIONS = [
  { value: "excellent", label: "Excellent", description: "No visible damage. Looks nearly new inside and out." },
  { value: "good", label: "Good", description: "Normal wear for the mileage. Maybe a small ding or scuff." },
  { value: "fair", label: "Fair", description: "Noticeable cosmetic wear, or a mechanical item needing attention." },
  { value: "rough", label: "Rough", description: "Significant damage, or it doesn't currently drive." },
];

const FEATURES = [
  "Leather seats", "Sunroof / moonroof", "Apple CarPlay", "Android Auto", "Navigation",
  "Backup camera", "Blind spot monitor", "Adaptive cruise", "Heated seats", "Cooled seats",
  "Third row", "Tow package", "Premium audio", "Remote start",
];

const DISCLOSURES = [
  "Warning light currently on",
  "Accident damage (repaired)",
  "Hail or flood damage",
  "Aftermarket modifications",
  "Tyres need replacing soon",
  "Windshield chip or crack",
];

export default function SellConditionPage() {
  const { data, set, toggleFeature } = useSellFlow();

  return (
    <FunnelShell
      stepIndex={1}
      title="How's it holding up?"
      lead="Be straight with us here. Accurate answers mean the offers you get are firm — dealers don't come back and renegotiate at pickup."
      aside={<EstimateAside />}
      backHref="/sell"
      nextHref="/sell/estimate"
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-[17px] mb-3">Overall condition</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {CONDITIONS.map((c) => (
              <ChoiceCard
                key={c.value}
                label={c.label}
                description={c.description}
                selected={data.condition === c.value}
                onSelect={() => set("condition", c.value)}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-surface ring-1 ring-line shadow-card p-5 sm:p-6">
          <h2 className="text-[17px] mb-4">History &amp; paperwork</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Title status"
              options={[
                { value: "clean", label: "Clean title — I own it outright" },
                { value: "lien", label: "Clean title — loan still outstanding" },
                { value: "rebuilt", label: "Rebuilt / reconstructed" },
                { value: "salvage", label: "Salvage" },
              ]}
              value={data.titleStatus}
              onChange={(e) => set("titleStatus", e.target.value)}
            />
            <Select
              label="Number of owners"
              options={["1", "2", "3", "4 or more"]}
              value={data.owners}
              onChange={(e) => set("owners", e.target.value)}
            />
            <Select
              label="Reported accidents"
              options={["0", "1", "2", "3 or more"]}
              value={data.accidents}
              onChange={(e) => set("accidents", e.target.value)}
            />
            <Select
              label="Keys included"
              options={["1", "2", "3 or more"]}
              value={data.keys}
              onChange={(e) => set("keys", e.target.value)}
            />
          </div>

          {data.titleStatus === "lien" && (
            <div className="mt-4">
              <Callout tone="info">
                No problem — this is common. We&apos;ll ask for your lender and approximate payoff
                before pickup. The dealer pays your lender directly and you receive the difference.
              </Callout>
            </div>
          )}
          {(data.titleStatus === "salvage" || data.titleStatus === "rebuilt") && (
            <div className="mt-4">
              <Callout tone="warn" icon={<IconAlert size={17} />}>
                Branded titles get fewer bids and lower numbers, but plenty of our dealers still buy
                them. Declaring it now is what keeps the offer firm.
              </Callout>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-surface ring-1 ring-line shadow-card p-5 sm:p-6">
          <h2 className="text-[17px]">Features</h2>
          <p className="text-[13.5px] text-muted mt-1 mb-4">
            Tick anything your car has. Dealers price these in.
          </p>
          <div className="flex flex-wrap gap-2">
            {FEATURES.map((f) => {
              const on = data.features.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFeature(f)}
                  aria-pressed={on}
                  className={
                    on
                      ? "rounded-full px-3.5 py-2 text-[13px] font-medium bg-ink-900 text-white transition-colors"
                      : "rounded-full px-3.5 py-2 text-[13px] font-medium bg-white text-body ring-1 ring-inset ring-line-strong hover:ring-ink-200 hover:text-heading transition-colors"
                  }
                >
                  {f}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-surface ring-1 ring-line shadow-card p-5 sm:p-6">
          <h2 className="text-[17px]">Anything we should flag?</h2>
          <p className="text-[13.5px] text-muted mt-1 mb-4">
            Dealers bid more confidently when they know what they&apos;re getting.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {DISCLOSURES.map((d) => (
              <Checkbox
                key={d}
                label={d}
                checked={data.disclosures.includes(d)}
                onChange={(v) =>
                  set("disclosures", v ? [...data.disclosures, d] : data.disclosures.filter((x) => x !== d))
                }
              />
            ))}
          </div>
          <Textarea
            className="mt-5"
            label="Anything else"
            hint="optional"
            placeholder="e.g. new brakes at 60k, small dent on the rear passenger door…"
          />
        </section>
      </div>
    </FunnelShell>
  );
}
