"use client";

import { useState, type ReactNode } from "react";
import { cx } from "@/lib/format";
import { IconMinus, IconPlus } from "@/components/icons";

export interface FaqItem {
  q: string;
  a: ReactNode;
}

export function Accordion({
  items,
  defaultOpen = -1,
  className,
}: {
  items: FaqItem[];
  defaultOpen?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cx("divide-y divide-line rounded-2xl bg-surface ring-1 ring-line", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 sm:px-6 sm:py-[18px] hover:bg-paper/60 transition-colors"
            >
              <span className="text-[14.5px] sm:text-[15px] font-medium text-heading">{item.q}</span>
              <span
                className={cx(
                  "shrink-0 grid size-6 place-items-center rounded-full transition-colors",
                  isOpen ? "bg-ink-900 text-white" : "text-ink-600",
                )}
              >
                {isOpen ? <IconMinus size={14} /> : <IconPlus size={14} />}
              </span>
            </button>
            <div
              className={cx(
                "grid transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="px-5 sm:px-6 pb-5 text-[14px] leading-relaxed text-body max-w-2xl">
                  {item.a}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { key: string; label: string; count?: number }[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cx("flex gap-1 overflow-x-auto scrollbar-slim -mb-px", className)}
    >
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.key)}
            className={cx(
              "shrink-0 px-3.5 py-2.5 text-[14px] font-semibold border-b-2 transition-colors whitespace-nowrap",
              on
                ? "border-lime-500 text-heading"
                : "border-transparent text-muted hover:text-heading",
            )}
          >
            {t.label}
            {typeof t.count === "number" && (
              <span className={cx("ml-1.5 text-[12.5px]", on ? "text-ink-600" : "text-muted")}>
                ({t.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
