"use client";

import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { PortalHeader } from "@/components/portal/PortalShell";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { Countdown } from "@/components/ui/Countdown";
import { EmptyState } from "@/components/ui/Misc";
import { IconHeart } from "@/components/icons";
import { useSession } from "@/context/SessionContext";
import { vehicleById } from "@/lib/data/vehicles";
import { CURRENT_EVENT_CLOSES_AT } from "@/lib/data/clock";

export default function DealerSavedPage() {
  const { savedVehicles } = useSession();
  const vehicles = savedVehicles.map(vehicleById).filter((v) => v !== undefined);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1500px]">
      <PortalHeader
        title="Saved Vehicles"
        lead="Your shortlist for this event. Saving is private — sellers and other dealers can't see it."
        action={
          <div className="flex items-center gap-4 rounded-2xl bg-surface ring-1 ring-line shadow-card px-5 py-3">
            <span className="text-[12.5px] font-semibold text-muted">Bidding ends in</span>
            <Countdown to={CURRENT_EVENT_CLOSES_AT} size="sm" />
          </div>
        }
      />

      {vehicles.length === 0 ? (
        <Card>
          <EmptyState
            icon={<IconHeart size={22} />}
            title="Nothing saved yet"
            body="Tap the heart on any vehicle to keep an eye on it here."
            action={
              <ButtonLink href="/dealer/inventory" size="sm" withArrow>
                Browse inventory
              </ButtonLink>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      )}
    </div>
  );
}
