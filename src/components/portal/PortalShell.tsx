"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType, type ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { Avatar, DealerMark } from "@/components/brand/DealerMark";
import type { IconProps } from "@/components/icons";
import { IconBell, IconChevronDown, IconLogout, IconMenu, IconX } from "@/components/icons";
import { cx } from "@/lib/format";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
  badge?: number;
  /** Match this item for any path beneath it, not just an exact match. */
  deep?: boolean;
}

export interface PortalIdentity {
  name: string;
  subtitle?: string;
  initials: string;
  /** When set, renders the coloured dealer monogram instead of a neutral avatar. */
  markColor?: string;
}

export function PortalShell({
  nav,
  identity,
  footer,
  tagline,
  unread = 0,
  children,
}: {
  nav: NavItem[];
  identity: PortalIdentity;
  footer?: ReactNode;
  tagline?: string;
  unread?: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Navigating closes the mobile drawer — see the note in SiteHeader.
  const [drawerPath, setDrawerPath] = useState(pathname);
  if (drawerPath !== pathname) {
    setDrawerPath(pathname);
    setMobileOpen(false);
  }

  const isActive = (item: NavItem) =>
    item.deep ? pathname === item.href || pathname.startsWith(item.href + "/") : pathname === item.href;

  const navList = (
    <nav className="flex flex-col gap-1" aria-label="Portal sections">
      {nav.map((item) => {
        const on = isActive(item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={on ? "page" : undefined}
            className={cx(
              "group flex items-center gap-3 rounded-xl px-3.5 h-11 text-[14px] font-medium transition-colors",
              on
                ? "bg-mint-100 text-ink-900 font-semibold"
                : "text-body hover:bg-paper hover:text-heading",
            )}
          >
            <Icon size={19} className={on ? "text-ink-800" : "text-muted group-hover:text-ink-600"} />
            <span className="flex-1 truncate">{item.label}</span>
            {typeof item.badge === "number" && item.badge > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1.5 text-[11px] font-bold text-white">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-paper">
      {/* ------------------------------------------------------------ top */}
      <header className="sticky top-0 z-30 bg-surface border-b border-line">
        <div className="flex h-[68px] items-center gap-4 px-4 sm:px-6">
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden grid size-10 shrink-0 place-items-center rounded-xl text-heading hover:bg-paper transition-colors"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <IconX size={21} /> : <IconMenu size={21} />}
          </button>

          <div className="lg:w-[244px] shrink-0">
            <Logo size="sm" tagline={tagline} />
          </div>

          <div className="flex-1" />

          <button
            className="relative grid size-10 place-items-center rounded-xl text-body hover:bg-paper hover:text-heading transition-colors"
            aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
          >
            <IconBell size={20} />
            {unread > 0 && (
              <span className="absolute right-2 top-2 size-2 rounded-full bg-danger ring-2 ring-surface" />
            )}
          </button>

          <button className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2.5 hover:bg-paper transition-colors">
            {identity.markColor ? (
              <DealerMark initials={identity.initials} color={identity.markColor} size={34} rounded="full" />
            ) : (
              <Avatar initials={identity.initials} size={34} tone="muted" />
            )}
            <span className="hidden sm:block text-left leading-tight">
              <span className="block text-[13.5px] font-semibold text-heading">{identity.name}</span>
              {identity.subtitle && (
                <span className="block text-[11.5px] text-muted">{identity.subtitle}</span>
              )}
            </span>
            <IconChevronDown size={15} className="text-muted" />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* --------------------------------------------------- side rail */}
        <aside className="hidden lg:flex w-[268px] shrink-0 flex-col border-r border-line bg-surface sticky top-[68px] h-[calc(100vh-68px)]">
          <div className="flex-1 overflow-y-auto scrollbar-slim p-4">{navList}</div>
          {footer && <div className="p-4 border-t border-line">{footer}</div>}
        </aside>

        {/* ------------------------------------------------ mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40 top-[68px]">
            <div
              className="absolute inset-0 bg-ink-950/35"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div className="relative h-full w-[280px] max-w-[85%] bg-surface border-r border-line flex flex-col animate-fade-up">
              <div className="flex-1 overflow-y-auto scrollbar-slim p-4">{navList}</div>
              {footer && <div className="p-4 border-t border-line">{footer}</div>}
            </div>
          </div>
        )}

        <main id="main" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- helpers */

export function PortalHelpCard({
  title = "Need Help?",
  body = "We're here for you.",
  cta = "Chat with Us",
  href = "/seller/messages",
  phone,
  icon,
}: {
  title?: string;
  body?: string;
  cta?: string;
  href?: string;
  phone?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-surface ring-1 ring-line p-4">
      <div className="flex items-start gap-2.5">
        {icon && <span className="text-ink-700 mt-0.5 shrink-0">{icon}</span>}
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-heading">{title}</p>
          <p className="text-[12.5px] text-muted mt-0.5">{body}</p>
        </div>
      </div>
      <Link
        href={href}
        className="mt-3.5 inline-flex h-9 w-full items-center justify-center rounded-lg bg-white text-[13px] font-display font-semibold text-ink-900 ring-1 ring-inset ring-line-strong hover:bg-paper transition-colors"
      >
        {cta}
      </Link>
      {phone && (
        <a
          href={`tel:${phone.replace(/\D/g, "")}`}
          className="mt-2 inline-flex h-9 w-full items-center justify-center rounded-lg text-[13px] font-display font-semibold text-body hover:text-heading transition-colors"
        >
          {phone}
        </a>
      )}
    </div>
  );
}

export function PortalSignOut() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 rounded-xl px-3.5 h-10 text-[13.5px] font-medium text-muted hover:bg-paper hover:text-heading transition-colors"
    >
      <IconLogout size={18} />
      Sign out
    </Link>
  );
}

/** Standard page header inside a portal. */
export function PortalHeader({
  title,
  lead,
  action,
  className,
}: {
  title: ReactNode;
  lead?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="text-[26px] sm:text-[30px] leading-tight">{title}</h1>
        {lead && <p className="mt-1.5 text-[14.5px] text-body">{lead}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
