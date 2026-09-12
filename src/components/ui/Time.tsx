import type { ReactNode } from "react";
import {
  dateTime,
  longDate,
  relativeTime,
  shortCountdown,
  shortDate,
  timeOfDay,
} from "@/lib/format";

/* ==========================================================================
   <Time> — hydration-safe timestamp rendering
   --------------------------------------------------------------------------
   The prototype has no database, so every fixture timestamp is generated
   relative to load time (see lib/data/clock.ts). Pages are prerendered, so an
   ABSOLUTE rendering of one of those timestamps ("Sep 12 at 10:24 AM") is
   baked at build time and necessarily differs from what the client computes —
   a genuine hydration mismatch.

   Relative renderings ("28 minutes ago") are stable, because the fixture and
   the reference clock shift together.

   `suppressHydrationWarning` is the documented React escape hatch for exactly
   this: server and client legitimately disagree about the current time. The
   client value wins, which is the one the user should see.

   Once timestamps come from the API this becomes an ordinary <time> element
   and the attribute can be dropped.
   ========================================================================== */

type Format = "datetime" | "date" | "longdate" | "time" | "relative" | "countdown";

const FORMATTERS: Record<Format, (iso: string) => string> = {
  datetime: dateTime,
  date: shortDate,
  longdate: longDate,
  time: timeOfDay,
  relative: relativeTime,
  countdown: shortCountdown,
};

export function Time({
  iso,
  format = "datetime",
  className,
  suffix,
}: {
  iso: string;
  format?: Format;
  className?: string;
  suffix?: ReactNode;
}) {
  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {FORMATTERS[format](iso)}
      {suffix}
    </time>
  );
}
