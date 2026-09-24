/** Shared between the lab API route and the lab page. No server-only imports here. */
export type StepStatus = "pass" | "fail" | "info";

export interface LabStep {
  name: string;
  status: StepStatus;
  detail: string;
  ms?: number;
}

export interface LabMetrics {
  requests: number;
  accepted: number;
  rejected: number;
  transportFailed: number;
  wallMs: number;
  p50: number;
  p95: number;
  max: number;
  /** Rejection message -> count. Shows *why* bids did not win. */
  reasons: Record<string, number>;
}

export interface LabResult {
  scenario: string;
  title: string;
  requirement: string;
  ok: boolean;
  steps: LabStep[];
  metrics?: LabMetrics;
  ms: number;
  error?: string;
}

export interface Scenario {
  id: string;
  title: string;
  /** Which of Justin's nine requirements this exercises. */
  requirement: string;
  blurb: string;
  /** Runs in the browser rather than on the server. */
  client?: boolean;
  /** Honours the dealer-count control. */
  scaled?: boolean;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "ledger",
    title: "Bid ledger",
    requirement: "1. Store each bid with dealer, amount and exact timestamp",
    blurb:
      "Places a bid and reads the stored row back. Checks the dealer, the integer-cent amount, a server timestamp, a sequence number and the idempotency key are all persisted, and that the timestamp came from the database rather than the browser.",
  },
  {
    id: "history",
    title: "Complete bid history",
    requirement: "2. Maintain complete bid history for each vehicle",
    blurb:
      "Places 12 bids across dealers, then pages through the history. Checks every sequence from 1 to N is present exactly once, the count matches bid_count, and pagination returns no duplicates and no gaps.",
  },
  {
    id: "burst",
    title: "Simultaneous bidders",
    requirement: "3. Handle multiple dealers bidding at essentially the same time",
    blurb:
      "Fires every lab dealer at one auction in the same instant, twice: once all bidding the identical amount, once bidding escalating amounts. Reports how many were accepted, why the rest were rejected, and the latency spread.",
    scaled: true,
  },
  {
    id: "timer",
    title: "Server-controlled timer",
    requirement: "4. Use a server-controlled auction timer",
    blurb:
      "Compares the browser clock against the database clock, then moves a deadline into the past and confirms the database refuses the bid immediately, before the closing worker has run.",
  },
  {
    id: "antisnipe",
    title: "Anti-sniping extensions",
    requirement: "5. Bids in the final 60s extend the auction, repeatedly",
    blurb:
      "Bids inside the final window and checks the deadline moves by exactly the configured extension. Bids outside the window and checks it does not. Repeats to prove extensions stack without limit.",
  },
  {
    id: "realtime",
    title: "Live updates to every viewer",
    requirement: "6. Update current bid and timer for all viewers in real time",
    blurb:
      "Opens a Realtime subscription in this browser, has another dealer bid on the server, and measures how long the update takes to arrive. Runs in your browser, not on the server, because that is where the websocket lives.",
    client: true,
  },
  {
    id: "recovery",
    title: "Refresh, retry and duplicate clicks",
    requirement: "7. Refreshes, lost connections, duplicate clicks, bids at close",
    blurb:
      "Sends the same request twice at once (double click), replays a request after the auction has closed (lost response), reuses a key with a different amount, and tries to outbid yourself. Checks exactly one bid exists at the end.",
  },
  {
    id: "winner",
    title: "Winner and outcome",
    requirement: "8. Determine and store the final high bidder and winning bid",
    blurb:
      "Closes an auction and checks the stored winner is the top row of the ledger, that a no-bid auction and a reserve-not-met auction record the right result, and that running the closing worker repeatedly creates exactly one outcome.",
  },
  {
    id: "marketplace",
    title: "Marketplace linkage",
    requirement: "9. Allow auction data to connect to the wider marketplace",
    blurb:
      "Checks the recorded outcome joins back to a vehicle, a seller and an event by stable id, which is the seam a later offer or payment workflow attaches to.",
  },
  {
    id: "security",
    title: "Security and isolation",
    requirement: "Backend structure and security",
    blurb:
      "As an ordinary dealer: tries to insert a bid directly, tries to overwrite the current high bid, tries to call the privileged closing worker, tries to alter the timer, and inspects the payload for any other dealer's identity.",
  },
];
