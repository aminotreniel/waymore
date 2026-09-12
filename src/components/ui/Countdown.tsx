"use client";

import { useSyncExternalStore } from "react";
import { cx, splitCountdown } from "@/lib/format";

/* ==========================================================================
   Live countdown to the close of a dealer event.
   --------------------------------------------------------------------------
   The ticking clock is an external store rather than an effect-driven
   interval: the server (and the hydrating client) read `getServerSnapshot`
   and render a placeholder, then the client subscribes and the real numbers
   appear. No hydration mismatch, no layout shift, no setState-in-effect.
   ========================================================================== */

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}

/** Bucketed to whole seconds so repeated reads inside one tick are stable. */
const getSnapshot = () => Math.floor(Date.now() / 1000) * 1000;
const getServerSnapshot = () => null;

export function Countdown({
  to,
  tone = "dark",
  size = "md",
  className,
}: {
  to: string;
  tone?: "dark" | "light";
  size?: "sm" | "md";
  className?: string;
}) {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const t = now === null ? null : splitCountdown(to, new Date(now));

  const parts = [
    { value: t?.days, label: "DAYS" },
    { value: t?.hours, label: "HOURS" },
    { value: t?.minutes, label: "MINUTES" },
  ];

  return (
    <div
      className={cx("flex items-start", size === "sm" ? "gap-4" : "gap-5 sm:gap-7", className)}
      aria-label="Time remaining in this event"
    >
      {parts.map((p) => (
        <div key={p.label} className="text-center">
          <div
            className={cx(
              "font-display font-extrabold tabular-nums leading-none",
              size === "sm" ? "text-[20px]" : "text-[26px] sm:text-[30px]",
              tone === "dark" ? "text-heading" : "text-white",
            )}
          >
            {p.value ?? "–"}
          </div>
          <div
            className={cx(
              "mt-1 font-semibold tracking-[0.09em]",
              size === "sm" ? "text-[9px]" : "text-[10px]",
              tone === "dark" ? "text-muted" : "text-white/60",
            )}
          >
            {p.label}
          </div>
        </div>
      ))}
    </div>
  );
}
