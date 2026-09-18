"use client";
import { useAuctions } from "@/context/AuctionContext";
import { currentRound } from "@/lib/auction";
import { Card } from "@/components/ui/Card";
import { PortalHeader } from "@/components/portal/PortalShell";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
export default function DealerEventPage() {
  const { data } = useAuctions();
  const latest = data.vehicles.flatMap((v) => {
    const a = currentRound(data.auctions, v.id);
    return a ? [a] : [];
  });
  return (
    <div className="p-4 sm:p-8 space-y-5">
      <PortalHeader
        title="Timed Dealer Auctions"
        lead="Each vehicle has its own server-controlled deadline. Last-minute bids extend that vehicle’s auction."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          [latest.filter((a) => a.status === "open").length, "Open auctions"],
          [
            latest.reduce((n, a) => n + a.bid_count, 0),
            "Accepted bids in current rounds",
          ],
          [
            latest.filter((a) => a.status === "closed").length,
            "Closed auctions",
          ],
        ].map(([value, label]) => (
          <Card key={label}>
            <p className="text-3xl font-bold">{value}</p>
            <p className="mt-1 text-muted">{label}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.vehicles.map((v) => (
          <VehicleCard key={v.id} vehicle={v} />
        ))}
      </div>
    </div>
  );
}
