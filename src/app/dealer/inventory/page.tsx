"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PortalHeader } from "@/components/portal/PortalShell";
import { Tabs } from "@/components/ui/Disclosure";
import { useAuctions } from "@/context/AuctionContext";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { Checkbox, Select } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/Misc";
import { IconCar, IconFilter, IconSearch, IconX } from "@/components/icons";

import { cx, money } from "@/lib/format";

const BODY_TABS = [
  { key: "all", label: "All Vehicles" },
  { key: "Sedan", label: "Cars" },
  { key: "SUV", label: "SUVs" },
  { key: "Truck", label: "Trucks" },
  { key: "luxury", label: "Luxury" },
];
const LUXURY = ["BMW", "Acura", "Tesla", "Mercedes-Benz", "Lexus"];

const SORTS = [
  { value: "ending", label: "Ending soonest" },
  { value: "bid-desc", label: "Highest bid" },
  { value: "bid-asc", label: "Lowest bid" },
  { value: "miles", label: "Fewest miles" },
  { value: "newest", label: "Newest year" },
];

export default function DealerInventoryPage() {
  const { data } = useAuctions();
  const listedVehicles = data.vehicles;
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("ending");
  const [showFilters, setShowFilters] = useState(false);
  const [drivetrains, setDrivetrains] = useState<string[]>([]);
  const [titles, setTitles] = useState<string[]>([]);
  const [maxMiles, setMaxMiles] = useState("any");
  const [maxBid, setMaxBid] = useState("any");

  const toggle = (
    list: string[],
    setList: (v: string[]) => void,
    value: string,
  ) =>
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );

  const results = useMemo(() => {
    const highBidFor = (id: string) => {
      const a = data.auctions.find((a) => a.vehicle_id === id);
      return a?.high_bid_cents ? { amount: a.high_bid_cents / 100 } : null;
    };
    let out = listedVehicles.filter((v) =>
      tab === "all"
        ? true
        : tab === "luxury"
          ? LUXURY.includes(v.make)
          : v.bodyStyle === tab,
    );

    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter((v) =>
        `${v.year} ${v.make} ${v.model} ${v.trim} ${v.city} ${v.exteriorColor}`
          .toLowerCase()
          .includes(q),
      );
    }
    if (drivetrains.length)
      out = out.filter((v) => drivetrains.includes(v.drivetrain));
    if (titles.length) out = out.filter((v) => titles.includes(v.titleStatus));
    if (maxMiles !== "any")
      out = out.filter((v) => v.mileage <= Number(maxMiles));
    if (maxBid !== "any") {
      out = out.filter((v) => {
        const b = highBidFor(v.id);
        return !b || b.amount <= Number(maxBid);
      });
    }

    const bid = (id: string) => highBidFor(id)?.amount ?? 0;
    return [...out].sort((a, b) => {
      switch (sort) {
        case "bid-desc":
          return bid(b.id) - bid(a.id);
        case "bid-asc":
          return bid(a.id) - bid(b.id);
        case "miles":
          return a.mileage - b.mileage;
        case "newest":
          return b.year - a.year;
        default:
          return (
            Date.parse(
              data.auctions.find((x) => x.vehicle_id === a.id)?.ends_at ?? "",
            ) -
            Date.parse(
              data.auctions.find((x) => x.vehicle_id === b.id)?.ends_at ?? "",
            )
          );
      }
    });
  }, [
    tab,
    query,
    sort,
    drivetrains,
    titles,
    maxMiles,
    maxBid,
    data.auctions,
    listedVehicles,
  ]);

  const activeFilters =
    drivetrains.length +
    titles.length +
    (maxMiles !== "any" ? 1 : 0) +
    (maxBid !== "any" ? 1 : 0);

  const clearAll = () => {
    setDrivetrains([]);
    setTitles([]);
    setMaxMiles("any");
    setMaxBid("any");
    setQuery("");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1500px]">
      <PortalHeader
        title="Browse Inventory"
        lead="Every vehicle in this week's event, sourced directly from local sellers."
        action={
          <div className="flex items-center gap-4 rounded-2xl bg-surface ring-1 ring-line shadow-card px-5 py-3">
            <span className="text-[12.5px] font-semibold text-muted">
              Individual vehicle timers
            </span>
            <span className="text-sm font-semibold">Live</span>
          </div>
        }
      />

      <Card className="!p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 pt-4 border-b border-line">
          <Tabs tabs={BODY_TABS} active={tab} onChange={setTab} />
          <div className="flex flex-wrap items-center gap-2.5 pb-3">
            <div className="relative">
              <IconSearch
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by make, model, or keyword"
                aria-label="Search inventory"
                className="h-9 w-[250px] max-w-full rounded-lg bg-paper pl-9 pr-3 text-[13px] text-heading placeholder:text-muted ring-1 ring-inset ring-transparent focus:ring-ink-600 focus:outline-none"
              />
            </div>
            <Select
              options={SORTS}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort by"
              className="w-[170px] [&_select]:!h-9 [&_select]:!text-[13px]"
            />
            <Button
              variant={showFilters || activeFilters ? "dark" : "outline"}
              size="sm"
              onClick={() => setShowFilters((f) => !f)}
            >
              <IconFilter size={15} />
              Filters
              {activeFilters > 0 && (
                <span className="ml-0.5 grid size-5 place-items-center rounded-full bg-lime-400 text-[11px] font-bold text-ink-950">
                  {activeFilters}
                </span>
              )}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="border-b border-line bg-paper/60 p-5 animate-fade-up">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <fieldset>
                <legend className="text-[12.5px] font-bold uppercase tracking-[0.09em] text-muted mb-3">
                  Drivetrain
                </legend>
                <div className="space-y-2.5">
                  {["FWD", "RWD", "AWD", "4x4"].map((d) => (
                    <Checkbox
                      key={d}
                      label={d}
                      checked={drivetrains.includes(d)}
                      onChange={() => toggle(drivetrains, setDrivetrains, d)}
                    />
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-[12.5px] font-bold uppercase tracking-[0.09em] text-muted mb-3">
                  Title status
                </legend>
                <div className="space-y-2.5">
                  {[
                    { v: "clean", l: "Clean" },
                    { v: "lien", l: "Lien on file" },
                    { v: "rebuilt", l: "Rebuilt" },
                    { v: "salvage", l: "Salvage" },
                  ].map((t) => (
                    <Checkbox
                      key={t.v}
                      label={t.l}
                      checked={titles.includes(t.v)}
                      onChange={() => toggle(titles, setTitles, t.v)}
                    />
                  ))}
                </div>
              </fieldset>

              <Select
                label="Maximum mileage"
                options={[
                  { value: "any", label: "Any mileage" },
                  { value: "30000", label: "Under 30,000" },
                  { value: "60000", label: "Under 60,000" },
                  { value: "80000", label: "Under 80,000" },
                  { value: "100000", label: "Under 100,000" },
                ]}
                value={maxMiles}
                onChange={(e) => setMaxMiles(e.target.value)}
              />

              <Select
                label="Maximum current bid"
                options={[
                  { value: "any", label: "Any amount" },
                  { value: "15000", label: "Under $15,000" },
                  { value: "25000", label: "Under $25,000" },
                  { value: "35000", label: "Under $35,000" },
                ]}
                value={maxBid}
                onChange={(e) => setMaxBid(e.target.value)}
              />
            </div>

            {activeFilters > 0 && (
              <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <span className="text-[12.5px] text-muted">Active:</span>
                <div className="flex flex-wrap gap-2">
                  {[...drivetrains, ...titles].map((f) => (
                    <Badge key={f} tone="ink">
                      {f}
                    </Badge>
                  ))}
                  {maxMiles !== "any" && (
                    <Badge tone="ink">
                      Under {Number(maxMiles).toLocaleString()} mi
                    </Badge>
                  )}
                  {maxBid !== "any" && (
                    <Badge tone="ink">Under {money(Number(maxBid))}</Badge>
                  )}
                </div>
                <button
                  onClick={clearAll}
                  className="ml-auto inline-flex items-center gap-1 text-[12.5px] font-semibold text-body hover:text-heading transition-colors"
                >
                  <IconX size={13} />
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        <div className="p-4 sm:p-5">
          <p className="mb-4 text-[13px] text-muted">
            Showing{" "}
            <strong className={cx("text-heading")}>{results.length}</strong> of{" "}
            {listedVehicles.length} vehicles
          </p>

          {results.length === 0 ? (
            <EmptyState
              icon={<IconCar size={22} />}
              title="No vehicles match those filters"
              body="Try widening your mileage or bid range, or clearing the title filters."
              action={
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
