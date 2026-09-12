import { cx } from "@/lib/format";

/* ==========================================================================
   Dealer identity mark.
   --------------------------------------------------------------------------
   Real dealer logos are licensed brand assets we don't have, so each dealer
   gets a generated monogram from its own brand colour. `Dealer.markColor`
   and `Dealer.markInitials` come from the data layer, so dropping in real
   uploaded logos later means swapping this one component.
   ========================================================================== */

interface DealerMarkProps {
  initials: string;
  color: string;
  size?: number;
  rounded?: "full" | "lg";
  className?: string;
}

export function DealerMark({
  initials,
  color,
  size = 40,
  rounded = "lg",
  className,
}: DealerMarkProps) {
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center justify-center font-display font-bold text-white ring-1 ring-black/5",
        rounded === "full" ? "rounded-full" : "rounded-xl",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(140deg, ${color}, ${color}CC)`,
        letterSpacing: "-0.02em",
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

/** Neutral initials avatar for people. */
export function Avatar({
  initials,
  size = 36,
  tone = "ink",
  className,
}: {
  initials: string;
  size?: number;
  tone?: "ink" | "lime" | "muted";
  className?: string;
}) {
  const tones = {
    ink: "bg-ink-900 text-white",
    lime: "bg-lime-400 text-ink-950",
    muted: "bg-mint-100 text-ink-800",
  } as const;
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold",
        tones[tone],
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
