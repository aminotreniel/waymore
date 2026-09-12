import type { ReactNode } from "react";
import { cx } from "@/lib/format";

type Tone = "neutral" | "lime" | "ink" | "success" | "info" | "warn" | "danger" | "outline";

const TONES: Record<Tone, string> = {
  neutral: "bg-paper text-body ring-1 ring-inset ring-line",
  lime: "bg-lime-100 text-lime-700 ring-1 ring-inset ring-lime-200",
  ink: "bg-ink-900 text-white",
  success: "bg-success-bg text-success ring-1 ring-inset ring-success/15",
  info: "bg-info-bg text-info ring-1 ring-inset ring-info/15",
  warn: "bg-warn-bg text-warn ring-1 ring-inset ring-warn/15",
  danger: "bg-danger-bg text-danger ring-1 ring-inset ring-danger/15",
  outline: "bg-white text-ink-800 ring-1 ring-inset ring-line-strong",
};

export function Badge({
  children,
  tone = "neutral",
  icon,
  className,
  dot,
}: {
  children: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold leading-none",
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current opacity-70" />}
      {icon}
      {children}
    </span>
  );
}

/** Maps a VehicleStatus to a human label + tone. */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; tone: Tone }> = {
    draft: { label: "Draft", tone: "neutral" },
    pending_review: { label: "Pending review", tone: "warn" },
    approved: { label: "Approved", tone: "info" },
    listed: { label: "Live in event", tone: "success" },
    bidding_closed: { label: "Bidding closed", tone: "neutral" },
    offer_accepted: { label: "Offer accepted", tone: "success" },
    sold: { label: "Sold", tone: "ink" },
    rejected: { label: "Rejected", tone: "danger" },
    withdrawn: { label: "Withdrawn", tone: "neutral" },
    pending: { label: "Pending", tone: "warn" },
    accepted: { label: "Accepted", tone: "success" },
    declined: { label: "Declined", tone: "danger" },
    countered: { label: "Countered", tone: "info" },
    expired: { label: "Expired", tone: "neutral" },
    active: { label: "Active", tone: "info" },
    winning: { label: "Winning", tone: "success" },
    outbid: { label: "Outbid", tone: "danger" },
    won: { label: "Won", tone: "success" },
    lost: { label: "Lost", tone: "neutral" },
    live: { label: "Live", tone: "success" },
    scheduled: { label: "Scheduled", tone: "info" },
    closed: { label: "Closed", tone: "neutral" },
    suspended: { label: "Suspended", tone: "danger" },
  };
  const entry = map[status] ?? { label: status, tone: "neutral" as Tone };
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}
