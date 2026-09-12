"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PortalHeader } from "@/components/portal/PortalShell";
import { VehicleGallery } from "@/components/vehicle/VehicleGallery";
import { ActivityFeed } from "@/components/portal/ActivityFeed";
import { Callout, StatTile } from "@/components/ui/Misc";
import { Countdown } from "@/components/ui/Countdown";
import { IconAlert, IconInfo, IconPencil } from "@/components/icons";
import { useSession } from "@/context/SessionContext";
import { vehicleById } from "@/lib/data/vehicles";
import { sellerActivity } from "@/lib/data/marketplace";
import { CURRENT_EVENT_CLOSES_AT, eventDeadlineLabel } from "@/lib/data/clock";
import { miles, money, vehicleTitle } from "@/lib/format";

export default function SellerVehiclePage() {
  const { seller } = useSession();
  const vehicle = vehicleById(seller.vehicleIds[0])!;

  const specs: [string, string][] = [
    ["VIN", vehicle.vin],
    ["Mileage", miles(vehicle.mileage)],
    ["Body style", vehicle.bodyStyle],
    ["Drivetrain", vehicle.drivetrain],
    ["Transmission", vehicle.transmission],
    ["Fuel", vehicle.fuelType],
    ["Exterior", vehicle.exteriorColor],
    ["Interior", vehicle.interiorColor],
    ["Title", vehicle.titleStatus === "clean" ? "Clean" : vehicle.titleStatus],
    ["Owners", String(vehicle.owners)],
    ["Accidents", String(vehicle.accidents)],
    ["Keys", String(vehicle.keys)],
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px]">
      <PortalHeader
        title="My Vehicle"
        lead="Everything dealers can see about your car, and how it's performing in the event."
        action={
          <Button variant="outline" size="sm">
            <IconPencil size={15} />
            Edit listing
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] items-start">
        <div className="space-y-5 min-w-0">
          <Card className="!p-0 overflow-hidden">
            <div className="p-4 sm:p-5">
              <VehicleGallery photos={vehicle.photos} alt={vehicleTitle(vehicle)} />
            </div>
            <div className="px-5 sm:px-6 pb-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-[23px] leading-tight">{vehicleTitle(vehicle)}</h2>
                  <p className="text-[14px] text-body mt-1">
                    {miles(vehicle.mileage)} · {vehicle.city}, {vehicle.state} {vehicle.zip}
                  </p>
                </div>
                <StatusBadge status={vehicle.status} />
              </div>

              {vehicle.highlights.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {vehicle.highlights.map((h) => (
                    <Badge key={h} tone="lime">{h}</Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile value={vehicle.viewCount} label="Dealer views" hint="Since going live" />
            <StatTile value={vehicle.bidCount} label="Total bids" hint="Across all dealers" />
            <StatTile value={vehicle.saveCount} label="Dealers watching" hint="Saved your vehicle" />
          </div>

          <Card>
            <CardHeader title="Vehicle details" subtitle="What dealers see when they open your listing" />
            <dl className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-line py-2.5 last:border-0">
                  <dt className="text-[13.5px] text-muted">{k}</dt>
                  <dd className="text-[13.5px] font-medium text-heading text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {vehicle.disclosures.length > 0 && (
            <Card>
              <CardHeader
                title="Your disclosures"
                subtitle="Being upfront is what keeps dealer offers firm at pickup"
              />
              <ul className="space-y-2.5">
                {vehicle.disclosures.map((d) => (
                  <li key={d} className="flex gap-2.5">
                    <IconAlert size={16} className="mt-0.5 shrink-0 text-warn" />
                    <span className="text-[13.5px] text-body">{d}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <CardHeader title="Full activity" subtitle="Every dealer interaction with your listing" />
            <ActivityFeed items={sellerActivity} />
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="!bg-mint-50 !ring-lime-200">
            <h3 className="text-[15.5px]">Bidding closes in</h3>
            <div className="mt-3.5">
              <Countdown to={CURRENT_EVENT_CLOSES_AT} size="sm" />
            </div>
            <p className="mt-3.5 text-[12.5px] leading-relaxed text-body">
              {eventDeadlineLabel(CURRENT_EVENT_CLOSES_AT)}
            </p>
          </Card>

          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-1.5">
                  Estimated value <IconInfo size={14} className="text-muted" />
                </span>
              }
            />
            <p className="font-display font-extrabold text-[25px] text-heading leading-none tracking-tight tabular-nums">
              {money(vehicle.estimateLow)} – {money(vehicle.estimateHigh)}
            </p>
            <p className="mt-3 text-[12.5px] leading-relaxed text-body">
              Built from live wholesale auction results, retail listings near {vehicle.zip}, past
              Way More sales, and the condition details you gave us.
            </p>
          </Card>

          <Card>
            <CardHeader title="Listing controls" />
            <div className="space-y-2.5">
              <ButtonLink href="/seller/offers" fullWidth size="sm" withArrow>
                Review my offers
              </ButtonLink>
              <Button variant="outline" fullWidth size="sm">
                Add more photos
              </Button>
              <Button variant="ghost" fullWidth size="sm" className="!text-danger hover:!bg-danger-bg">
                Withdraw listing
              </Button>
            </div>
          </Card>

          <Callout tone="neutral">
            <strong>No reserve set.</strong> You&apos;ll see every offer and you&apos;re never
            obligated to accept one.
          </Callout>
        </div>
      </div>
    </div>
  );
}
