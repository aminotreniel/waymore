import Image from "next/image";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Avatar } from "@/components/brand/DealerMark";
import { ScriptMark, Way } from "@/components/brand/ScriptMark";
import { SectionTitle } from "@/components/ui/Card";
import { TrustItem } from "@/components/ui/Misc";
import {
  IconChevronRight,
  IconClock,
  IconDollarCircle,
  IconShieldCheck,
  IconStar,
  IconUsers,
} from "@/components/icons";
import { marketingImages } from "@/lib/images";
import { cx } from "@/lib/format";

/* ============================================================== trust bar */

export const TRUST_ITEMS = [
  { icon: <IconShieldCheck size={26} />, title: "Trusted", sub: "Local Dealers" },
  { icon: <IconDollarCircle size={26} />, title: "No Hidden Fees", sub: "No Games" },
  { icon: <IconClock size={26} />, title: "Fast & Easy", sub: "From Home" },
  { icon: <IconUsers size={26} />, title: "You're in Control", sub: "Always" },
];

export function TrustBar({
  tone = "dark",
  items = TRUST_ITEMS,
  compact = false,
  className,
}: {
  tone?: "dark" | "light";
  items?: typeof TRUST_ITEMS;
  /** Lays out on one row and never wraps a label — used inside the hero. */
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <div className={cx("flex flex-wrap gap-x-9 gap-y-5", className)}>
        {items.map((item) => (
          <div key={item.title} className="whitespace-nowrap">
            <TrustItem icon={item.icon} title={item.title} sub={item.sub} tone={tone} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div
      className={cx(
        "grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x",
        tone === "light" ? "lg:divide-white/12" : "lg:divide-line",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.title} className="lg:px-6 lg:first:pl-0 lg:last:pr-0">
          <TrustItem icon={item.icon} title={item.title} sub={item.sub} tone={tone} />
        </div>
      ))}
    </div>
  );
}

/* ============================================================ steps strip */

export const STEPS = [
  {
    n: 1,
    title: "Tell Us About Your Car",
    body: "Share a few quick details and some photos.",
    longBody:
      "Share a few quick details and we'll give you a real-time estimate of what your car should sell for.",
  },
  {
    n: 2,
    title: "Local Dealers Compete",
    body: "Trusted dealers in your area bid on your car.",
    longBody:
      "Create a free account, take a few photos, and get your car listed to Wednesday's dealer event.",
  },
  {
    n: 3,
    title: "Get Your Best Offer",
    body: "You'll receive the highest offers — no obligation.",
    longBody:
      "Local, trusted dealers compete to make you their best offer — no obligation. You're in control and can choose what works best for you.",
  },
  {
    n: 4,
    title: "Choose & Get Paid",
    body: "Accept the offer you like best. It's that easy.",
    longBody:
      "Accept the offer you like best. We'll help coordinate the final details, so you can get paid — fast.",
  },
];

/* ========================================================== testimonials */

/**
 * Placeholder testimonials. These are illustrative sample copy for the
 * prototype, not real customer quotes — swap in verified reviews (and the
 * reviewers' own photos, with permission) before launch.
 */
export const TESTIMONIALS = [
  {
    quote: "I got $3,000 more than the big chain offered. Super easy process!",
    name: "Mike T.",
    location: "St. Louis, MO",
    initials: "MT",
  },
  {
    quote: "So fast and convenient. I had offers within hours and sold the next day!",
    name: "Jessica R.",
    location: "O'Fallon, MO",
    initials: "JR",
  },
  {
    quote: "No hassle, no pressure. Way More made it simple and actually fun!",
    name: "Chris D.",
    location: "Chesterfield, MO",
    initials: "CD",
  },
];

export function Stars({ count = 5 }: { count?: number }) {
  return (
    <span className="flex gap-0.5 text-warn" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <IconStar key={i} size={14} fill="currentColor" strokeWidth={1} />
      ))}
    </span>
  );
}

export function Testimonials({
  heading = "Real Sellers. Real Results.",
  lead,
}: {
  heading?: ReactNode;
  lead?: ReactNode;
}) {
  return (
    <section className="bg-paper py-16 sm:py-20">
      <div className="container-page">
        <SectionTitle title={heading} lead={lead} />
        <div className="mt-11 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="bg-surface rounded-2xl ring-1 ring-line shadow-card p-5 flex gap-4"
            >
              <Avatar initials={t.initials} size={52} tone="muted" className="mt-0.5" />
              <div className="min-w-0">
                <blockquote className="text-[14.5px] leading-relaxed text-heading">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-3 flex items-end justify-between gap-3">
                  <span>
                    <span className="block text-[13.5px] font-semibold text-heading">
                      — {t.name}
                    </span>
                    <span className="block text-[12.5px] text-muted">{t.location}</span>
                  </span>
                  <Stars />
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================== CTA band */

export function CTABand({
  heading,
  sub,
  cta = "Get My Offer",
  href = "/sell",
}: {
  heading?: ReactNode;
  sub?: string;
  cta?: string;
  href?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-ink-950">
      <Image
        src={marketingImages.openRoad}
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/40" />
      <div className="container-page relative py-16 sm:py-20 text-center">
        <h2 className="text-white text-[32px] sm:text-[42px] leading-[1.08]">
          {heading ?? (
            <>
              Ready to get <Way /> more?
            </>
          )}
        </h2>
        <div className="mt-7 flex justify-center">
          <ButtonLink href={href} size="lg" withArrow>
            {cta}
          </ButtonLink>
        </div>
        <p className="mt-5 text-[14.5px] text-white/60">
          {sub ?? "Just a better way to sell your car."}
        </p>
      </div>
    </section>
  );
}

/* ============================================================ page hero */

export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  scriptLines,
  imagePosition = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  image: string;
  scriptLines?: string[];
  imagePosition?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-ink-950">
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: imagePosition }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-950/20" />
      <div className="container-page relative py-16 sm:py-20">
        <div className="flex items-center justify-between gap-10">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="text-lime-400 font-display font-semibold tracking-[0.18em] text-[12.5px] uppercase mb-4">
                {eyebrow}
              </p>
            )}
            <h1 className="text-white text-[36px] sm:text-[52px] leading-[1.04]">{title}</h1>
            {lead && (
              <p className="mt-5 text-[16.5px] leading-relaxed text-white/75 max-w-xl">{lead}</p>
            )}
          </div>
          {scriptLines && (
            <ScriptMark lines={scriptLines} size="md" className="hidden xl:block shrink-0" />
          )}
        </div>
      </div>
    </section>
  );
}

/* ==================================================== numbered step card */

export function StepArrow() {
  return (
    <IconChevronRight
      size={24}
      strokeWidth={2.5}
      className="shrink-0 text-lime-500"
      aria-hidden="true"
    />
  );
}
