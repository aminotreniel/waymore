import type { Vehicle } from "@/lib/types";
export interface Auction {
  id: string;
  vehicle_id: string;
  event_id: string;
  opens_at: string;
  ends_at: string;
  status: "open" | "closed";
  opening_bid_cents: number;
  increment_cents: number;
  high_bid_id: string | null;
  high_bid_cents: number | null;
  /** Server-computed. The bidder behind a bid is never sent to other dealers. */
  high_is_mine: boolean;
  bid_count: number;
  version: number;
  extension_count: number;
  extension_seconds: number;
  extension_window_seconds: number;
  winning_bid_id: string | null;
  won_by_me: boolean;
  reserve_cents: number | null;
  result: "awaiting_seller" | "reserve_not_met" | "no_bids" | null;
  created_at: string;
  closed_at: string | null;
}
export interface OwnBid {
  id: string;
  auction_id: string;
  amount_cents: number;
  accepted_at: string;
  sequence: number;
}
export interface HistoryBid {
  id: string;
  amount_cents: number;
  accepted_at: string;
  sequence: number;
  bidder_label: string;
  mine: boolean;
}
export interface Lobby {
  server_time: string;
  dealer_id: string | null;
  is_admin: boolean;
  auctions: Auction[];
  vehicles: Vehicle[];
  my_bids: OwnBid[];
}
/** Rounds for one vehicle, newest first. A vehicle can be auctioned repeatedly. */
export const roundsFor = (auctions: Auction[], vehicleId: string) =>
  auctions
    .filter((a) => a.vehicle_id === vehicleId)
    .sort(
      (x, y) =>
        Date.parse(y.created_at) - Date.parse(x.created_at) ||
        y.id.localeCompare(x.id),
    );
/**
 * The round a vehicle page should show by default. Sorted here rather than
 * trusting the order the server happened to aggregate in.
 */
export const currentRound = (
  auctions: Auction[],
  vehicleId: string,
): Auction | undefined => roundsFor(auctions, vehicleId)[0];
export const minimumBid = (a: Auction) =>
  a.high_bid_cents === null
    ? a.opening_bid_cents
    : a.high_bid_cents + a.increment_cents;
export const outcomeLabel = (a: Auction) =>
  a.result === "no_bids"
    ? "Closed · no bids"
    : a.result === "reserve_not_met"
      ? "Closed · reserve not met"
      : a.result === "awaiting_seller"
        ? "Closed · awaiting seller"
        : "Awaiting final result";
export const dollars = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
