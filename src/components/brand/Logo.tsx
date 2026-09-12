import Link from "next/link";
import { cx } from "@/lib/format";

/* ==========================================================================
   Way More wordmark
   --------------------------------------------------------------------------
   Set in the display face rather than as a traced path, so it stays crisp at
   any size and can be restyled from the type tokens. The terminal dot is the
   brand's one fixed gesture — it is always lime, always tight to the "e".
   ========================================================================== */

interface LogoProps {
  /** "dark" renders for light backgrounds, "light" for the ink bands. */
  tone?: "dark" | "light";
  /** Hide the "A better way to sell your car" lockup line. */
  showTagline?: boolean;
  tagline?: string;
  size?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
}

const SIZES = {
  sm: { word: "text-[19px]", dot: "size-[5px] mb-[3px] ml-[2px]", tag: "text-[6px] tracking-[0.14em]" },
  md: { word: "text-[26px]", dot: "size-[7px] mb-[4px] ml-[3px]", tag: "text-[7.5px] tracking-[0.155em]" },
  lg: { word: "text-[34px]", dot: "size-[9px] mb-[5px] ml-[3px]", tag: "text-[9px] tracking-[0.16em]" },
} as const;

export function Logo({
  tone = "dark",
  showTagline = true,
  tagline = "A BETTER WAY TO SELL YOUR CAR",
  size = "md",
  href = "/",
  className,
}: LogoProps) {
  const s = SIZES[size];
  const content = (
    <span className={cx("inline-flex flex-col leading-none", className)}>
      <span
        className={cx(
          "font-display font-extrabold tracking-[-0.035em] flex items-end",
          s.word,
          tone === "dark" ? "text-ink-950" : "text-white",
        )}
      >
        Way More
        <span className={cx("rounded-full bg-lime-400 inline-block", s.dot)} aria-hidden="true" />
      </span>
      {showTagline && (
        <span
          className={cx(
            "font-sans font-medium uppercase mt-[3px]",
            s.tag,
            tone === "dark" ? "text-ink-600/75" : "text-white/65",
          )}
        >
          {tagline}
        </span>
      )}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} aria-label="Way More — home" className="inline-flex shrink-0">
      {content}
    </Link>
  );
}

/** Square avatar-style mark for tight spaces (favicons, message threads). */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center justify-center rounded-full bg-ink-950 text-white font-display font-extrabold shrink-0",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      W<span className="text-lime-400">M</span>
    </span>
  );
}
