"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { IconMenu, IconX } from "@/components/icons";
import { cx } from "@/lib/format";

const NAV = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/why-way-more", label: "Why Way More" },
  { href: "/faqs", label: "FAQs" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Navigating closes the mobile menu. Adjusting state during render is the
  // documented React pattern for "reset state when a prop changes" — it costs
  // one extra render pass and avoids an effect that would flash the open menu.
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-line">
      <div className="container-page flex items-center justify-between h-[74px] gap-6">
        <Logo size="md" />

        <nav className="hidden lg:flex items-center gap-8" aria-label="Main">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "relative text-[14.5px] font-medium transition-colors py-1",
                  active ? "text-heading" : "text-body hover:text-heading",
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-0.5 left-0 right-0 h-[2.5px] rounded-full bg-lime-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/seller"
            className="text-[14.5px] font-medium text-body hover:text-heading transition-colors"
          >
            Sign in
          </Link>
          <ButtonLink href="/sell" size="md" className="!rounded-full !px-6">
            Get My Offer
          </ButtonLink>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden grid size-10 place-items-center rounded-xl text-heading hover:bg-paper transition-colors"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <IconX size={22} /> : <IconMenu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-line bg-surface animate-fade-up">
          <nav className="container-page py-4 flex flex-col" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-3 text-[15px] font-medium text-heading border-b border-line last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2.5 pt-4">
              <ButtonLink href="/sell" fullWidth withArrow>
                Get My Offer
              </ButtonLink>
              <ButtonLink href="/seller" variant="outline" fullWidth>
                Sign in
              </ButtonLink>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
