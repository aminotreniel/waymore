"use client";

import { useState } from "react";
import { EstimateAside, FunnelShell } from "@/components/marketing/FunnelShell";
import { Input, Select } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Misc";
import { Tabs } from "@/components/ui/Disclosure";
import { IconInfo, IconVin } from "@/components/icons";
import { useSellFlow } from "@/context/SellFlowContext";

const YEARS = Array.from({ length: 26 }, (_, i) => String(new Date().getFullYear() - i));
const MAKES = ["Acura", "BMW", "Chevrolet", "Chrysler", "Dodge", "Ford", "GMC", "Honda", "Hyundai", "Jeep", "Kia", "Lexus", "Mazda", "Mercedes-Benz", "Nissan", "Ram", "Subaru", "Tesla", "Toyota", "Volkswagen"];
const MODELS: Record<string, string[]> = {
  Honda: ["Accord", "Civic", "CR-V", "Pilot", "Odyssey", "HR-V"],
  Ford: ["F-150", "Explorer", "Escape", "Edge", "Bronco", "Mustang"],
  Toyota: ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma", "Tundra"],
  Chevrolet: ["Equinox", "Silverado", "Malibu", "Traverse", "Tahoe", "Blazer"],
};
const BODY_STYLES = ["Sedan", "SUV", "Truck", "Coupe", "Hatchback", "Van", "Wagon"];

export default function SellDetailsPage() {
  const { data, set } = useSellFlow();
  const [mode, setMode] = useState("vin");
  const models = MODELS[data.make] ?? [data.model || "Other"];

  const canContinue =
    mode === "vin"
      ? data.vin.trim().length >= 11 && data.mileage.trim() !== "" && data.zip.trim().length >= 5
      : Boolean(data.year && data.make && data.model && data.mileage && data.zip.length >= 5);

  return (
    <FunnelShell
      stepIndex={0}
      title="Tell us about your car"
      lead="Start with the basics. This takes about two minutes and gives you a real-time estimate before you commit to anything."
      aside={<EstimateAside />}
      backHref="/"
      nextHref="/sell/condition"
      canContinue={canContinue}
    >
      <div className="rounded-2xl bg-surface ring-1 ring-line shadow-card overflow-hidden">
        <div className="px-5 sm:px-6 pt-4 border-b border-line">
          <Tabs
            tabs={[
              { key: "vin", label: "Use VIN or plate" },
              { key: "manual", label: "Enter manually" },
            ]}
            active={mode}
            onChange={setMode}
          />
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {mode === "vin" ? (
            <>
              <Input
                label="VIN or licence plate"
                required
                placeholder="1HGCV1F32KA123456"
                hint="17 characters"
                value={data.vin}
                onChange={(e) => set("vin", e.target.value.toUpperCase())}
              />
              <Callout tone="neutral" icon={<IconVin size={17} />}>
                Your VIN is on your registration, your insurance card, and the driver-side corner of
                the windshield. We use it to pull the exact trim and factory options — that alone
                usually moves an estimate by several hundred dollars.
              </Callout>
            </>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Year" required options={YEARS} value={data.year} onChange={(e) => set("year", e.target.value)} />
              <Select
                label="Make"
                required
                options={MAKES}
                value={data.make}
                onChange={(e) => {
                  set("make", e.target.value);
                  set("model", (MODELS[e.target.value] ?? [""])[0] ?? "");
                }}
              />
              <Select label="Model" required options={models} value={data.model} onChange={(e) => set("model", e.target.value)} />
              <Input label="Trim" hint="optional" placeholder="EX, XLT, Limited…" value={data.trim} onChange={(e) => set("trim", e.target.value)} />
              <Select label="Body style" options={BODY_STYLES} value={data.bodyStyle} onChange={(e) => set("bodyStyle", e.target.value)} />
              <Select
                label="Drivetrain"
                options={["FWD", "RWD", "AWD", "4x4"]}
                value={data.drivetrain}
                onChange={(e) => set("drivetrain", e.target.value)}
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 border-t border-line pt-5">
            <Input
              label="Current mileage"
              required
              inputMode="numeric"
              placeholder="68,500"
              value={data.mileage}
              onChange={(e) => set("mileage", e.target.value.replace(/[^\d]/g, ""))}
            />
            <Input
              label="ZIP code"
              required
              inputMode="numeric"
              maxLength={5}
              hint="finds your local dealers"
              value={data.zip}
              onChange={(e) => set("zip", e.target.value.replace(/[^\d]/g, ""))}
            />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <Callout tone="info" icon={<IconInfo size={17} />}>
          <strong>Nothing is committed yet.</strong> You&apos;ll see your estimate before creating an
          account, and you can stop at any point.
        </Callout>
      </div>
    </FunnelShell>
  );
}
