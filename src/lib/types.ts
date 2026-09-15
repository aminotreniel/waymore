/* ==========================================================================
   Way More — domain model
   --------------------------------------------------------------------------
   These types describe the shape the API will eventually return. The mock
   data in src/lib/data conforms to them, so swapping the fixtures for real
   fetches later is a data-source change, not a component change.
   ========================================================================== */

export type Role = "seller" | "dealer" | "admin";

/* ----------------------------------------------------------------- people */

export interface Seller {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  zip: string;
  joinedAt: string;
  avatarInitials: string;
  vehicleIds: string[];
}

export interface Dealer {
  id: string;
  name: string;
  legalName: string;
  dealerNumber: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  contactName: string;
  status: "active" | "pending" | "suspended";
  joinedAt: string;
  rating: number;
  purchases: number;
  /** Brand mark rendered from src/components/brand/DealerMark.tsx */
  markColor: string;
  markInitials: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "owner" | "ops" | "support";
  avatarInitials: string;
}

/* --------------------------------------------------------------- vehicles */

export type VehicleStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "listed"
  | "bidding_closed"
  | "offer_accepted"
  | "sold"
  | "rejected"
  | "withdrawn";

export type TitleStatus = "clean" | "lien" | "salvage" | "rebuilt";
export type Drivetrain = "FWD" | "RWD" | "AWD" | "4x4";
export type Transmission = "Automatic" | "Manual" | "CVT";
export type FuelType = "Gasoline" | "Hybrid" | "Diesel" | "Electric";
export type BodyStyle = "Sedan" | "SUV" | "Truck" | "Coupe" | "Hatchback" | "Van" | "Wagon";
export type ConditionGrade = "excellent" | "good" | "fair" | "rough";

export interface VehiclePhoto {
  id: string;
  url: string;
  label: string;
}

export interface Vehicle {
  id: string;
  sellerId: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  vin: string;
  mileage: number;
  exteriorColor: string;
  interiorColor: string;
  bodyStyle: BodyStyle;
  drivetrain: Drivetrain;
  transmission: Transmission;
  fuelType: FuelType;
  titleStatus: TitleStatus;
  owners: number;
  accidents: number;
  condition: ConditionGrade;
  keys: number;
  city: string;
  state: string;
  zip: string;
  status: VehicleStatus;
  /** Way More's algorithmic range, shown to the seller before bidding. */
  estimateLow: number;
  estimateHigh: number;
  reservePrice: number | null;
  photos: VehiclePhoto[];
  highlights: string[];
  disclosures: string[];
  submittedAt: string;
  eventId: string | null;
  /** Denormalised counters the dashboards read directly. */
  viewCount: number;
  bidCount: number;
  saveCount: number;
  /** Tag rendered on the dealer inventory card, e.g. "New" / "Low Miles". */
  tag: string | null;
}

/* ----------------------------------------------------------------- events */

export type EventStatus = "scheduled" | "live" | "closed" | "settling";

export interface DealerEvent {
  id: string;
  name: string;
  /** ISO — bidding opens. */
  opensAt: string;
  /** ISO — bidding closes. Drives every countdown in the product. */
  closesAt: string;
  status: EventStatus;
  region: string;
  vehicleIds: string[];
  registeredDealers: number;
  totalBids: number;
  grossVolume: number;
}

/* ------------------------------------------------------------------- bids */

export type BidStatus = "active" | "outbid" | "winning" | "won" | "lost" | "retracted";

export interface Bid {
  id: string;
  vehicleId: string;
  dealerId: string;
  amount: number;
  placedAt: string;
  status: BidStatus;
  /** Dealer-side convenience: highest amount this dealer will auto-bid to. */
  maxAutoBid: number | null;
}

/* ----------------------------------------------------------------- offers */

export type OfferStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "countered"
  | "expired"
  | "withdrawn";

export interface Offer {
  id: string;
  vehicleId: string;
  dealerId: string;
  sellerId: string;
  amount: number;
  status: OfferStatus;
  createdAt: string;
  expiresAt: string;
  /** Present once the seller counters. */
  counterAmount: number | null;
  counterNote: string | null;
  notes: string | null;
  /** True for the single highest live offer on a vehicle. */
  isTopOffer: boolean;
}

/* --------------------------------------------------------------- messages */

export type ThreadParty = "dealer" | "waymore" | "seller";

export interface Message {
  id: string;
  threadId: string;
  authorType: ThreadParty;
  authorName: string;
  body: string;
  sentAt: string;
  read: boolean;
  /** Renders the rich offer card inside the thread. */
  attachedOfferId: string | null;
  /** Renders the bid summary card inside the thread (dealer side). */
  attachedBidId?: string | null;
}

export interface Thread {
  id: string;
  participantName: string;
  participantType: ThreadParty;
  dealerId: string | null;
  /** Set on dealer-side threads. Sellers stay anonymous to dealers until an
   *  offer is accepted, so this is used for lookups, never for display. */
  sellerId?: string | null;
  vehicleId: string;
  subject: string;
  lastMessageAt: string;
  unreadCount: number;
  /** "new" | "info" | none — the coloured dot in the thread list. */
  flag: "new" | "info" | null;
  /** Present when the other party has countered and this thread is waiting
   *  on the viewer to accept, counter back, or decline. */
  pendingCounter?: { amount: number; expiresAt: string } | null;
}

/* ------------------------------------------------------- payout & pickup */

export type PayoutStep =
  | "offer_accepted"
  | "documents"
  | "inspection"
  | "pickup_scheduled"
  | "picked_up"
  | "paid";

export interface PayoutTracker {
  vehicleId: string;
  offerId: string;
  currentStep: PayoutStep;
  amount: number;
  method: "ach" | "check";
  accountLast4: string | null;
  pickupWindow: string | null;
  pickupAddress: string | null;
  steps: {
    key: PayoutStep;
    label: string;
    description: string;
    completedAt: string | null;
  }[];
}

/* --------------------------------------------------------------- activity */

export type ActivityKind =
  | "view"
  | "bid"
  | "offer"
  | "message"
  | "save"
  | "status"
  | "payout";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  label: string;
  detail: string | null;
  at: string;
  vehicleId: string | null;
  dealerId: string | null;
}

/* ------------------------------------------------------------- admin bits */

export interface AdminMetric {
  key: string;
  label: string;
  value: string;
  delta: number | null;
  deltaLabel: string | null;
  hint: string | null;
}

export interface ApprovalItem {
  vehicleId: string;
  submittedAt: string;
  sellerName: string;
  reason: string;
  priority: "high" | "normal";
  flags: string[];
}

/* ------------------------------------------------------ funnel form state */

export interface SellFlowState {
  zip: string;
  vin: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  mileage: string;
  bodyStyle: string;
  drivetrain: string;
  transmission: string;
  fuelType: string;
  exteriorColor: string;
  titleStatus: string;
  owners: string;
  accidents: string;
  condition: string;
  keys: string;
  features: string[];
  disclosures: string[];
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  photos: { id: string; label: string; filled: boolean }[];
  reserve: string;
  agreedToTerms: boolean;
}
