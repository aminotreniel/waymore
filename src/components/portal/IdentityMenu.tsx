"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/format";
import { Avatar, DealerMark } from "@/components/brand/DealerMark";
import { IconChevronDown, IconLogout } from "@/components/icons";
import { supabase } from "@/lib/supabase/client";
import { useAuctions } from "@/context/AuctionContext";
import { dealers, sellers } from "@/lib/data/people";

/* ==========================================================================
   Prototype-only "viewing as" menu, mounted in the portal header chip.
   --------------------------------------------------------------------------
   Lets a reviewer move between the seller view and each bidding account
   without signing out. The bidder entries open a real Supabase session
   through the same server endpoint the sign-in card uses, so the account
   really is authenticated and row level security applies to it normally.
   The seller portal is a front end prototype with no account behind it, so
   that entry is a plain link. Remove this with the rest of the demo login.
   ========================================================================== */

const BIDDERS = dealers.slice(0, 3);
const SELLER = sellers[0];

export function IdentityMenu({
  name,
  subtitle,
  initials,
  markColor,
}: {
  name: string;
  subtitle?: string;
  initials: string;
  markColor?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useAuctions();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState<number | null>(null);
  const [failure, setFailure] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const demoEnabled = process.env.NEXT_PUBLIC_DEMO_LOGIN === "true";

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onSeller = pathname.startsWith("/seller");

  async function becomeBidder(index: number) {
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
      // Stay put when this is already a bidding screen, so the same auction can
      // be watched changing hands. Otherwise go to the dealer dashboard.
      if (!pathname.startsWith("/dealer")) router.push("/dealer");
    } catch (e) {
      setFailure(e instanceof Error ? e.message : "Could not switch account.");
    } finally {
      setSwitching(null);
    }
  }

  const row =
    "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors disabled:opacity-60";

  return (
    <div className="relative" ref={box}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2.5 hover:bg-paper transition-colors"
      >
        {markColor ? (
          <DealerMark initials={initials} color={markColor} size={34} rounded="full" />
        ) : (
          <Avatar initials={initials} size={34} tone="muted" />
        )}
        <span className="hidden sm:block text-left leading-tight">
          <span className="block text-[13.5px] font-semibold text-heading">{name}</span>
          {subtitle && <span className="block text-[11.5px] text-muted">{subtitle}</span>}
        </span>
        <IconChevronDown
          size={15}
          className={cx("text-muted transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[17.5rem] rounded-2xl bg-surface p-2 shadow-pop ring-1 ring-line animate-fade-up"
        >
          <p className="px-2.5 pt-1 pb-2 text-[10.5px] font-bold uppercase tracking-[0.13em] text-muted">
            Viewing as
          </p>

          <Link
            href="/seller"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={cx(row, onSeller ? "bg-mint-100" : "hover:bg-paper")}
          >
            <Avatar initials={SELLER.avatarInitials} size={30} tone="muted" />
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-semibold text-heading">Seller</span>
              <span className="block truncate text-[11.5px] text-muted">
                {SELLER.firstName} {SELLER.lastName} · seller portal
              </span>
            </span>
          </Link>

          {demoEnabled &&
            BIDDERS.map((dealer, index) => {
              const signedIn = data.dealer_id === dealer.id;
              const active = signedIn && !onSeller;
              const busy = switching === index;
              return (
                <button
                  key={dealer.id}
                  role="menuitem"
                  onClick={() => void becomeBidder(index)}
                  disabled={switching !== null}
                  className={cx(row, active ? "bg-mint-100" : "hover:bg-paper")}
                >
                  <DealerMark
                    initials={dealer.markInitials}
                    color={dealer.markColor}
                    size={30}
                    rounded="full"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold text-heading">
                      Bidder {index + 1}
                      {index === 0 && (
                        <span className="ml-1.5 text-[11px] font-medium text-muted">host</span>
                      )}
                    </span>
                    <span className="block truncate text-[11.5px] text-muted">{dealer.name}</span>
                  </span>
                  {busy ? (
                    <span className="text-[11px] text-muted">…</span>
                  ) : (
                    signedIn && <span className="text-[11px] text-muted">signed in</span>
                  )}
                </button>
              );
            })}

          {failure && (
            <p role="alert" className="px-2.5 py-2 text-[11.5px] text-danger">
              {failure}
            </p>
          )}

          <div className="mt-1 border-t border-line pt-1">
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void supabase.auth.signOut();
              }}
              className={cx(row, "hover:bg-paper text-[13.5px] font-medium text-body")}
            >
              <span className="grid size-[30px] place-items-center text-muted">
                <IconLogout size={16} />
              </span>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
