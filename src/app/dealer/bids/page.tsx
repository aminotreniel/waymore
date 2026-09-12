"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PortalHeader } from "@/components/portal/PortalShell";
import { Tabs } from "@/components/ui/Disclosure";
import { Countdown } from "@/components/ui/Countdown";
import { EmptyState, StatTile } from "@/components/ui/Misc";
import { IconGavel } from "@/components/icons";
import { useSession } from "@/context/SessionContext";
import { bidsForDealer, highBidFor } from "@/lib/data/marketplace";
import { vehicleById } from "@/lib/data/vehicles";
import { CURRENT_EVENT_CLOSES_AT } from "@/lib/data/clock";
import { cx, miles, money, relativeTime, vehicleTitle } from "@/lib/format";

export default function DealerBidsPage() {
  const { dealer } = useSession();
  const [tab, setTab] = useState("all");
  const all = bidsForDealer(dealer.id);

  const winning = all.filter((b) => b.status === "winning");
  const outbid = all.filter((b) => b.status === "outbid");
  const won = all.filter((b) => b.status === "won");

  const shown =
    tab === "winning" ? winning : tab === "outbid" ? outbid : tab === "won" ? won : all;

  const exposure = winning.reduce((n, b) => n + b.amount, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px]">
      <PortalHeader
        title="My Bids"
        lead="Everything you're currently bidding on, and where you stand."
        action={
          <div className="flex items-center gap-4 rounded-2xl bg-surface ring-1 ring-line shadow-card px-5 py-3">
            <span className="text-[12.5px] font-semibold text-muted">Bidding ends in</span>
            <Countdown to={CURRENT_EVENT_CLOSES_AT} size="sm" />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatTile value={winning.length} label="Winning now" tone="lime" hint="You're the high bidder" />
        <StatTile value={outbid.length} label="Outbid" hint="Raise to stay in" />
        <StatTile value={money(exposure)} label="Committed if all hold" hint="Sum of your winning bids" />
        <StatTile value={won.length} label="Won (all time)" hint="Converted to purchases" />
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="px-5 pt-4 border-b border-line">
          <Tabs
            tabs={[
              { key: "all", label: "All", count: all.length },
              { key: "winning", label: "Winning", count: winning.length },
              { key: "outbid", label: "Outbid", count: outbid.length },
              { key: "won", label: "Won", count: won.length },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        {shown.length === 0 ? (
          <EmptyState
            icon={<IconGavel size={22} />}
            title="No bids in this view"
            body="Browse this week's event and place your first bid."
          />
        ) : (
          <div className="overflow-x-auto scrollbar-slim">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-line text-left">
                  {["Vehicle", "Your bid", "Current high", "Status", "Placed", ""].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-5 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.map((b) => {
                  const v = vehicleById(b.vehicleId)!;
                  const top = highBidFor(b.vehicleId);
                  const behind = top && top.amount > b.amount;
                  return (
                    <tr key={b.id} className="hover:bg-paper/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link href={`/dealer/inventory/${v.id}`} className="flex items-center gap-3 group">
                          <span className="relative size-12 shrink-0 overflow-hidden rounded-lg">
                            <Image src={v.photos[0].url} alt="" fill sizes="48px" className="object-cover" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[14px] font-semibold text-heading truncate group-hover:text-lime-600 transition-colors">
                              {vehicleTitle(v)}
                            </span>
                            <span className="block text-[12px] text-muted">
                              {miles(v.mileage)} · {v.city}, {v.state}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 font-display font-bold text-[15px] text-heading tabular-nums">
                        {money(b.amount)}
                        {b.maxAutoBid && (
                          <span className="block text-[11.5px] font-sans font-normal text-muted">
                            auto to {money(b.maxAutoBid)}
                          </span>
                        )}
                      </td>
                      <td
                        className={cx(
                          "px-5 py-3.5 font-display font-bold text-[15px] tabular-nums",
                          behind ? "text-danger" : "text-heading",
                        )}
                      >
                        {top ? money(top.amount) : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          tone={
                            b.status === "winning" || b.status === "won"
                              ? "success"
                              : b.status === "outbid"
                                ? "danger"
                                : "neutral"
                          }
                        >
                          {b.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-muted whitespace-nowrap">
                        {relativeTime(b.placedAt)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/dealer/inventory/${v.id}`}>
                          <Button size="sm" variant={behind ? "primary" : "outline"}>
                            {behind ? "Raise bid" : "View"}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
