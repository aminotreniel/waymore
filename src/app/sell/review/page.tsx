"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { FunnelShell } from "@/components/marketing/FunnelShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Callout } from "@/components/ui/Misc";
import { Input, Checkbox } from "@/components/ui/Field";
import { Countdown } from "@/components/ui/Countdown";
import { IconCheckCircle, IconPencil } from "@/components/icons";
import { useSellFlow } from "@/context/SellFlowContext";
import { money } from "@/lib/format";
import { CURRENT_EVENT_CLOSES_AT, eventDeadlineLabel } from "@/lib/data/clock";
import { vehicleImages } from "@/lib/images";

export default function SellReviewPage() {
  const { data, estimate, set } = useSellFlow();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [useReserve, setUseReserve] = useState(false);

  const title = [data.year, data.make, data.model, data.trim].filter(Boolean).join(" ");
  const filled = data.photos.filter((p) => p.filled).length;

  const submit = () => {
    setSubmitting(true);
    // Stands in for POST /api/listings — the confirmation is routed to once the
    // draft is accepted by the server.
    setTimeout(() => router.push("/sell/confirmation"), 900);
  };

  const rows: [string, string, string][] = [
    ["Vehicle", title || "—", "/sell"],
    ["Mileage", `${Number(data.mileage || 0).toLocaleString()} mi`, "/sell"],
    ["Location", data.zip, "/sell"],
    ["Condition", data.condition[0].toUpperCase() + data.condition.slice(1), "/sell/condition"],
    ["Title", data.titleStatus === "lien" ? "Clean — loan outstanding" : data.titleStatus[0].toUpperCase() + data.titleStatus.slice(1), "/sell/condition"],
    ["Owners", data.owners, "/sell/condition"],
    ["Accidents", data.accidents, "/sell/condition"],
    ["Keys", data.keys, "/sell/condition"],
    ["Photos", `${filled} added`, "/sell/photos"],
    ["Account", data.email || "—", "/sell/account"],
  ];

  return (
    <FunnelShell
      stepIndex={5}
      title="Review and submit"
      lead="One last look. Once you submit, our team reviews the listing — usually within a couple of hours — and your car goes into the next dealer event."
      backHref="/sell/photos"
      onNext={submit}
      nextLabel={submitting ? "Submitting…" : "Submit my listing"}
      canContinue={!submitting}
      wide
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,330px)]">
        <div className="space-y-5">
          <Card className="!p-0 overflow-hidden">
            <div className="relative aspect-[16/7]">
              <Image
                src={vehicleImages.accord}
                alt={title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-white text-[22px] leading-tight">{title}</h2>
                  <p className="text-white/70 text-[13.5px] mt-0.5">
                    {Number(data.mileage || 0).toLocaleString()} mi · {data.zip}
                  </p>
                </div>
                <Badge tone="lime">{filled} photos</Badge>
              </div>
            </div>

            <dl className="divide-y divide-line">
              {rows.map(([label, value, href]) => (
                <div key={label} className="flex items-center gap-4 px-5 sm:px-6 py-3">
                  <dt className="w-28 shrink-0 text-[13px] text-muted">{label}</dt>
                  <dd className="flex-1 min-w-0 text-[14px] font-medium text-heading truncate">
                    {value}
                  </dd>
                  <Link
                    href={href}
                    className="shrink-0 inline-flex items-center gap-1 text-[12.5px] font-semibold text-ink-700 hover:text-lime-600 transition-colors"
                  >
                    <IconPencil size={13} />
                    Edit
                  </Link>
                </div>
              ))}
            </dl>
          </Card>

          {data.features.length > 0 && (
            <Card>
              <h3 className="text-[15.5px] mb-3">Features you listed</h3>
              <div className="flex flex-wrap gap-2">
                {data.features.map((f) => (
                  <Badge key={f} tone="neutral">{f}</Badge>
                ))}
              </div>
            </Card>
          )}

          {data.disclosures.length > 0 && (
            <Card>
              <h3 className="text-[15.5px] mb-3">Disclosures</h3>
              <ul className="space-y-2">
                {data.disclosures.map((d) => (
                  <li key={d} className="flex gap-2.5 text-[13.5px] text-body">
                    <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-warn" />
                    {d}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <h3 className="text-[15.5px]">Set a reserve?</h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-body">
              A reserve is the lowest number you&apos;d accept. Most sellers skip it — you can
              decline every offer anyway, and cars without a reserve attract more bidders.
            </p>
            <div className="mt-4">
              <Checkbox
                label="Set a reserve price"
                checked={useReserve}
                onChange={(v) => {
                  setUseReserve(v);
                  if (!v) set("reserve", "");
                }}
              />
            </div>
            {useReserve && (
              <Input
                className="mt-4 max-w-xs"
                label="Reserve price"
                prefix="$"
                inputMode="numeric"
                placeholder={String(estimate.low)}
                value={data.reserve}
                onChange={(e) => set("reserve", e.target.value.replace(/[^\d]/g, ""))}
              />
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="!bg-ink-950 !ring-ink-800">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-lime-400">
              Your estimate
            </p>
            <p className="mt-2.5 font-display font-extrabold text-[27px] text-white leading-none tracking-tight tabular-nums">
              {money(estimate.low)} – {money(estimate.high)}
            </p>
            <p className="mt-3 text-[12.5px] leading-relaxed text-white/55">
              Dealers bid against this range. Nothing is binding until you accept an offer.
            </p>
          </Card>

          <Card>
            <h3 className="text-[15.5px]">Next dealer event</h3>
            <p className="text-[13px] text-body mt-1">
              Closes {eventDeadlineLabel(CURRENT_EVENT_CLOSES_AT)}
            </p>
            <div className="mt-4 pt-4 border-t border-line">
              <Countdown to={CURRENT_EVENT_CLOSES_AT} size="sm" />
            </div>
          </Card>

          <Callout tone="success" icon={<IconCheckCircle size={17} />}>
            <strong>Free, and no obligation.</strong> Submitting costs nothing and doesn&apos;t
            commit you to selling. You can withdraw the listing any time before you accept an offer.
          </Callout>
        </div>
      </div>
    </FunnelShell>
  );
}
