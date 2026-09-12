"use client";

import Image from "next/image";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Field";
import { PortalHeader } from "@/components/portal/PortalShell";
import { Callout, EmptyState } from "@/components/ui/Misc";
import { VehicleGallery } from "@/components/vehicle/VehicleGallery";
import { IconAlert, IconCheck, IconCheckCircle, IconX } from "@/components/icons";
import { approvalQueue } from "@/lib/data/marketplace";
import { vehicleById } from "@/lib/data/vehicles";
import { cx, miles, money, relativeTime, vehicleTitle } from "@/lib/format";

export default function AdminApprovalsPage() {
  const [queue, setQueue] = useState(approvalQueue);
  const [activeId, setActiveId] = useState(approvalQueue[0]?.vehicleId ?? null);
  const [rejecting, setRejecting] = useState(false);
  const [log, setLog] = useState<{ id: string; action: "approved" | "rejected" }[]>([]);

  const item = queue.find((q) => q.vehicleId === activeId) ?? queue[0] ?? null;
  const vehicle = item ? vehicleById(item.vehicleId) : null;

  const resolve = (action: "approved" | "rejected") => {
    if (!item) return;
    setLog((l) => [{ id: item.vehicleId, action }, ...l]);
    const rest = queue.filter((q) => q.vehicleId !== item.vehicleId);
    setQueue(rest);
    setActiveId(rest[0]?.vehicleId ?? null);
    setRejecting(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1500px]">
      <PortalHeader
        title="Approval Queue"
        lead="Listings must clear review before they enter an event."
        action={
          <Badge tone={queue.length ? "warn" : "success"}>
            {queue.length} pending
          </Badge>
        }
      />

      {queue.length === 0 ? (
        <Card>
          <EmptyState
            icon={<IconCheckCircle size={22} />}
            title="Queue is clear"
            body={
              log.length
                ? `You just processed ${log.length} listing${log.length === 1 ? "" : "s"}. New submissions land here automatically.`
                : "New seller submissions will appear here for review."
            }
          />
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] items-start">
          {/* queue list */}
          <Card className="!p-0 overflow-hidden">
            <div className="p-4 border-b border-line">
              <h2 className="text-[14px] font-bold text-heading">Waiting on review</h2>
            </div>
            <ul className="divide-y divide-line">
              {queue.map((q) => {
                const v = vehicleById(q.vehicleId)!;
                const on = q.vehicleId === item?.vehicleId;
                return (
                  <li key={q.vehicleId}>
                    <button
                      onClick={() => setActiveId(q.vehicleId)}
                      className={cx(
                        "flex w-full items-start gap-3 p-4 text-left transition-colors",
                        on ? "bg-mint-50" : "hover:bg-paper",
                      )}
                    >
                      <span className="relative size-12 shrink-0 overflow-hidden rounded-lg">
                        <Image src={v.photos[0].url} alt="" fill sizes="48px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-semibold text-heading truncate">
                          {vehicleTitle(v)}
                        </span>
                        <span className="block text-[12px] text-muted">{q.sellerName}</span>
                        <span className="mt-1.5 block">
                          <Badge tone={q.priority === "high" ? "warn" : "neutral"}>
                            {q.priority === "high" ? "High priority" : "Normal"}
                          </Badge>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* detail */}
          {item && vehicle && (
            <div className="space-y-5 min-w-0">
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-[23px] leading-tight">{vehicleTitle(vehicle)}</h2>
                    <p className="mt-1 text-[13.5px] text-body">
                      Submitted by {item.sellerName} · {relativeTime(item.submittedAt)}
                    </p>
                  </div>
                  <Badge tone={item.priority === "high" ? "warn" : "neutral"}>
                    {item.priority === "high" ? "High priority" : "Normal"}
                  </Badge>
                </div>

                <div className="mt-4">
                  <Callout tone="warn" icon={<IconAlert size={17} />}>
                    <strong>Why this needs review:</strong> {item.reason}
                  </Callout>
                </div>

                {item.flags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.flags.map((f) => (
                      <Badge key={f} tone="danger">{f}</Badge>
                    ))}
                  </div>
                )}

                <div className="mt-5 pt-5 border-t border-line">
                  <VehicleGallery photos={vehicle.photos} alt={vehicleTitle(vehicle)} aspect="aspect-[16/9]" />
                </div>

                <dl className="mt-5 grid gap-x-8 sm:grid-cols-2">
                  {([
                    ["VIN", vehicle.vin],
                    ["Mileage", miles(vehicle.mileage)],
                    ["Title", vehicle.titleStatus],
                    ["Owners", String(vehicle.owners)],
                    ["Accidents", String(vehicle.accidents)],
                    ["Condition", vehicle.condition],
                    ["Location", `${vehicle.city}, ${vehicle.state} ${vehicle.zip}`],
                    ["Estimate", `${money(vehicle.estimateLow)} – ${money(vehicle.estimateHigh)}`],
                  ] as [string, string][]).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-line py-2.5 last:border-0">
                      <dt className="text-[13.5px] text-muted">{k}</dt>
                      <dd className="text-[13.5px] font-medium text-heading text-right">{v}</dd>
                    </div>
                  ))}
                </dl>

                {vehicle.disclosures.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-line">
                    <h3 className="text-[14.5px] font-bold text-heading mb-2.5">Seller disclosures</h3>
                    <ul className="space-y-2">
                      {vehicle.disclosures.map((d) => (
                        <li key={d} className="flex gap-2.5 text-[13.5px] text-body">
                          <IconAlert size={15} className="mt-0.5 shrink-0 text-warn" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-5">
                  <Button variant="success" onClick={() => resolve("approved")}>
                    <IconCheck size={17} strokeWidth={3} />
                    Approve for next event
                  </Button>
                  <Button variant="outline">Request more photos</Button>
                  <Button variant="ghost" className="!text-danger hover:!bg-danger-bg" onClick={() => setRejecting(true)}>
                    <IconX size={16} />
                    Reject
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {log.length > 0 && (
        <Card>
          <CardHeader title="Processed this session" />
          <ul className="divide-y divide-line">
            {log.map((l, i) => {
              const v = vehicleById(l.id)!;
              return (
                <li key={`${l.id}-${i}`} className="flex items-center justify-between gap-4 py-2.5">
                  <span className="text-[13.5px] text-heading">{vehicleTitle(v)}</span>
                  <Badge tone={l.action === "approved" ? "success" : "danger"}>{l.action}</Badge>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Modal
        open={rejecting}
        onClose={() => setRejecting(false)}
        title="Reject this listing"
        description="The seller is emailed your reason and can resubmit once it's addressed."
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setRejecting(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => resolve("rejected")}>Reject listing</Button>
          </div>
        }
      >
        <Textarea
          label="Reason for rejection"
          placeholder="e.g. photos don't show the disclosed rear-quarter damage…"
        />
      </Modal>
    </div>
  );
}
