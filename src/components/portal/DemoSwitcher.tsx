"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cx } from "@/lib/format";
import { IconBuilding, IconCar, IconChart, IconSparkle, IconX } from "@/components/icons";
import { supabase } from "@/lib/supabase/client";
import { useAuctions } from "@/context/AuctionContext";
import { dealers } from "@/lib/data/people";

/* ==========================================================================
   Prototype-only switcher.
   --------------------------------------------------------------------------
   Two jobs, both for reviewers: jump between the four surfaces without
   hunting for URLs, and swap between the demo dealer accounts without going
   back to the sign-in screen. The account list opens a real Supabase session
   through the same server endpoint the sign-in card uses, so the switched
   account is genuinely authenticated, not impersonated in the browser.
   Delete this component (and its mount in the root layout) when real auth
   lands, along with the demo-login route.
   ========================================================================== */

const SURFACES = [
  { href: "/", label: "Consumer site", icon: IconSparkle, match: (p: string) => p === "/" || ["/how-it-works", "/why-way-more", "/faqs", "/about", "/sell"].some((r) => p.startsWith(r)) },
  { href: "/seller", label: "Seller portal", icon: IconCar, match: (p: string) => p.startsWith("/seller") },
  { href: "/dealer", label: "Dealer portal", icon: IconBuilding, match: (p: string) => p.startsWith("/dealer") },
  { href: "/admin", label: "Admin portal", icon: IconChart, match: (p: string) => p.startsWith("/admin") },
];

const DEMO_ACCOUNTS = dealers.slice(0, 3);

export function DemoSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useAuctions();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [switching, setSwitching] = useState<number | null>(null);
  const [failure, setFailure] = useState("");
  const demoEnabled = process.env.NEXT_PUBLIC_DEMO_LOGIN === "true";

  async function switchAccount(index: number) {
    if (switching !== null) return;
    setSwitching(index);
    setFailure("");
    try {
      const response = await fetch("/api/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: index }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not open that account.");
      const { error } = await supabase.auth.setSession(result);
      if (error) throw error;
      setOpen(false);
      // Stay where you are if this is already a dealer screen, so you can watch
      // the same auction change hands. Otherwise land on the dealer dashboard.
      if (!pathname.startsWith("/dealer")) router.push("/dealer");
    } catch (e) {
      setFailure(e instanceof Error ? e.message : "Could not switch account.");
    } finally {
      setSwitching(null);
    }
  }

  if (dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 print:hidden">
      {open && (
        <div className="mb-2 w-[17rem] rounded-2xl bg-ink-950/95 backdrop-blur p-2 shadow-pop ring-1 ring-white/10 animate-fade-up">
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

          {demoEnabled && (
            <>
              <div className="mt-2 border-t border-white/10 px-2 pt-3 pb-2">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.13em] text-white/45">
                  Demo account
                </span>
              </div>
              {DEMO_ACCOUNTS.map((dealer, index) => {
                const active = data.dealer_id === dealer.id;
                const busy = switching === index;
                return (
                  <button
                    key={dealer.id}
                    onClick={() => void switchAccount(index)}
                    disabled={switching !== null}
                    aria-current={active}
                    className={cx(
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-medium transition-colors disabled:opacity-60",
                      active ? "bg-lime-400 text-ink-950" : "text-white/80 hover:bg-white/10",
                    )}
                  >
                    <span
                      className="grid size-6 shrink-0 place-items-center rounded-full text-[9.5px] font-bold text-white ring-1 ring-white/20"
                      style={{ background: dealer.markColor }}
                    >
                      {dealer.markInitials}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {dealer.name}
                      {index === 0 && (
                        <span className={cx("ml-1.5 text-[11px]", active ? "text-ink-950/60" : "text-white/40")}>
                          Demo host
                        </span>
                      )}
                    </span>
                    {busy && <span className="text-[11px] text-white/60">…</span>}
                    {active && !busy && <span className="text-[11px] text-ink-950/60">Signed in</span>}
                  </button>
                );
              })}
              {failure && (
                <p role="alert" className="px-3 py-2 text-[11.5px] text-red-300">
                  {failure}
                </p>
              )}
            </>
          )}
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
