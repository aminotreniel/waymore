/* ==========================================================================
   Demo clock
   --------------------------------------------------------------------------
   The prototype has no backend, so fixture timestamps are generated relative
   to load time. That keeps every countdown live and every "2 hours ago" label
   honest no matter when the prototype is opened.

   All dates are produced from this single seed so the whole app stays
   internally consistent.
   ========================================================================== */

/** Stable reference point captured once per server render / page load. */
export const NOW = new Date();

export const minutesAgo = (n: number) => new Date(NOW.getTime() - n * 60_000).toISOString();
export const hoursAgo = (n: number) => minutesAgo(n * 60);
export const daysAgo = (n: number) => minutesAgo(n * 60 * 24);
export const inMinutes = (n: number) => new Date(NOW.getTime() + n * 60_000).toISOString();
export const inHours = (n: number) => inMinutes(n * 60);
export const inDays = (n: number) => inMinutes(n * 60 * 24);

/**
 * Way More runs one dealer event a week, closing Wednesday at 6:00 PM CT.
 * Returns the close time of the event currently accepting bids.
 */
function nextWednesday6pm(from: Date): Date {
  const d = new Date(from);
  // 3 = Wednesday
  const delta = (3 - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + delta);
  d.setHours(18, 0, 0, 0);
  // If we have already passed this week's close, roll to next week.
  if (d.getTime() <= from.getTime()) d.setDate(d.getDate() + 7);
  return d;
}

export const CURRENT_EVENT_CLOSES_AT = nextWednesday6pm(NOW).toISOString();
export const CURRENT_EVENT_OPENS_AT = new Date(
  new Date(CURRENT_EVENT_CLOSES_AT).getTime() - 1000 * 60 * 60 * 24 * 5,
).toISOString();
export const NEXT_EVENT_CLOSES_AT = new Date(
  new Date(CURRENT_EVENT_CLOSES_AT).getTime() + 1000 * 60 * 60 * 24 * 7,
).toISOString();

export const eventLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const eventDeadlineLabel = (iso: string) =>
  `${new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })} at ${new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })} CT`;
