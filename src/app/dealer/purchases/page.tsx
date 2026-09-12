"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PortalHeader } from "@/components/portal/PortalShell";
import { EmptyState, StatTile, Timeline } from "@/components/ui/Misc";
import { IconClipboard, IconDocument } from "@/components/icons";
import { dealerPurchases } from "@/lib/data/marketplace";
import { vehicleById } from "@/lib/data/vehicles";
import { miles, money, vehicleTitle } from "@/lib/format";
import { Time } from "@/components/ui/Time";

export default function DealerPurchasesPage() {
  const total = dealerPurchases.reduce((n, p) => n + p.amount, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px]">
      <PortalHeader
        title="Purchases"
        lead="Vehicles you've won, and where each one is in the handover."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile value={dealerPurchases.length} label="Vehicles purchased" hint="Last 30 days" />
        <StatTile value={money(total)} label="Total spend" hint="Last 30 days" tone="lime" />
        <StatTile
          value={money(Math.round(total / Math.max(1, dealerPurchases.length)))}
          label="Average purchase"
          hint="Last 30 days"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] items-start">
        <div className="space-y-4 min-w-0">
          {dealerPurchases.length === 0 ? (
            <Card>
              <EmptyState
                icon={<IconClipboard size={22} />}
                title="No purchases yet"
                body="Vehicles you win at an event will appear here with their pickup and payment status."
              />
            </Card>
          ) : (
            dealerPurchases.map((p) => {
              const v = vehicleById(p.vehicleId)!;
              return (
                <Card key={p.vehicleId} className="!p-0 overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <Link
                      href={`/dealer/inventory/${v.id}`}
                      className="relative w-full sm:w-[210px] shrink-0 aspect-[4/3] sm:aspect-auto sm:min-h-[168px]"
                    >
                      <Image src={v.photos[0].url} alt={vehicleTitle(v)} fill sizes="210px" className="object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="text-[18px] leading-tight">{vehicleTitle(v)}</h2>
                          <p className="mt-1 text-[13px] text-body">
                            {miles(v.mileage)} · {v.city}, {v.state} · VIN {v.vin}
                          </p>
                        </div>
                        <Badge tone={p.status === "Picked up" ? "success" : "info"}>{p.status}</Badge>
                      </div>

                      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-4">
                        <div>
                          <p className="text-[11.5px] text-muted">Purchase price</p>
                          <p className="font-display font-extrabold text-[24px] text-heading leading-none tabular-nums">
                            {money(p.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11.5px] text-muted">Closed</p>
                          <Time iso={p.closedAt} format="longdate" className="block text-[14px] font-medium text-heading" />
                        </div>
                        <div>
                          <p className="text-[11.5px] text-muted">Invoice</p>
                          <p className="text-[14px] font-medium text-heading tabular-nums">{p.invoice}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          <IconDocument size={15} />
                          Download invoice
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="What happens after you win" />
            <Timeline
              steps={[
                { label: "Seller accepts", description: "You're notified immediately and the vehicle is yours to collect.", completedAt: new Date().toISOString() },
                { label: "Documents verified", description: "Way More confirms title, ID and payoff before release.", completedAt: new Date().toISOString() },
                { label: "Schedule pickup", description: "You arrange a window directly with the seller.", completedAt: null, active: true },
                { label: "Pay through Way More", description: "Funds move to the seller once you confirm collection.", completedAt: null },
              ]}
            />
          </Card>

          <Card>
            <CardHeader title="Billing" subtitle="Way More invoices weekly" />
            <dl className="space-y-2.5 text-[13.5px]">
              {[
                ["Buyer fee", "$0 — included"],
                ["Payment terms", "Net 3 days"],
                ["Method", "ACH on file"],
              ].map(([k, val]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-heading font-medium">{val}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
