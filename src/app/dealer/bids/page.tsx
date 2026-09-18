"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuctions } from "@/context/AuctionContext";
import { dollars, outcomeLabel } from "@/lib/auction";
import { Card } from "@/components/ui/Card";
import { PortalHeader } from "@/components/portal/PortalShell";
import { Tabs } from "@/components/ui/Disclosure";
import { AuctionTimer } from "@/components/auction/AuctionTimer";
import { vehicleTitle } from "@/lib/format";
export default function DealerBidsPage() {
  const { data } = useAuctions();
  const [tab, setTab] = useState("all");
  const rows = data.my_bids.flatMap((b) => {
    const a = data.auctions.find((a) => a.id === b.auction_id);
    const v = data.vehicles.find((v) => v.id === a?.vehicle_id);
    return a && v
      ? [
          {
            b,
            a,
            v,
            status:
              a.status === "closed"
                ? "closed"
                : a.high_is_mine
                  ? "winning"
                  : "outbid",
          },
        ]
      : [];
  });
  const shown = rows.filter((r) => tab === "all" || r.status === tab);
  return (
    <div className="p-4 sm:p-8 space-y-5">
      <PortalHeader
        title="My Bids"
        lead="Your latest bid in each auction round. Closed results await the seller’s decision."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {["winning", "outbid", "closed"].map((status) => (
          <Card key={status}>
            <p className="text-3xl font-bold">
              {rows.filter((r) => r.status === status).length}
            </p>
            <p className="mt-1 capitalize text-muted">{status}</p>
          </Card>
        ))}
      </div>
      <Card>
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={["all", "winning", "outbid", "closed"].map((key) => ({
            key,
            label: key.charAt(0).toUpperCase() + key.slice(1),
          }))}
        />
        {!shown.length ? (
          <p className="py-12 text-center text-muted">
            No bids in this view.{" "}
            <Link className="underline" href="/dealer/inventory">
              Browse vehicles
            </Link>
          </p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left border-b border-line">
                  {[
                    "Vehicle",
                    "Your bid",
                    "High bid",
                    "Status",
                    "Time left",
                  ].map((h) => (
                    <th className="py-4 pr-4" key={h}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map(({ b, a, v, status }) => (
                  <tr key={b.id} className="border-b border-line">
                    <td className="py-4 pr-4">
                      <Link
                        className="font-semibold underline"
                        /* Open the round this bid belongs to, not whichever
                           round the vehicle happens to be in now. */
                        href={`/dealer/inventory/${v.id}?round=${a.id}`}
                      >
                        {vehicleTitle(v)}
                      </Link>
                      <p className="mt-1 text-xs text-muted">
                        {new Date(b.accepted_at).toLocaleString()}
                      </p>
                    </td>
                    <td className="pr-4">{dollars(b.amount_cents)}</td>
                    <td className="pr-4">{dollars(a.high_bid_cents ?? 0)}</td>
                    <td className="pr-4">
                      {a.status === "closed"
                        ? `${a.won_by_me ? "You finished highest · " : ""}${outcomeLabel(a)}`
                        : status}
                    </td>
                    <td>
                      <AuctionTimer auction={a} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
