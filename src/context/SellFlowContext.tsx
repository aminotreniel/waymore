"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SellFlowState } from "@/lib/types";

/* ==========================================================================
   Seller funnel state
   --------------------------------------------------------------------------
   Held in a provider mounted by the /sell layout, so the answers survive
   navigation between steps without a backend. When the API lands this becomes
   a draft-listing record and each step PATCHes it.
   ========================================================================== */

export const SELL_STEPS = [
  { key: "details", label: "Vehicle", href: "/sell" },
  { key: "condition", label: "Condition", href: "/sell/condition" },
  { key: "estimate", label: "Estimate", href: "/sell/estimate" },
  { key: "account", label: "Account", href: "/sell/account" },
  { key: "photos", label: "Photos", href: "/sell/photos" },
  { key: "review", label: "Review", href: "/sell/review" },
] as const;

export const PHOTO_SLOTS = [
  { id: "front", label: "Front 3/4" },
  { id: "rear", label: "Rear 3/4" },
  { id: "driver", label: "Driver side" },
  { id: "passenger", label: "Passenger side" },
  { id: "interior", label: "Interior / dash" },
  { id: "odometer", label: "Odometer" },
];

const INITIAL: SellFlowState = {
  zip: "63108",
  vin: "",
  year: "2019",
  make: "Honda",
  model: "Accord",
  trim: "EX",
  mileage: "68500",
  bodyStyle: "Sedan",
  drivetrain: "FWD",
  transmission: "CVT",
  fuelType: "Gasoline",
  exteriorColor: "Gray",
  titleStatus: "clean",
  owners: "1",
  accidents: "0",
  condition: "good",
  keys: "2",
  features: ["Apple CarPlay", "Backup camera"],
  disclosures: [],
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  photos: PHOTO_SLOTS.map((p) => ({ ...p, filled: false })),
  reserve: "",
  agreedToTerms: false,
};

interface SellFlowValue {
  data: SellFlowState;
  set: <K extends keyof SellFlowState>(key: K, value: SellFlowState[K]) => void;
  toggleFeature: (feature: string) => void;
  fillPhoto: (id: string) => void;
  clearPhoto: (id: string) => void;
  /** Indicative range derived from the answers so far. */
  estimate: { low: number; high: number };
  reset: () => void;
}

const SellFlowContext = createContext<SellFlowValue | null>(null);

/**
 * Stand-in for the pricing service. Starts from a mileage- and age-adjusted
 * base and applies the same condition/title/history modifiers the real model
 * will, so the number on screen moves sensibly as answers change.
 */
function priceEstimate(d: SellFlowState) {
  const year = Number(d.year) || 2019;
  const mileage = Number(d.mileage) || 70_000;
  const age = Math.max(0, new Date().getFullYear() - year);

  // Typical transaction price when new, by body style.
  const bodyBase: Record<string, number> = {
    Sedan: 32_000,
    SUV: 38_000,
    Truck: 46_000,
    Coupe: 35_000,
    Hatchback: 29_000,
    Van: 37_000,
    Wagon: 33_000,
  };

  // ~8.5% a year, then a penalty only for mileage above the 12k/year norm.
  let value = (bodyBase[d.bodyStyle] ?? 32_000) * Math.pow(0.915, age);
  value -= Math.max(0, mileage - age * 12_000) * 0.07;

  const conditionFactor: Record<string, number> = {
    excellent: 1.06,
    good: 1,
    fair: 0.9,
    rough: 0.76,
  };
  value *= conditionFactor[d.condition] ?? 1;

  if (d.titleStatus === "salvage") value *= 0.55;
  else if (d.titleStatus === "rebuilt") value *= 0.7;

  value *= 1 - Math.min(3, Number(d.accidents) || 0) * 0.05;
  value *= 1 - Math.max(0, (Number(d.owners) || 1) - 1) * 0.02;
  if (Number(d.keys) < 2) value -= 350;

  const mid = Math.max(1_200, value);
  return {
    low: Math.round((mid * 0.94) / 250) * 250,
    high: Math.round((mid * 1.07) / 250) * 250,
  };
}

export function SellFlowProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SellFlowState>(INITIAL);

  const set = useCallback(
    <K extends keyof SellFlowState>(key: K, value: SellFlowState[K]) =>
      setData((d) => ({ ...d, [key]: value })),
    [],
  );

  const toggleFeature = useCallback((feature: string) => {
    setData((d) => ({
      ...d,
      features: d.features.includes(feature)
        ? d.features.filter((f) => f !== feature)
        : [...d.features, feature],
    }));
  }, []);

  const fillPhoto = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      photos: d.photos.map((p) => (p.id === id ? { ...p, filled: true } : p)),
    }));
  }, []);

  const clearPhoto = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      photos: d.photos.map((p) => (p.id === id ? { ...p, filled: false } : p)),
    }));
  }, []);

  const value = useMemo<SellFlowValue>(
    () => ({
      data,
      set,
      toggleFeature,
      fillPhoto,
      clearPhoto,
      estimate: priceEstimate(data),
      reset: () => setData(INITIAL),
    }),
    [data, set, toggleFeature, fillPhoto, clearPhoto],
  );

  return <SellFlowContext.Provider value={value}>{children}</SellFlowContext.Provider>;
}

export function useSellFlow() {
  const ctx = useContext(SellFlowContext);
  if (!ctx) throw new Error("useSellFlow must be used inside <SellFlowProvider>");
  return ctx;
}
