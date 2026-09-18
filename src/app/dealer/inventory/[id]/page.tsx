"use client";
import Link from "next/link";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAuctions } from "@/context/AuctionContext";
import { Card } from "@/components/ui/Card";
import { VehicleGallery } from "@/components/vehicle/VehicleGallery";
import { AuctionBidPanel } from "@/components/auction/AuctionBidPanel";
import { roundsFor, outcomeLabel } from "@/lib/auction";
import { vehicleTitle, miles, money } from "@/lib/format";

export default function DealerVehicleDetail() {
  return (
    <Suspense fallback={<div className="p-8">Loading auction…</div>}>
      <VehicleDetail />
    </Suspense>
  );
}

function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  // A vehicle can be auctioned more than once. ?round= opens a specific round so
  // a link from My Bids lands on the round that bid belongs to.
  const requestedRound = useSearchParams().get("round");
  const { data, loading } = useAuctions();
  const vehicle = data.vehicles.find((v) => v.id === id);
  const rounds = roundsFor(data.auctions, id);
  const current = rounds[0];
  const auction =
    (requestedRound && rounds.find((a) => a.id === requestedRound)) || current;
  const viewingPast = Boolean(auction && current && auction.id !== current.id);
  if (loading) return <div className="p-8">Loading auction…</div>;
  if (!vehicle)
    return (
      <div className="p-8">
        Vehicle not found.{" "}
        <Link href="/dealer/inventory" className="underline">
          Browse inventory
        </Link>
      </div>
    );
  const specs = [
    ["VIN", vehicle.vin],
    ["Mileage", miles(vehicle.mileage)],
    ["Body style", vehicle.bodyStyle],
    ["Drivetrain", vehicle.drivetrain],
    ["Transmission", vehicle.transmission],
    ["Fuel", vehicle.fuelType],
    ["Exterior", vehicle.exteriorColor],
    ["Interior", vehicle.interiorColor],
    ["Title", vehicle.titleStatus],
    ["Owners", vehicle.owners],
    ["Accidents", vehicle.accidents],
    ["Keys", vehicle.keys],
  ];
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1500px]">
      <Link href="/dealer/inventory" className="text-sm font-semibold">
        ← Back to Inventory
      </Link>
      {viewingPast && auction && (
        <div
          role="status"
          className="rounded-xl bg-amber-50 px-4 py-3 text-sm ring-1 ring-amber-200"
        >
          Previous round · {outcomeLabel(auction)}. This vehicle has been
          auctioned {rounds.length} times.{" "}
          <Link href={`/dealer/inventory/${vehicle.id}`} className="underline">
            Go to the current round
          </Link>
        </div>
      )}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px] items-start">
        <div className="space-y-5">
          <Card className="!p-4">
            <VehicleGallery
              photos={vehicle.photos}
              alt={vehicleTitle(vehicle)}
            />
          </Card>
          <Card>
            <h1 className="text-3xl">{vehicleTitle(vehicle)}</h1>
            <p className="mt-2 text-body">
              {vehicle.city}, {vehicle.state} · {miles(vehicle.mileage)}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                vehicle.titleStatus + " title",
                vehicle.drivetrain,
                vehicle.transmission,
                vehicle.condition + " condition",
              ].map((t) => (
                <span
                  key={t}
                  className="rounded-lg bg-mint-50 px-3 py-1 text-xs font-semibold"
                >
                  {t}
                </span>
              ))}
            </div>
            <h2 className="mt-6 text-base">Highlights</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-body">
              {vehicle.highlights.map((h) => (
                <li key={h}>✓ {h}</li>
              ))}
            </ul>
            {vehicle.disclosures.length > 0 && (
              <>
                <h2 className="mt-6 text-base">Seller disclosures</h2>
                <ul className="mt-3 space-y-2 text-sm text-body">
                  {vehicle.disclosures.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </>
            )}
          </Card>
          <Card>
            <h2 className="text-lg">Vehicle details</h2>
            <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">
              {specs.map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-4 border-b border-line py-3 text-sm"
                >
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-medium text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card>
            <h2 className="text-lg">Seller’s estimate</h2>
            <p className="mt-3 text-2xl font-bold">
              {money(vehicle.estimateLow)} – {money(vehicle.estimateHigh)}
            </p>
            <p className="mt-3 text-sm text-body">
              {vehicle.reservePrice
                ? `Reserve: ${money(vehicle.reservePrice)}.`
                : "No reserve."}{" "}
              The final high bid is recorded for seller review. Auction closure
              does not complete a sale.
            </p>
          </Card>
        </div>
        {auction ? (
          <AuctionBidPanel key={auction.id} auction={auction} />
        ) : (
          <Card>No auction is scheduled for this vehicle.</Card>
        )}
      </div>
    </div>
  );
}
