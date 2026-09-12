/** Formatting helpers shared by every surface. */

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const USD_CENTS = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const money = (n: number) => USD.format(n);
export const moneyExact = (n: number) => USD_CENTS.format(n);

export const miles = (n: number) => `${new Intl.NumberFormat("en-US").format(n)} mi`;

export const number = (n: number) => new Intl.NumberFormat("en-US").format(n);

export function range(low: number, high: number) {
  return `${money(low)} – ${money(high)}`;
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function longDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function dateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timeOfDay(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "12 minutes ago" / "3 hours ago" / "2 days ago" */
export function relativeTime(iso: string, now: Date = new Date()) {
  const diff = now.getTime() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return shortDate(iso);
}

/** Compact "2d 7h" used on inventory cards. */
export function shortCountdown(iso: string, now: Date = new Date()) {
  const ms = new Date(iso).getTime() - now.getTime();
  if (ms <= 0) return "Closed";
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function splitCountdown(iso: string, now: Date = new Date()) {
  const ms = Math.max(0, new Date(iso).getTime() - now.getTime());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms % 86_400_000) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
    seconds: Math.floor((ms % 60_000) / 1000),
    expired: ms <= 0,
  };
}

export const vehicleTitle = (v: { year: number; make: string; model: string; trim?: string }) =>
  [v.year, v.make, v.model, v.trim].filter(Boolean).join(" ");

export const vehicleShortTitle = (v: { year: number; make: string; model: string }) =>
  `${v.year} ${v.make} ${v.model}`;

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Tailwind class joiner. Ignores anything that isn't a non-empty string. */
export type ClassValue = string | number | bigint | boolean | null | undefined;

export function cx(...parts: ClassValue[]) {
  return parts.filter((p): p is string => typeof p === "string" && p.length > 0).join(" ");
}
