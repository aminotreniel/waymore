"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ProgressSteps } from "@/components/ui/Misc";
import { SELL_STEPS, useSellFlow } from "@/context/SellFlowContext";
import { Button } from "@/components/ui/Button";
import { IconArrowLeft, IconArrowRight } from "@/components/icons";
import { money, cx } from "@/lib/format";
import { useRouter } from "next/navigation";

export function FunnelShell({
  stepIndex,
  title,
  lead,
  children,
  aside,
  nextHref,
  nextLabel = "Continue",
  backHref,
  canContinue = true,
  onNext,
  wide = false,
}: {
  stepIndex: number;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
  nextHref?: string;
  nextLabel?: string;
  backHref?: string;
  canContinue?: boolean;
  onNext?: () => void;
  wide?: boolean;
}) {
  const router = useRouter();

  return (
    <div className="container-page py-8 sm:py-11">
      <div className="mb-8 overflow-x-auto scrollbar-slim pb-1">
        <ProgressSteps steps={SELL_STEPS.map((s) => ({ key: s.key, label: s.label }))} current={stepIndex} />
      </div>

      <div className={cx("grid gap-7", aside && !wide ? "lg:grid-cols-[minmax(0,1fr)_320px]" : undefined)}>
        <div className={cx("min-w-0", !aside ? "max-w-2xl" : undefined)}>
          <h1 className="text-[28px] sm:text-[34px] leading-[1.12]">{title}</h1>
          {lead && <p className="mt-3 text-[15.5px] leading-relaxed text-body max-w-xl">{lead}</p>}

          <div className="mt-7">{children}</div>

          <div className="mt-9 flex items-center justify-between gap-4 border-t border-line pt-6">
            {backHref ? (
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-body hover:text-heading transition-colors"
              >
                <IconArrowLeft size={16} />
                Back
              </Link>
            ) : (
              <span />
            )}
            {(nextHref || onNext) && (
              <Button
                size="lg"
                disabled={!canContinue}
                onClick={() => (onNext ? onNext() : nextHref && router.push(nextHref))}
              >
                {nextLabel}
                <IconArrowRight size={18} />
              </Button>
            )}
          </div>
        </div>

        {aside && <aside className="lg:sticky lg:top-8 lg:self-start">{aside}</aside>}
      </div>
    </div>
  );
}

/** Live estimate card shown alongside the funnel once there's enough input. */
export function EstimateAside() {
  const { data, estimate } = useSellFlow();
  return (
    <div className="rounded-2xl bg-surface ring-1 ring-line shadow-card p-5">
      <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">
        Working estimate
      </p>
      <p className="mt-2.5 font-display font-extrabold text-[26px] text-heading leading-none tracking-tight tabular-nums">
        {money(estimate.low)} – {money(estimate.high)}
      </p>
      <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted">
        Updates as you answer. Your real number comes from what dealers actually bid.
      </p>
      <dl className="mt-5 space-y-2 border-t border-line pt-4 text-[13px]">
        {[
          ["Vehicle", [data.year, data.make, data.model].filter(Boolean).join(" ") || "—"],
          ["Mileage", data.mileage ? `${Number(data.mileage).toLocaleString()} mi` : "—"],
          ["Condition", data.condition ? data.condition[0].toUpperCase() + data.condition.slice(1) : "—"],
          ["ZIP", data.zip || "—"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-muted">{k}</dt>
            <dd className="text-heading font-medium text-right truncate">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
