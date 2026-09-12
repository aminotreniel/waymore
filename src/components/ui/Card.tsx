import type { ReactNode } from "react";
import { cx } from "@/lib/format";

export function Card({
  children,
  className,
  padded = true,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <Tag
      className={cx(
        "bg-surface rounded-2xl ring-1 ring-line shadow-card",
        padded && "p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  action,
  subtitle,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex items-start justify-between gap-4 mb-4", className)}>
      <div className="min-w-0">
        <h3 className="text-[15.5px] font-bold text-heading">{title}</h3>
        {subtitle && <p className="text-[13px] text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  lead,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cx(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-lime-600 font-display font-semibold tracking-[0.16em] text-[12px] uppercase mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="text-[30px] sm:text-[38px] leading-[1.1]">{title}</h2>
      {lead && <p className="mt-3.5 text-[16px] leading-relaxed text-body">{lead}</p>}
    </div>
  );
}
