import { cx } from "@/lib/format";

/* ==========================================================================
   The hand-lettered "More Money. Less Hassle. Way More." mark.
   --------------------------------------------------------------------------
   In the mockups this is a painted brush lockup sitting over photography.
   Rebuilt here as live text plus an SVG underline swash so it stays
   selectable, translatable, and sharp on any display.
   ========================================================================== */

interface ScriptMarkProps {
  lines?: string[];
  className?: string;
  tone?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  align?: "left" | "right";
}

const SIZES = {
  sm: "text-[17px] sm:text-[19px]",
  md: "text-[22px] sm:text-[27px]",
  lg: "text-[27px] sm:text-[34px]",
} as const;

export function ScriptMark({
  lines = ["More", "Money.", "More Freedom.", "Way More."],
  className,
  tone = "light",
  size = "md",
  align = "left",
}: ScriptMarkProps) {
  return (
    <div
      className={cx(
        "script-mark select-none pointer-events-none",
        SIZES[size],
        tone === "light" ? "text-white" : "text-ink-950",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
      aria-hidden="true"
    >
      {lines.map((line, i) => (
        <div
          key={line + i}
          className="whitespace-nowrap"
          style={{ transform: `rotate(-5deg) translateX(${i * 6}px)` }}
        >
          {line}
        </div>
      ))}
      <Swash className={align === "right" ? "ml-auto" : ""} />
    </div>
  );
}

function Swash({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 132 16"
      className={cx("mt-0.5 w-[7.5em] max-w-full", className)}
      fill="none"
      aria-hidden="true"
      style={{ transform: "rotate(-5deg)" }}
    >
      <path
        d="M2 12.5C22 6.5 52 2.5 84 3.5c16 .5 33 3 46 7"
        stroke="var(--color-lime-400)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Inline lime-highlighted "WAY" used inside headlines. */
export function Way() {
  return <span className="text-lime-400">WAY</span>;
}
