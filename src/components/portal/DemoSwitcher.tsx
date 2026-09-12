"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cx } from "@/lib/format";
import { IconBuilding, IconCar, IconChart, IconSparkle, IconX } from "@/components/icons";

/* ==========================================================================
   Prototype-only surface switcher.
   --------------------------------------------------------------------------
   There is no auth in this build, so this floating control lets a reviewer
   jump between the four surfaces without hunting for URLs. Delete this
   component (and its mount in the root layout) when real auth lands.
   ========================================================================== */

const SURFACES = [
  { href: "/", label: "Consumer site", icon: IconSparkle, match: (p: string) => p === "/" || ["/how-it-works", "/why-way-more", "/faqs", "/about", "/sell"].some((r) => p.startsWith(r)) },
  { href: "/seller", label: "Seller portal", icon: IconCar, match: (p: string) => p.startsWith("/seller") },
  { href: "/dealer", label: "Dealer portal", icon: IconBuilding, match: (p: string) => p.startsWith("/dealer") },
  { href: "/admin", label: "Admin portal", icon: IconChart, match: (p: string) => p.startsWith("/admin") },
];

export function DemoSwitcher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 print:hidden">
      {open && (
        <div className="mb-2 w-60 rounded-2xl bg-ink-950/95 backdrop-blur p-2 shadow-pop ring-1 ring-white/10 animate-fade-up">
          <div className="flex items-center justify-between px-2 pt-1 pb-2">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.13em] text-white/45">
              Prototype — jump to
            </span>
            <button
              onClick={() => setDismissed(true)}
              className="text-white/40 hover:text-white transition-colors"
              aria-label="Hide prototype switcher"
            >
              <IconX size={14} />
            </button>
          </div>
          {SURFACES.map((s) => {
            const on = s.match(pathname);
            const Icon = s.icon;
            return (
              <Link
                key={s.href}
                href={s.href}
                onClick={() => setOpen(false)}
                className={cx(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                  on ? "bg-lime-400 text-ink-950" : "text-white/80 hover:bg-white/10",
                )}
              >
                <Icon size={16} />
                {s.label}
              </Link>
            );
          })}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cx(
          "flex items-center gap-2 rounded-full bg-ink-950 px-4 h-11 text-[13px] font-semibold text-white shadow-pop ring-1 ring-white/10 hover:bg-ink-900 transition-colors",
        )}
        aria-expanded={open}
      >
        <span className="size-1.5 rounded-full bg-lime-400 animate-pulse-dot" />
        Prototype
      </button>
    </div>
  );
}
