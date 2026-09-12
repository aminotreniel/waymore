"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Field";
import { Callout, EmptyState, Timeline } from "@/components/ui/Misc";
import { DealerMark } from "@/components/brand/DealerMark";
import {
  IconAlert,
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconClock,
  IconMail,
  IconMapPin,
  IconPencil,
  IconPhone,
  IconShieldCheck,
  IconStar,
  IconTag,
  IconVin,
  IconX,
} from "@/components/icons";
import { dealerById } from "@/lib/data/people";
import { offerById, offersForVehicle } from "@/lib/data/marketplace";
import { vehicleById } from "@/lib/data/vehicles";
import { miles, money, vehicleTitle } from "@/lib/format";
import { Time } from "@/components/ui/Time";

type Action = "accept" | "counter" | "decline" | null;

export default function OfferDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const offer = offerById(params.id);
  const [action, setAction] = useState<Action>(null);
  const [counterAmount, setCounterAmount] = useState("");
  const [resolved, setResolved] = useState<Action>(null);

  if (!offer) {
    return (
      <div className="p-8">
        <EmptyState
          icon={<IconTag size={22} />}
          title="Offer not found"
          body="This offer may have expired or been withdrawn."
          action={
            <Button variant="outline" size="sm" onClick={() => router.push("/seller/offers")}>
              Back to offers
            </Button>
          }
        />
      </div>
    );
  }

  const dealer = dealerById(offer.dealerId)!;
  const vehicle = vehicleById(offer.vehicleId)!;
  const competing = offersForVehicle(offer.vehicleId).filter((o) => o.id !== offer.id);
  const isLive = offer.status === "pending" && !resolved;

  const confirm = () => {
    setResolved(action);
    setAction(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px]">
      <Link
        href="/seller/offers"
        className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-body hover:text-heading transition-colors"
      >
        <IconArrowLeft size={16} />
        Back to Offers
      </Link>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px] items-start">
        <div className="space-y-5 min-w-0">
          {/* ------------------------------------------------ offer card */}
          <Card className="!p-0 overflow-hidden">
            <div className="flex items-center gap-3.5 border-b border-line p-5 sm:p-6">
              <DealerMark initials={dealer.markInitials} color={dealer.markColor} size={46} />
              <div className="min-w-0 flex-1">
                <p className="text-[15.5px] font-bold text-heading truncate">{dealer.name}</p>
                <Time iso={offer.createdAt} className="block text-[12.5px] text-muted" />
              </div>
              {offer.isTopOffer && <Badge tone="lime">Top offer</Badge>}
            </div>

            <div className="p-5 sm:p-6">
              <h1 className="text-[24px] sm:text-[28px] leading-tight">
                {dealer.name} placed a bid on your vehicle!
              </h1>
              <p className="mt-2.5 text-[15px] leading-relaxed text-body">
                {dealer.name} has submitted a bid for your {vehicleTitle(vehicle)}. You can accept,
                counter, or decline this offer below.
              </p>

              {/* vehicle summary */}
              <div className="mt-5 flex flex-col sm:flex-row gap-4 rounded-xl bg-paper ring-1 ring-line p-4">
                <div className="relative w-full sm:w-[190px] shrink-0 aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src={vehicle.photos[0].url}
                    alt={vehicleTitle(vehicle)}
                    fill
                    sizes="190px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[18px] leading-tight">{vehicleTitle(vehicle)}</h2>
                  <dl className="mt-2.5 space-y-1.5 text-[13.5px]">
                    <div className="flex items-center gap-2">
                      <IconCalendar size={15} className="text-muted shrink-0" />
                      <dt className="sr-only">Mileage</dt>
                      <dd className="text-body">Mileage: <span className="text-heading font-medium">{miles(vehicle.mileage)}</span></dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconMapPin size={15} className="text-muted shrink-0" />
                      <dt className="sr-only">Location</dt>
                      <dd className="text-body">Location: <span className="text-heading font-medium">{vehicle.city}, {vehicle.state}</span></dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconVin size={15} className="text-muted shrink-0" />
                      <dt className="sr-only">VIN</dt>
                      <dd className="text-body">VIN: <span className="text-heading font-medium">{vehicle.vin}</span></dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* the offer */}
              <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-5 rounded-xl bg-mint-50 ring-1 ring-lime-200 p-5">
                <div className="flex-1">
                  <p className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-ink-700">
                    Dealer offer
                  </p>
                  <p className="mt-1.5 font-display font-extrabold text-[42px] leading-none tracking-tight text-heading tabular-nums">
                    {money(offer.amount)}
                  </p>
                  <p className="mt-1.5 text-[13.5px] font-semibold text-body">
                    from {dealer.name}
                  </p>
                </div>
                <div className="flex items-center gap-3.5 sm:border-l sm:border-lime-200 sm:pl-5">
                  <DealerMark initials={dealer.markInitials} color={dealer.markColor} size={52} />
                  <div className="text-[13px] space-y-1">
                    <p className="font-semibold text-heading">{dealer.name}</p>
                    <p className="text-muted">{dealer.city}, {dealer.state}</p>
                    <p className="flex items-center gap-1.5 text-body"><IconPhone size={13} /> {dealer.phone}</p>
                    <p className="flex items-center gap-1.5 text-body"><IconMail size={13} /> {dealer.email}</p>
                  </div>
                </div>
              </div>

              {offer.notes && (
                <p className="mt-4 rounded-xl bg-paper ring-1 ring-line px-4 py-3 text-[13.5px] italic text-body">
                  “{offer.notes}”
                </p>
              )}

              {/* actions */}
              {isLive ? (
                <>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <button
                      onClick={() => setAction("accept")}
                      className="flex items-center justify-center gap-2.5 rounded-xl bg-success px-4 py-3.5 text-white transition-[filter] hover:brightness-110"
                    >
                      <IconCheck size={20} strokeWidth={3} />
                      <span className="text-left leading-tight">
                        <span className="block font-display font-bold text-[15px]">Accept Offer</span>
                        <span className="block text-[11.5px] text-white/80">
                          Sell for {money(offer.amount)}
                        </span>
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setCounterAmount(String(offer.amount + 500));
                        setAction("counter");
                      }}
                      className="flex items-center justify-center gap-2.5 rounded-xl bg-info px-4 py-3.5 text-white transition-[filter] hover:brightness-110"
                    >
                      <IconPencil size={19} />
                      <span className="text-left leading-tight">
                        <span className="block font-display font-bold text-[15px]">Counter Offer</span>
                        <span className="block text-[11.5px] text-white/80">Suggest a price</span>
                      </span>
                    </button>
                    <button
                      onClick={() => setAction("decline")}
                      className="flex items-center justify-center gap-2.5 rounded-xl bg-danger px-4 py-3.5 text-white transition-[filter] hover:brightness-110"
                    >
                      <IconX size={20} strokeWidth={3} />
                      <span className="text-left leading-tight">
                        <span className="block font-display font-bold text-[15px]">Decline Offer</span>
                        <span className="block text-[11.5px] text-white/80">Reject this bid</span>
                      </span>
                    </button>
                  </div>

                  <div className="mt-4">
                    <Callout tone="info">
                      <strong>Need time?</strong> Take your time to review and respond — this offer
                      stays open for 48 hours.
                    </Callout>
                  </div>
                </>
              ) : (
                <div className="mt-6">
                  {resolved === "accept" ? (
                    <Callout tone="success">
                      <strong>Offer accepted.</strong> We&apos;ve notified {dealer.name}. Head to{" "}
                      <Link href="/seller/payout" className="underline underline-offset-2 font-semibold">
                        Payout &amp; Pickup
                      </Link>{" "}
                      to upload your documents and choose a pickup window.
                    </Callout>
                  ) : resolved === "counter" ? (
                    <Callout tone="info">
                      <strong>Counter sent.</strong> You asked {dealer.name} for{" "}
                      {money(Number(counterAmount) || offer.amount)}. They have 24 hours to respond.
                    </Callout>
                  ) : resolved === "decline" ? (
                    <Callout tone="neutral">
                      <strong>Offer declined.</strong> {dealer.name} has been notified. Your other
                      offers are unaffected.
                    </Callout>
                  ) : (
                    <Callout tone="neutral" icon={<IconAlert size={17} />}>
                      This offer is no longer live — its current status is{" "}
                      <strong>{offer.status}</strong>.
                    </Callout>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* --------------------------------------------- other offers */}
          {competing.length > 0 && (
            <Card>
              <CardHeader
                title="Your other offers"
                subtitle="For comparison — each one is independent"
                action={
                  <Link
                    href="/seller/offers"
                    className="text-[13px] font-semibold text-ink-700 hover:text-lime-600 transition-colors"
                  >
                    View all
                  </Link>
                }
              />
              <ul className="divide-y divide-line">
                {competing.map((o) => {
                  const d = dealerById(o.dealerId)!;
                  return (
                    <li key={o.id}>
                      <Link
                        href={`/seller/offers/${o.id}`}
                        className="flex items-center gap-3 py-3 group"
                      >
                        <DealerMark initials={d.markInitials} color={d.markColor} size={34} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-medium text-heading truncate group-hover:text-lime-600 transition-colors">
                            {d.name}
                          </span>
                          <Time iso={o.createdAt} className="block text-[12px] text-muted" />
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block font-display font-bold text-[16px] text-heading tabular-nums">
                            {money(o.amount)}
                          </span>
                          <span className="block mt-1"><StatusBadge status={o.status} /></span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </div>

        {/* ----------------------------------------------------- side rail */}
        <div className="space-y-5">
          <Card>
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mint-50 text-ink-800">
                <IconClock size={20} />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-muted">Offer Expires In</p>
                <Time
                  iso={offer.expiresAt}
                  format="countdown"
                  className="mt-0.5 block font-display font-extrabold text-[21px] text-heading leading-tight"
                />
                <Time iso={offer.expiresAt} className="block text-[12.5px] text-muted mt-0.5" suffix=" CT" />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Next Steps" />
            <Timeline
              steps={[
                { label: "Review the offer", description: "Compare it against your other offers and your estimate.", completedAt: new Date().toISOString() },
                { label: "Accept, counter, or decline", description: "Every option is available until the offer expires.", completedAt: null, active: true },
                { label: "We coordinate the rest", description: "If accepted, we help arrange free pickup and payment.", completedAt: null },
              ]}
            />
          </Card>

          <Card>
            <CardHeader title="About this dealer" />
            <dl className="space-y-2.5 text-[13.5px]">
              {[
                ["Rating", <span key="r" className="inline-flex items-center gap-1"><IconStar size={13} fill="currentColor" strokeWidth={1} className="text-warn" />{dealer.rating.toFixed(1)}</span>],
                ["Purchases", `${dealer.purchases} vehicles`],
                ["Dealer #", dealer.dealerNumber],
                ["Location", `${dealer.city}, ${dealer.state}`],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between gap-3">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-heading font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="!bg-mint-50 !ring-lime-200">
            <div className="flex gap-2.5">
              <IconShieldCheck size={19} className="shrink-0 mt-0.5 text-lime-600" />
              <p className="text-[12.5px] leading-relaxed text-body">
                <strong className="text-heading">You&apos;re in control.</strong> We only share your
                information with verified, trusted dealers.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* ------------------------------------------------------- dialogs */}
      <Modal
        open={action === "accept"}
        onClose={() => setAction(null)}
        title={`Accept ${money(offer.amount)} from ${dealer.name}?`}
        description="This ends bidding on your vehicle and starts the payout process."
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
            <Button variant="success" onClick={confirm}>Yes, accept this offer</Button>
          </div>
        }
      >
        <ul className="space-y-3">
          {[
            "Your other offers are declined automatically.",
            "The dealer confirms the vehicle matches your listing.",
            "You choose a free pickup window that works for you.",
            `${money(offer.amount)} is released once the car is collected — usually the same day.`,
          ].map((t) => (
            <li key={t} className="flex gap-2.5 text-[14px] text-body">
              <IconCheck size={16} className="mt-0.5 shrink-0 text-success" strokeWidth={3} />
              {t}
            </li>
          ))}
        </ul>
      </Modal>

      <Modal
        open={action === "counter"}
        onClose={() => setAction(null)}
        title="Counter this offer"
        description={`${dealer.name} offered ${money(offer.amount)}. Suggest the number you'd accept.`}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
            <Button variant="info" onClick={confirm} disabled={!counterAmount}>
              Send counter
            </Button>
          </div>
        }
      >
        <Input
          label="Your counter"
          prefix="$"
          inputMode="numeric"
          value={counterAmount}
          onChange={(e) => setCounterAmount(e.target.value.replace(/[^\d]/g, ""))}
          hint={`estimate ${money(vehicle.estimateLow)} – ${money(vehicle.estimateHigh)}`}
        />
        <Textarea
          className="mt-4"
          label="Message to the dealer"
          hint="optional"
          placeholder="I have a higher offer already — can you get to this number?"
        />
        <p className="mt-4 text-[12.5px] text-muted">
          Counters are a single round. The dealer can accept, come back once, or let their original
          offer stand.
        </p>
      </Modal>

      <Modal
        open={action === "decline"}
        onClose={() => setAction(null)}
        title="Decline this offer?"
        description={`${dealer.name} will be notified. Your other offers aren't affected.`}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setAction(null)}>Keep it open</Button>
            <Button variant="danger" onClick={confirm}>Decline offer</Button>
          </div>
        }
      >
        <p className="text-[14px] text-body">
          Declining is free and permanent for this offer. If you decline everything, your listing
          rolls into next week&apos;s event automatically — also free.
        </p>
      </Modal>
    </div>
  );
}
