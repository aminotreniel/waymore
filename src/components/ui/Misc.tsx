import type { ReactNode } from "react";
import Link from "next/link";
import { cx } from "@/lib/format";
import { IconArrowRight, IconCheck, IconCheckCircle } from "@/components/icons";

/* ------------------------------------------------------------- stat tile */
export function StatTile({
  value,
  label,
  tone = "default",
  hint,
  delta,
  className,
}: {
  value: ReactNode;
  label: string;
  hint?: string;
  tone?: "default" | "lime" | "ink";
  delta?: number | null;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-2xl p-5 ring-1",
        tone === "ink"
          ? "bg-ink-900 ring-ink-800 text-white"
          : tone === "lime"
            ? "bg-mint-50 ring-lime-200"
            : "bg-surface ring-line shadow-card",
        className,
      )}
    >
      <div className="flex items-baseline gap-2">
        <span
          className={cx(
            "font-display font-extrabold text-[27px] leading-none tracking-tight",
            tone === "ink" ? "text-white" : "text-heading",
          )}
        >
          {value}
        </span>
        {typeof delta === "number" && (
          <span
            className={cx(
              "text-[12px] font-semibold",
              delta >= 0 ? "text-success" : "text-danger",
            )}
          >
            {delta >= 0 ? "+" : ""}
            {delta}%
          </span>
        )}
      </div>
      <div
        className={cx(
          "mt-1.5 text-[13px] font-medium",
          tone === "ink" ? "text-white/70" : "text-body",
        )}
      >
        {label}
      </div>
      {hint && (
        <div className={cx("mt-0.5 text-[11.5px]", tone === "ink" ? "text-white/45" : "text-muted")}>
          {hint}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------- trust feature */
export function TrustItem({
  icon,
  title,
  sub,
  tone = "dark",
}: {
  icon: ReactNode;
  title: string;
  sub: string;
  tone?: "dark" | "light";
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={cx("shrink-0", tone === "light" ? "text-white" : "text-ink-800")}>{icon}</span>
      <span className="leading-[1.25]">
        <span
          className={cx(
            "block text-[13.5px] font-semibold",
            tone === "light" ? "text-white" : "text-heading",
          )}
        >
          {title}
        </span>
        <span
          className={cx("block text-[13.5px]", tone === "light" ? "text-white/70" : "text-body")}
        >
          {sub}
        </span>
      </span>
    </div>
  );
}

/* -------------------------------------------------------- checklist item */
export function ChecklistRow({
  label,
  done,
  muted,
}: {
  label: string;
  done: boolean;
  muted?: boolean;
}) {
  return (
    <li className="flex items-center gap-2.5 py-1.5">
      <span
        className={cx(
          "grid size-5 shrink-0 place-items-center rounded-full",
          done ? "bg-lime-400 text-ink-950" : "ring-1 ring-inset ring-line-strong text-transparent",
        )}
      >
        <IconCheck size={12} strokeWidth={3} />
      </span>
      <span className={cx("text-[13.5px]", muted || !done ? "text-muted" : "text-heading")}>
        {label}
      </span>
    </li>
  );
}

/* ------------------------------------------------------------ empty state */
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-14 px-6">
      {icon && (
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-mint-50 text-ink-600">
          {icon}
        </div>
      )}
      <h3 className="text-[16.5px]">{title}</h3>
      {body && <p className="mt-1.5 text-[14px] text-body max-w-sm mx-auto">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* --------------------------------------------------------- progress steps */
export function ProgressSteps({
  steps,
  current,
}: {
  steps: { key: string; label: string }[];
  current: number;
}) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3" aria-label="Progress">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.key} className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={cx(
                  "grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-display font-bold transition-colors",
                  done
                    ? "bg-lime-400 text-ink-950"
                    : active
                      ? "bg-ink-900 text-white"
                      : "bg-white ring-1 ring-inset ring-line-strong text-muted",
                )}
              >
                {done ? <IconCheck size={13} strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={cx(
                  "text-[13px] font-medium truncate hidden sm:block",
                  active ? "text-heading" : done ? "text-ink-600" : "text-muted",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={cx(
                  "h-px w-4 sm:w-8 shrink-0",
                  done ? "bg-lime-400" : "bg-line-strong",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------- timeline */
export function Timeline({
  steps,
}: {
  steps: { label: string; description: string; completedAt: string | null; active?: boolean }[];
}) {
  return (
    <ol className="relative">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={s.label} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && (
              <span
                className={cx(
                  "absolute left-[13px] top-7 bottom-0 w-0.5",
                  s.completedAt ? "bg-lime-400" : "bg-line",
                )}
                aria-hidden="true"
              />
            )}
            <span
              className={cx(
                "relative z-10 grid size-7 shrink-0 place-items-center rounded-full",
                s.completedAt
                  ? "bg-lime-400 text-ink-950"
                  : s.active
                    ? "bg-ink-900 text-white ring-4 ring-mint-100"
                    : "bg-white ring-1 ring-inset ring-line-strong text-line-strong",
              )}
            >
              {s.completedAt ? (
                <IconCheck size={14} strokeWidth={3} />
              ) : (
                <span className="size-2 rounded-full bg-current" />
              )}
            </span>
            <div className="min-w-0 pt-0.5">
              <p
                className={cx(
                  "text-[14.5px] font-semibold",
                  s.completedAt || s.active ? "text-heading" : "text-muted",
                )}
              >
                {s.label}
              </p>
              <p className="text-[13px] text-body mt-0.5 leading-snug">{s.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------- link row */
export function LinkRow({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-800 hover:text-lime-600 transition-colors group"
    >
      {children}
      <IconArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/* ----------------------------------------------------------- info banner */
export function Callout({
  tone = "info",
  icon,
  children,
}: {
  tone?: "info" | "success" | "warn" | "danger" | "neutral";
  icon?: ReactNode;
  children: ReactNode;
}) {
  const tones = {
    info: "bg-info-bg text-info/95 ring-info/12",
    success: "bg-success-bg text-success ring-success/12",
    warn: "bg-warn-bg text-warn ring-warn/12",
    danger: "bg-danger-bg text-danger ring-danger/12",
    neutral: "bg-mint-50 text-ink-800 ring-lime-200",
  };
  return (
    <div className={cx("flex gap-2.5 rounded-xl px-4 py-3 ring-1 ring-inset", tones[tone])}>
      <span className="shrink-0 mt-px">{icon ?? <IconCheckCircle size={17} />}</span>
      <div className="text-[13px] leading-relaxed [&_strong]:font-semibold">{children}</div>
    </div>
  );
}
