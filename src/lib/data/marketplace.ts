import type {
  ActivityItem,
  AdminMetric,
  ApprovalItem,
  Bid,
  DealerEvent,
  Message,
  Offer,
  PayoutTracker,
  Thread,
} from "@/lib/types";
import {
  CURRENT_EVENT_CLOSES_AT,
  CURRENT_EVENT_OPENS_AT,
  NEXT_EVENT_CLOSES_AT,
  daysAgo,
  hoursAgo,
  inDays,
  inHours,
  minutesAgo,
} from "./clock";
import { listedVehicles } from "./vehicles";

/* ================================================================ events */

export const events: DealerEvent[] = [
  {
    id: "evt_current",
    name: "St. Louis Weekly Dealer Event",
    opensAt: CURRENT_EVENT_OPENS_AT,
    closesAt: CURRENT_EVENT_CLOSES_AT,
    status: "live",
    region: "Greater St. Louis",
    vehicleIds: listedVehicles.map((v) => v.id),
    registeredDealers: 34,
    totalBids: 111,
    grossVolume: 0,
  },
  {
    id: "evt_next",
    name: "St. Louis Weekly Dealer Event",
    opensAt: CURRENT_EVENT_CLOSES_AT,
    closesAt: NEXT_EVENT_CLOSES_AT,
    status: "scheduled",
    region: "Greater St. Louis",
    vehicleIds: [],
    registeredDealers: 31,
    totalBids: 0,
    grossVolume: 0,
  },
  {
    id: "evt_prev",
    name: "St. Louis Weekly Dealer Event",
    opensAt: daysAgo(12),
    closesAt: daysAgo(7),
    status: "closed",
    region: "Greater St. Louis",
    vehicleIds: ["veh_jetta", "veh_tacoma"],
    registeredDealers: 29,
    totalBids: 94,
    grossVolume: 318_400,
  },
];

export const currentEvent = events[0];
export const eventById = (id: string) => events.find((e) => e.id === id);

/* ================================================================== bids */

export const bids: Bid[] = [
  // Jess's Accord — the vehicle the seller portal is built around.
  { id: "bid_01", vehicleId: "veh_accord", dealerId: "dlr_abc", amount: 13_500, placedAt: hoursAgo(3), status: "outbid", maxAutoBid: null },
  { id: "bid_02", vehicleId: "veh_accord", dealerId: "dlr_gateway", amount: 15_200, placedAt: hoursAgo(2), status: "outbid", maxAutoBid: 16_000 },
  { id: "bid_03", vehicleId: "veh_accord", dealerId: "dlr_loufusz", amount: 16_100, placedAt: minutesAgo(96), status: "outbid", maxAutoBid: null },
  { id: "bid_04", vehicleId: "veh_accord", dealerId: "dlr_bommarito", amount: 16_750, placedAt: minutesAgo(48), status: "outbid", maxAutoBid: null },
  { id: "bid_05", vehicleId: "veh_accord", dealerId: "dlr_kia", amount: 17_400, placedAt: minutesAgo(28), status: "winning", maxAutoBid: 18_200 },

  // Dealer Kia's activity across the event (drives /dealer/bids).
  { id: "bid_10", vehicleId: "veh_f150", dealerId: "dlr_kia", amount: 28_500, placedAt: hoursAgo(6), status: "winning", maxAutoBid: 30_000 },
  { id: "bid_11", vehicleId: "veh_equinox", dealerId: "dlr_kia", amount: 17_100, placedAt: hoursAgo(4), status: "outbid", maxAutoBid: null },
  { id: "bid_12", vehicleId: "veh_equinox", dealerId: "dlr_bommarito", amount: 17_750, placedAt: hoursAgo(3), status: "winning", maxAutoBid: null },
  { id: "bid_13", vehicleId: "veh_rav4", dealerId: "dlr_kia", amount: 28_600, placedAt: hoursAgo(9), status: "outbid", maxAutoBid: null },
  { id: "bid_14", vehicleId: "veh_rav4", dealerId: "dlr_loufusz", amount: 29_000, placedAt: hoursAgo(7), status: "winning", maxAutoBid: 31_000 },
  { id: "bid_15", vehicleId: "veh_wrangler", dealerId: "dlr_kia", amount: 26_100, placedAt: hoursAgo(11), status: "winning", maxAutoBid: null },
  { id: "bid_16", vehicleId: "veh_bmw", dealerId: "dlr_kia", amount: 24_750, placedAt: hoursAgo(14), status: "winning", maxAutoBid: null },
  { id: "bid_17", vehicleId: "veh_telluride", dealerId: "dlr_kia", amount: 36_800, placedAt: hoursAgo(2), status: "outbid", maxAutoBid: null },
  { id: "bid_18", vehicleId: "veh_telluride", dealerId: "dlr_riverbend", amount: 37_400, placedAt: minutesAgo(75), status: "winning", maxAutoBid: null },
  { id: "bid_19", vehicleId: "veh_rdx", dealerId: "dlr_kia", amount: 22_400, placedAt: hoursAgo(20), status: "outbid", maxAutoBid: null },
  { id: "bid_20", vehicleId: "veh_rdx", dealerId: "dlr_abc", amount: 13_500, placedAt: hoursAgo(1), status: "active", maxAutoBid: null },
  { id: "bid_21", vehicleId: "veh_ram", dealerId: "dlr_kia", amount: 26_900, placedAt: hoursAgo(26), status: "winning", maxAutoBid: null },
  { id: "bid_22", vehicleId: "veh_altima", dealerId: "dlr_riverbend", amount: 12_700, placedAt: hoursAgo(30), status: "winning", maxAutoBid: null },
  { id: "bid_23", vehicleId: "veh_cx5", dealerId: "dlr_gateway", amount: 11_300, placedAt: hoursAgo(33), status: "winning", maxAutoBid: null },
  { id: "bid_24", vehicleId: "veh_tucson", dealerId: "dlr_kia", amount: 23_400, placedAt: hoursAgo(8), status: "winning", maxAutoBid: 25_000 },

  // Closed event — became purchases.
  { id: "bid_30", vehicleId: "veh_jetta", dealerId: "dlr_kia", amount: 14_100, placedAt: daysAgo(8), status: "won", maxAutoBid: null },
  { id: "bid_31", vehicleId: "veh_tacoma", dealerId: "dlr_kia", amount: 31_200, placedAt: daysAgo(8), status: "won", maxAutoBid: null },
];

export const bidsForVehicle = (vehicleId: string) =>
  bids
    .filter((b) => b.vehicleId === vehicleId)
    .sort((a, b) => b.amount - a.amount);

export const bidsForDealer = (dealerId: string) =>
  bids
    .filter((b) => b.dealerId === dealerId)
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());

export const highBidFor = (vehicleId: string) => bidsForVehicle(vehicleId)[0] ?? null;

/* ================================================================ offers */

export const offers: Offer[] = [
  {
    id: "off_01",
    vehicleId: "veh_accord",
    dealerId: "dlr_kia",
    sellerId: "sel_jess",
    amount: 17_400,
    status: "pending",
    createdAt: minutesAgo(28),
    expiresAt: inHours(37),
    counterAmount: null,
    counterNote: null,
    notes: "Happy to handle pickup at your home. Payment same day by ACH.",
    isTopOffer: true,
  },
  {
    id: "off_02",
    vehicleId: "veh_accord",
    dealerId: "dlr_bommarito",
    sellerId: "sel_jess",
    amount: 16_750,
    status: "pending",
    createdAt: minutesAgo(48),
    expiresAt: inHours(36),
    counterAmount: null,
    counterNote: null,
    notes: null,
    isTopOffer: false,
  },
  {
    id: "off_03",
    vehicleId: "veh_accord",
    dealerId: "dlr_loufusz",
    sellerId: "sel_jess",
    amount: 16_100,
    status: "pending",
    createdAt: minutesAgo(96),
    expiresAt: inHours(34),
    counterAmount: null,
    counterNote: null,
    notes: "Offer assumes no undisclosed body damage.",
    isTopOffer: false,
  },
  {
    id: "off_04",
    vehicleId: "veh_accord",
    dealerId: "dlr_gateway",
    sellerId: "sel_jess",
    amount: 15_200,
    status: "countered",
    createdAt: hoursAgo(2),
    expiresAt: inHours(20),
    counterAmount: 16_900,
    counterNote: "I have a higher offer already — can you get to $16,900?",
    notes: null,
    isTopOffer: false,
  },
  {
    id: "off_05",
    vehicleId: "veh_accord",
    dealerId: "dlr_abc",
    sellerId: "sel_jess",
    amount: 13_500,
    status: "declined",
    createdAt: hoursAgo(3),
    expiresAt: inHours(19),
    counterAmount: null,
    counterNote: null,
    notes: null,
    isTopOffer: false,
  },
  // Debbie's RDX — the "offer" mockup screen.
  {
    id: "off_10",
    vehicleId: "veh_rdx",
    dealerId: "dlr_abc",
    sellerId: "sel_debbie",
    amount: 13_500,
    status: "pending",
    createdAt: hoursAgo(1),
    expiresAt: inHours(37),
    counterAmount: null,
    counterNote: null,
    notes: "We can pick up any day this week.",
    isTopOffer: true,
  },
];

export const offersForVehicle = (vehicleId: string) =>
  offers
    .filter((o) => o.vehicleId === vehicleId)
    .sort((a, b) => b.amount - a.amount);

export const offerById = (id: string) => offers.find((o) => o.id === id);

/* ============================================================== messages */

export const threads: Thread[] = [
  {
    id: "thr_kia",
    participantName: "Dealer Kia",
    participantType: "dealer",
    dealerId: "dlr_kia",
    vehicleId: "veh_accord",
    subject: "Placed a bid on your 2019 Honda Accord",
    lastMessageAt: minutesAgo(28),
    unreadCount: 1,
    flag: "new",
  },
  {
    id: "thr_waymore_live",
    participantName: "Way More",
    participantType: "waymore",
    dealerId: null,
    vehicleId: "veh_accord",
    subject: "Your vehicle is live in this week's event!",
    lastMessageAt: daysAgo(3),
    unreadCount: 0,
    flag: "info",
  },
  {
    id: "thr_gateway",
    participantName: "Gateway Ford",
    participantType: "dealer",
    dealerId: "dlr_gateway",
    vehicleId: "veh_accord",
    subject: "Viewed your 2019 Honda Accord",
    lastMessageAt: hoursAgo(30),
    unreadCount: 0,
    flag: null,
  },
  {
    id: "thr_bommarito",
    participantName: "Bommarito Chevrolet",
    participantType: "dealer",
    dealerId: "dlr_bommarito",
    vehicleId: "veh_accord",
    subject: "Asked a question about your vehicle",
    lastMessageAt: daysAgo(4),
    unreadCount: 0,
    flag: null,
  },
  {
    id: "thr_waymore_approved",
    participantName: "Way More",
    participantType: "waymore",
    dealerId: null,
    vehicleId: "veh_accord",
    subject: "Your listing has been approved",
    lastMessageAt: daysAgo(4),
    unreadCount: 0,
    flag: null,
  },
];

export const messages: Message[] = [
  /* thr_kia */
  {
    id: "msg_k1",
    threadId: "thr_kia",
    authorType: "dealer",
    authorName: "Dana Kessler — Dealer Kia",
    body: "Hi Jess — we've been watching your Accord since it listed. Clean one-owner cars in this trim move fast for us.",
    sentAt: minutesAgo(44),
    read: true,
    attachedOfferId: null,
  },
  {
    id: "msg_k2",
    threadId: "thr_kia",
    authorType: "dealer",
    authorName: "Dana Kessler — Dealer Kia",
    body: "We've submitted a bid for your 2019 Honda Accord. You can accept, counter, or decline this offer below.",
    sentAt: minutesAgo(28),
    read: false,
    attachedOfferId: "off_01",
  },
  /* thr_waymore_live */
  {
    id: "msg_w1",
    threadId: "thr_waymore_live",
    authorType: "waymore",
    authorName: "Way More",
    body: "Good news — your 2019 Honda Accord is live in this week's dealer event. Dealers in the Greater St. Louis area can now view your listing and place bids. Bidding closes Wednesday at 6:00 PM CT.",
    sentAt: daysAgo(3),
    read: true,
    attachedOfferId: null,
  },
  /* thr_gateway */
  {
    id: "msg_g1",
    threadId: "thr_gateway",
    authorType: "dealer",
    authorName: "Tom Brantley — Gateway Ford",
    body: "Took a look at your Accord this morning. Is the service history available? We'd bid stronger with records.",
    sentAt: hoursAgo(30),
    read: true,
    attachedOfferId: null,
  },
  /* thr_bommarito */
  {
    id: "msg_b1",
    threadId: "thr_bommarito",
    authorType: "dealer",
    authorName: "Erik Sandoval — Bommarito Chevrolet",
    body: "Quick question — are both key fobs included, and has the timing chain service been done?",
    sentAt: daysAgo(4),
    read: true,
    attachedOfferId: null,
  },
  {
    id: "msg_b2",
    threadId: "thr_bommarito",
    authorType: "seller",
    authorName: "Jess Smith",
    body: "Yes, both fobs are included. No timing chain work needed on this one — it's a 1.5T and it's been dealer serviced every 5,000 miles.",
    sentAt: daysAgo(4),
    read: true,
    attachedOfferId: null,
  },
  /* thr_waymore_approved */
  {
    id: "msg_a1",
    threadId: "thr_waymore_approved",
    authorType: "waymore",
    authorName: "Way More",
    body: "Your listing has been approved and will be included in the next dealer event. No action needed from you — we'll let you know as soon as bidding opens.",
    sentAt: daysAgo(4),
    read: true,
    attachedOfferId: null,
  },
];

export const messagesForThread = (threadId: string) =>
  messages
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());

export const threadById = (id: string) => threads.find((t) => t.id === id);


/* ==================================================== dealer-side inbox */
/*
 * Threads as the DEALER sees them. The seller is deliberately not named:
 * dealers see the vehicle, not the person, until an offer is accepted.
 * `sellerId` is carried for lookups only and is never rendered.
 */

export const dealerThreads: Thread[] = [
  {
    id: "dthr_f150",
    participantName: "Seller",
    participantType: "seller",
    dealerId: "dlr_kia",
    sellerId: "sel_marcus",
    vehicleId: "veh_f150",
    subject: "Countered your bid at $29,400",
    lastMessageAt: minutesAgo(18),
    unreadCount: 1,
    flag: "new",
    pendingCounter: { amount: 29_400, expiresAt: inHours(23) },
  },
  {
    id: "dthr_waymore_outbid",
    participantName: "Way More",
    participantType: "waymore",
    dealerId: "dlr_kia",
    sellerId: null,
    vehicleId: "veh_telluride",
    subject: "You were outbid on the 2022 Kia Telluride",
    lastMessageAt: hoursAgo(2),
    unreadCount: 1,
    flag: "info",
    pendingCounter: null,
  },
  {
    id: "dthr_rav4",
    participantName: "Seller",
    participantType: "seller",
    dealerId: "dlr_kia",
    sellerId: "sel_priya",
    vehicleId: "veh_rav4",
    subject: "Question about the service history",
    lastMessageAt: hoursAgo(9),
    unreadCount: 0,
    flag: null,
    pendingCounter: null,
  },
  {
    id: "dthr_waymore_tacoma",
    participantName: "Way More",
    participantType: "waymore",
    dealerId: "dlr_kia",
    sellerId: null,
    vehicleId: "veh_tacoma",
    subject: "Payment confirmed — 2019 Toyota Tacoma",
    lastMessageAt: daysAgo(7),
    unreadCount: 0,
    flag: null,
    pendingCounter: null,
  },
];

export const dealerMessages: Message[] = [
  /* ---------------------------------------------- the price negotiation */
  {
    id: "dmsg_f1",
    threadId: "dthr_f150",
    authorType: "dealer",
    authorName: "You — Dealer Kia",
    body: "Bid submitted through this week's event.",
    sentAt: hoursAgo(6),
    read: true,
    attachedOfferId: null,
    attachedBidId: "bid_10",
  },
  {
    id: "dmsg_f2",
    threadId: "dthr_f150",
    authorType: "seller",
    authorName: "Seller",
    body: "Thanks for the bid. I was hoping to be closer to $30,000. It has the tow package, the bed liner, and I put four new tyres on it in June with receipts.",
    sentAt: hoursAgo(4),
    read: true,
    attachedOfferId: null,
  },
  {
    id: "dmsg_f3",
    threadId: "dthr_f150",
    authorType: "dealer",
    authorName: "You — Dealer Kia",
    body: "Appreciated, and the tyres do help. $28,500 reflects the 54,200 miles and what I'd need to spend getting it front-line ready — it'll want a detail and the bed liner reconditioned. I can move to $29,000 today.",
    sentAt: hoursAgo(3),
    read: true,
    attachedOfferId: null,
  },
  {
    id: "dmsg_f4",
    threadId: "dthr_f150",
    authorType: "seller",
    authorName: "Seller",
    body: "Let's split it. $29,400 and I'll accept this afternoon so you can schedule pickup before the weekend.",
    sentAt: minutesAgo(18),
    read: false,
    attachedOfferId: null,
  },

  /* -------------------------------------------------------- outbid note */
  {
    id: "dmsg_t1",
    threadId: "dthr_waymore_outbid",
    authorType: "waymore",
    authorName: "Way More",
    body: "Another dealer has bid above you on the 2022 Kia Telluride SX. The current high bid is $37,400. Bidding is still open if you'd like to respond.",
    sentAt: hoursAgo(2),
    read: false,
    attachedOfferId: null,
  },

  /* ------------------------------------------------------ seller question */
  {
    id: "dmsg_r1",
    threadId: "dthr_rav4",
    authorType: "dealer",
    authorName: "You — Dealer Kia",
    body: "Is the hybrid battery service history available for this one, and has it ever been out of state?",
    sentAt: hoursAgo(11),
    read: true,
    attachedOfferId: null,
  },
  {
    id: "dmsg_r2",
    threadId: "dthr_rav4",
    authorType: "seller",
    authorName: "Seller",
    body: "Dealer serviced every 5,000 miles since new, all at the same Toyota store. Missouri its whole life, never registered anywhere else.",
    sentAt: hoursAgo(9),
    read: true,
    attachedOfferId: null,
  },

  /* ------------------------------------------------------------- payment */
  {
    id: "dmsg_tc1",
    threadId: "dthr_waymore_tacoma",
    authorType: "waymore",
    authorName: "Way More",
    body: "Payment for the 2019 Toyota Tacoma TRD Off-Road has cleared and the title is on its way. Invoice WM-10428 is available in Purchases.",
    sentAt: daysAgo(7),
    read: true,
    attachedOfferId: null,
  },
];

export const dealerMessagesForThread = (threadId: string) =>
  dealerMessages
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());

export const dealerThreadById = (id: string) => dealerThreads.find((t) => t.id === id);

export const bidById = (id: string) => bids.find((b) => b.id === id);

/* ======================================================= payout & pickup */

export const payoutTracker: PayoutTracker = {
  vehicleId: "veh_accord",
  offerId: "off_01",
  currentStep: "documents",
  amount: 17_400,
  method: "ach",
  accountLast4: "4417",
  pickupWindow: null,
  pickupAddress: "4212 Lindell Blvd, St. Louis, MO 63108",
  steps: [
    {
      key: "offer_accepted",
      label: "Offer accepted",
      description: "You accepted Dealer Kia's offer of $17,400.",
      completedAt: minutesAgo(20),
    },
    {
      key: "documents",
      label: "Upload your documents",
      description: "Title, valid photo ID, and a current odometer photo.",
      completedAt: null,
    },
    {
      key: "inspection",
      label: "Dealer verification",
      description: "The dealer confirms the vehicle matches your listing.",
      completedAt: null,
    },
    {
      key: "pickup_scheduled",
      label: "Schedule pickup",
      description: "Pick a window that works for you — pickup is free.",
      completedAt: null,
    },
    {
      key: "picked_up",
      label: "Vehicle picked up",
      description: "The dealer collects the vehicle and both keys.",
      completedAt: null,
    },
    {
      key: "paid",
      label: "Get paid",
      description: "Funds are released to your account, usually same day.",
      completedAt: null,
    },
  ],
};

/* =============================================================== activity */

export const sellerActivity: ActivityItem[] = [
  { id: "act_1", kind: "view", label: "Gateway Ford viewed your listing", detail: null, at: minutesAgo(12), vehicleId: "veh_accord", dealerId: "dlr_gateway" },
  { id: "act_2", kind: "bid", label: "A new bid was placed", detail: "$17,400 — Dealer Kia", at: minutesAgo(28), vehicleId: "veh_accord", dealerId: "dlr_kia" },
  { id: "act_3", kind: "view", label: "Lou Fusz Toyota viewed your listing", detail: null, at: hoursAgo(1), vehicleId: "veh_accord", dealerId: "dlr_loufusz" },
  { id: "act_4", kind: "bid", label: "A new bid was placed", detail: "$16,750 — Bommarito Chevrolet", at: minutesAgo(48), vehicleId: "veh_accord", dealerId: "dlr_bommarito" },
  { id: "act_5", kind: "view", label: "Bommarito Chevrolet viewed your listing", detail: null, at: hoursAgo(3), vehicleId: "veh_accord", dealerId: "dlr_bommarito" },
  { id: "act_6", kind: "save", label: "ABC Motors saved your vehicle", detail: null, at: hoursAgo(5), vehicleId: "veh_accord", dealerId: "dlr_abc" },
  { id: "act_7", kind: "status", label: "Your listing went live", detail: "Included in this week's dealer event", at: daysAgo(3), vehicleId: "veh_accord", dealerId: null },
  { id: "act_8", kind: "status", label: "Listing approved by Way More", detail: null, at: daysAgo(4), vehicleId: "veh_accord", dealerId: null },
];

export const dealerActivity: ActivityItem[] = [
  { id: "dact_1", kind: "bid", label: "You placed a bid on", detail: "2019 Honda Accord EX", at: hoursAgo(2), vehicleId: "veh_accord", dealerId: "dlr_kia" },
  { id: "dact_2", kind: "bid", label: "You were outbid on", detail: "2020 Chevy Equinox", at: hoursAgo(4), vehicleId: "veh_equinox", dealerId: "dlr_kia" },
  { id: "dact_3", kind: "bid", label: "You placed a bid on", detail: "2021 Ford F-150", at: hoursAgo(6), vehicleId: "veh_f150", dealerId: "dlr_kia" },
  { id: "dact_4", kind: "save", label: "You saved a vehicle", detail: "2022 Toyota RAV4", at: daysAgo(1), vehicleId: "veh_rav4", dealerId: "dlr_kia" },
  { id: "dact_5", kind: "bid", label: "You were outbid on", detail: "2022 Kia Telluride", at: hoursAgo(2), vehicleId: "veh_telluride", dealerId: "dlr_kia" },
  { id: "dact_6", kind: "offer", label: "Your offer was accepted on", detail: "2019 Toyota Tacoma", at: daysAgo(7), vehicleId: "veh_tacoma", dealerId: "dlr_kia" },
];

export const savedVehicleIds = ["veh_rav4", "veh_telluride", "veh_f150", "veh_bmw", "veh_tucson", "veh_wrangler", "veh_rdx", "veh_ram"];

export const dealerPurchases = [
  { vehicleId: "veh_tacoma", amount: 31_200, closedAt: daysAgo(7), status: "Picked up", invoice: "WM-10428" },
  { vehicleId: "veh_jetta", amount: 14_100, closedAt: daysAgo(8), status: "Payment sent", invoice: "WM-10421" },
];

/* ================================================================= admin */

export const adminMetrics: AdminMetric[] = [
  { key: "live", label: "Vehicles in event", value: "12", delta: 20, deltaLabel: "vs last week", hint: "Listed and accepting bids" },
  { key: "bids", label: "Bids placed", value: "111", delta: 18, deltaLabel: "vs last week", hint: "Across all live vehicles" },
  { key: "dealers", label: "Active dealers", value: "34", delta: 6, deltaLabel: "vs last week", hint: "Registered for this event" },
  { key: "gmv", label: "Gross volume (30d)", value: "$1.04M", delta: 12, deltaLabel: "vs prior 30d", hint: "Accepted offers" },
  { key: "takerate", label: "Avg. sale price", value: "$24,180", delta: 4, deltaLabel: "vs last week", hint: "Accepted offers only" },
  { key: "conversion", label: "Offer acceptance", value: "63%", delta: -3, deltaLabel: "vs last week", hint: "Sellers accepting a top offer" },
];

export const approvalQueue: ApprovalItem[] = [
  {
    vehicleId: "veh_modelS",
    submittedAt: hoursAgo(5),
    sellerName: "Priya Raman",
    reason: "High-value listing — manual review required over $40,000",
    priority: "high",
    flags: ["Value > $40k", "First listing from seller"],
  },
  {
    vehicleId: "veh_explorer",
    submittedAt: hoursAgo(19),
    sellerName: "Marcus Webb",
    reason: "Lienholder disclosed — payoff verification needed",
    priority: "high",
    flags: ["Active lien", "Payoff letter missing"],
  },
];

export const adminUpcoming = [
  { label: "Bidding closes", value: "This week's event", at: CURRENT_EVENT_CLOSES_AT },
  { label: "Next event opens", value: "Listings lock 24h prior", at: CURRENT_EVENT_CLOSES_AT },
  { label: "Payout batch", value: "ACH run — 9 sellers", at: inDays(1) },
];
