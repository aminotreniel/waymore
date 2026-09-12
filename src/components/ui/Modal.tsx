"use client";

import { useEffect, type ReactNode } from "react";
import { cx } from "@/lib/format";
import { IconX } from "@/components/icons";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-ink-950/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          "relative w-full bg-surface shadow-pop animate-fade-up",
          "rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col",
          widths[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 pb-4 border-b border-line">
          <div className="min-w-0">
            <h2 className="text-[19px] leading-tight">{title}</h2>
            {description && <p className="text-[13.5px] text-body mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 grid size-8 place-items-center rounded-lg text-muted hover:bg-paper hover:text-heading transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>
        <div className="p-5 sm:p-6 overflow-y-auto scrollbar-slim">{children}</div>
        {footer && (
          <div className="p-5 sm:p-6 pt-4 border-t border-line bg-paper/60 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
