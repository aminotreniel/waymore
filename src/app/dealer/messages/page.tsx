"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Field";
import { Countdown } from "@/components/ui/Countdown";
import { Time } from "@/components/ui/Time";
import { Avatar } from "@/components/brand/DealerMark";
import { LogoMark } from "@/components/brand/Logo";
import { PortalHeader } from "@/components/portal/PortalShell";
import { Callout } from "@/components/ui/Misc";
import {
  IconArrowLeft,
  IconCheck,
  IconClock,
  IconGavel,
  IconLock,
  IconMapPin,
  IconPencil,
  IconSearch,
  IconVin,
  IconX,
} from "@/components/icons";
import { useSession } from "@/context/SessionContext";
import {
  bidById,
  dealerMessagesForThread,
  dealerThreads,
  highBidFor,
} from "@/lib/data/marketplace";
import { vehicleById } from "@/lib/data/vehicles";
import { CURRENT_EVENT_CLOSES_AT } from "@/lib/data/clock";
import { cx, miles, money, vehicleTitle } from "@/lib/format";

type Action = "accept" | "counter" | "decline" | null;

export default function DealerMessagesPage() {
  const { dealer } = useSession();
  const [activeId, setActiveId] = useState(dealerThreads[0].id);
  const [query, setQuery] = useState("");
  const [showListMobile, setShowListMobile] = useState(false);
  const [action, setAction] = useState<Action>(null);
  const [counterAmount, setCounterAmount] = useState("");
  const [resolved, setResolved] = useState<Record<string, Action>>({});

  const visible = dealerThreads.filter((t) =>
    `${t.participantName} ${t.subject}`.toLowerCase().includes(query.toLowerCase()),
  );
  const thread = dealerThreads.find((t) => t.id === activeId)!;
  const msgs = dealerMessagesForThread(activeId);
  const vehicle = vehicleById(thread.vehicleId)!;
  const counter = thread.pendingCounter;
  const outcome = resolved[thread.id] ?? null;

  const confirm = () => {
    setResolved((r) => ({ ...r, [thread.id]: action }));
    setAction(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1500px]">
      <PortalHeader
        title="Messages"
        lead="Negotiate directly with sellers, and keep every exchange on the vehicle it belongs to."
        action={
          <div className="flex items-center gap-4 rounded-2xl bg-surface ring-1 ring-line shadow-card px-5 py-3">
            <span className="text-[12.5px] font-semibold text-muted">Bidding ends in</span>
            <Countdown to={CURRENT_EVENT_CLOSES_AT} size="sm" />
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)_300px] items-start">
        {/* ----------------------------------------------------- thread list */}
        <Card className={cx("!p-0 overflow-hidden", showListMobile ? "" : "hidden lg:block")}>
          <div className="p-3.5 border-b border-line">
            <div className="relative">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages…"
                aria-label="Search messages"
                className="h-10 w-full rounded-xl bg-paper pl-9 pr-3 text-[13.5px] text-heading placeholder:text-muted ring-1 ring-inset ring-transparent focus:ring-ink-600 focus:outline-none"
              />
            </div>
          </div>

          <ul className="divide-y divide-line max-h-[560px] overflow-y-auto scrollbar-slim">
            {visible.map((t) => {
              const v = vehicleById(t.vehicleId)!;
              const on = t.id === activeId;
              return (
                <li key={t.id}>
                  <button
                    onClick={() => {
                      setActiveId(t.id);
                      setShowListMobile(false);
                    }}
                    className={cx(
                      "flex w-full items-start gap-3 p-3.5 text-left transition-colors",
                      on ? "bg-mint-50" : "hover:bg-paper",
                    )}
                  >
                    {t.participantType === "waymore" ? (
                      <LogoMark size={40} />
                    ) : (
                      <Avatar initials="S" size={40} tone="muted" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[14px] font-semibold text-heading">
                          {t.participantName}
                        </span>
                        <Time
                          iso={t.lastMessageAt}
                          format="relative"
                          className="shrink-0 text-[11.5px] text-muted"
                        />
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-muted">
                        {vehicleTitle(v)}
                      </span>
                      <span className="mt-0.5 flex items-start justify-between gap-2">
                        <span className="text-[12.5px] text-body line-clamp-2">{t.subject}</span>
                        {t.flag && (
                          <span
                            className={cx(
                              "mt-1 size-2 shrink-0 rounded-full",
                              t.flag === "new" ? "bg-danger" : "bg-info",
                            )}
                          />
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* --------------------------------------------------------- thread */}
        <div className={cx("space-y-5 min-w-0", showListMobile ? "hidden lg:block" : "")}>
          <button
            onClick={() => setShowListMobile(true)}
            className="lg:hidden inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-body hover:text-heading"
          >
            <IconArrowLeft size={16} />
            All messages
          </button>

          <Card className="!p-0 overflow-hidden">
            {/* thread header */}
            <div className="flex items-center gap-3 border-b border-line p-5">
              {thread.participantType === "waymore" ? (
                <LogoMark size={44} />
              ) : (
                <Avatar initials="S" size={44} tone="muted" />
              )}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[15.5px] font-bold text-heading">
                  {thread.participantName}
                  {thread.participantType === "seller" && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-paper px-2 py-0.5 text-[11px] font-semibold text-muted ring-1 ring-inset ring-line"
                      title="Seller contact details unlock once an offer is accepted"
                    >
                      <IconLock size={11} />
                      Private
                    </span>
                  )}
                </p>
                <Link
                  href={`/dealer/inventory/${vehicle.id}`}
                  className="text-[12.5px] text-muted hover:text-lime-600 transition-colors truncate block"
                >
                  {vehicleTitle(vehicle)} · Stock {vehicle.vin.slice(-4)}
                </Link>
              </div>
            </div>

            {/* messages */}
            <div className="p-5 space-y-4">
              {msgs.map((m) => {
                const mine = m.authorType === "dealer";
                const bid = m.attachedBidId ? bidById(m.attachedBidId) : null;

                return (
                  <div key={m.id} className={cx("max-w-[92%]", mine && "ml-auto")}>
                    {bid && (
                      <div className="mb-2 rounded-2xl ring-1 ring-lime-200 bg-mint-50 overflow-hidden">
                        <div className="flex items-center gap-3 p-4">
                          <span className="relative size-14 shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={vehicle.photos[0].url}
                              alt=""
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-700">
                              Your bid
                            </p>
                            <p className="mt-0.5 font-display font-extrabold text-[26px] leading-none tracking-tight text-heading tabular-nums">
                              {money(bid.amount)}
                            </p>
                            <p className="mt-1 text-[12px] text-body truncate">
                              {vehicleTitle(vehicle)} · {miles(vehicle.mileage)}
                            </p>
                          </div>
                          <Badge tone={bid.status === "winning" ? "success" : "neutral"}>
                            {bid.status}
                          </Badge>
                        </div>
                      </div>
                    )}

                    <div
                      className={cx(
                        "rounded-2xl px-4 py-3",
                        mine
                          ? "bg-ink-900 text-white rounded-br-md"
                          : "bg-paper ring-1 ring-line rounded-bl-md",
                      )}
                    >
                      <p
                        className={cx(
                          "text-[11.5px] font-semibold mb-1",
                          mine ? "text-white/55" : "text-muted",
                        )}
                      >
                        {m.authorName}
                      </p>
                      <p
                        className={cx(
                          "text-[14px] leading-relaxed",
                          mine ? "text-white/95" : "text-heading",
                        )}
                      >
                        {m.body}
                      </p>
                    </div>
                    <Time
                      iso={m.sentAt}
                      format="time"
                      className={cx("mt-1 block text-[11.5px] text-muted", mine && "text-right")}
                    />
                  </div>
                );
              })}

              {/* the live counter awaiting a response */}
              {counter && !outcome && (
                <div className="rounded-2xl ring-1 ring-line bg-surface overflow-hidden shadow-card">
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-paper/70 px-4 py-4 border-b border-line">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                        Seller counter
                      </p>
                      <p className="mt-1 font-display font-extrabold text-[32px] leading-none tracking-tight text-heading tabular-nums">
                        {money(counter.amount)}
                      </p>
                      <p className="mt-1.5 text-[12.5px] text-body">
                        {money(counter.amount - (highBidFor(vehicle.id)?.amount ?? 0))} above your
                        current bid of {money(highBidFor(vehicle.id)?.amount ?? 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted">
                        <IconClock size={13} />
                        Expires in
                      </p>
                      <Time
                        iso={counter.expiresAt}
                        format="countdown"
                        className="block font-display font-bold text-[17px] text-heading tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-3 p-4">
                    <button
                      onClick={() => setAction("accept")}
                      className="flex items-center justify-center gap-2 rounded-xl bg-success px-3 py-3 text-white hover:brightness-110 transition-[filter]"
                    >
                      <IconCheck size={18} strokeWidth={3} />
                      <span className="text-left leading-tight">
                        <span className="block font-display font-bold text-[14px]">Accept</span>
                        <span className="block text-[11px] text-white/80">
                          Buy at {money(counter.amount)}
                        </span>
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setCounterAmount(String(counter.amount - 200));
                        setAction("counter");
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl bg-info px-3 py-3 text-white hover:brightness-110 transition-[filter]"
                    >
                      <IconPencil size={17} />
                      <span className="text-left leading-tight">
                        <span className="block font-display font-bold text-[14px]">Counter</span>
                        <span className="block text-[11px] text-white/80">Come back once</span>
                      </span>
                    </button>
                    <button
                      onClick={() => setAction("decline")}
                      className="flex items-center justify-center gap-2 rounded-xl bg-danger px-3 py-3 text-white hover:brightness-110 transition-[filter]"
                    >
                      <IconX size={18} strokeWidth={3} />
                      <span className="text-left leading-tight">
                        <span className="block font-display font-bold text-[14px]">Decline</span>
                        <span className="block text-[11px] text-white/80">Hold my bid</span>
                      </span>
                    </button>
                  </div>

                  <div className="px-4 pb-4">
                    <Callout tone="neutral">
                      Counters are a single round. If you decline, your original bid of{" "}
                      {money(highBidFor(vehicle.id)?.amount ?? 0)} stands until the event closes.
                    </Callout>
                  </div>
                </div>
              )}

              {outcome && (
                <Callout tone={outcome === "accept" ? "success" : outcome === "counter" ? "info" : "neutral"}>
                  {outcome === "accept" && (
                    <>
                      <strong>Counter accepted.</strong> You&apos;ve agreed {money(counter!.amount)}{" "}
                      for the {vehicleTitle(vehicle)}. It will appear in Purchases once the seller
                      confirms.
                    </>
                  )}
                  {outcome === "counter" && (
                    <>
                      <strong>Counter sent.</strong> You offered{" "}
                      {money(Number(counterAmount) || 0)}. The seller has 24 hours to respond.
                    </>
                  )}
                  {outcome === "decline" && (
                    <>
                      <strong>Counter declined.</strong> Your original bid of{" "}
                      {money(highBidFor(vehicle.id)?.amount ?? 0)} still stands.
                    </>
                  )}
                </Callout>
              )}
            </div>

            {/* composer */}
            <div className="border-t border-line p-4 flex gap-3">
              <input
                placeholder="Write a reply…"
                aria-label="Message"
                className="h-11 flex-1 rounded-xl bg-paper px-3.5 text-[14px] text-heading placeholder:text-muted ring-1 ring-inset ring-transparent focus:ring-ink-600 focus:outline-none"
              />
              <Button>Send</Button>
            </div>
          </Card>
        </div>

        {/* ------------------------------------------------------ side rail */}
        <div className="hidden xl:block space-y-5">
          <Card className="!p-0 overflow-hidden">
            <Link href={`/dealer/inventory/${vehicle.id}`} className="block relative aspect-[16/10]">
              <Image
                src={vehicle.photos[0].url}
                alt={vehicleTitle(vehicle)}
                fill
                sizes="300px"
                className="object-cover"
              />
            </Link>
            <div className="p-4">
              <h3 className="text-[15.5px] leading-tight">{vehicleTitle(vehicle)}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted">
                <IconMapPin size={13} />
                {vehicle.city}, {vehicle.state}
              </p>
              <dl className="mt-3.5 space-y-2 border-t border-line pt-3.5 text-[13px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Mileage</dt>
                  <dd className="text-heading font-medium">{miles(vehicle.mileage)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Your bid</dt>
                  <dd className="text-heading font-medium tabular-nums">
                    {money(highBidFor(vehicle.id)?.amount ?? 0)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Seller estimate</dt>
                  <dd className="text-heading font-medium tabular-nums">
                    {money(vehicle.estimateLow)}–{money(vehicle.estimateHigh)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="flex items-center gap-1.5 text-muted">
                    <IconVin size={13} /> VIN
                  </dt>
                  <dd className="text-heading font-medium font-mono text-[11.5px]">
                    {vehicle.vin.slice(-8)}
                  </dd>
                </div>
              </dl>
              <div className="mt-4">
                <Link href={`/dealer/inventory/${vehicle.id}`}>
                  <Button variant="outline" size="sm" fullWidth>
                    <IconGavel size={15} />
                    View listing
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <Card className="!bg-mint-50 !ring-lime-200">
            <div className="flex gap-2.5">
              <IconLock size={18} className="shrink-0 mt-0.5 text-lime-600" />
              <p className="text-[12.5px] leading-relaxed text-body">
                <strong className="text-heading">Sellers stay anonymous.</strong> You&apos;re
                messaging through {dealer.name}&apos;s account. Names, phone numbers and addresses
                are released only after an offer is accepted.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* --------------------------------------------------------- dialogs */}
      {counter && (
        <>
          <Modal
            open={action === "accept"}
            onClose={() => setAction(null)}
            title={`Accept ${money(counter.amount)} for the ${vehicleTitle(vehicle)}?`}
            description="This commits you to the purchase at that price."
            footer={
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
                <Button variant="success" onClick={confirm}>Accept counter</Button>
              </div>
            }
          >
            <ul className="space-y-3">
              {[
                `You buy the vehicle at ${money(counter.amount)}.`,
                "The seller's contact details are released to you immediately.",
                "You arrange free pickup directly with the seller.",
                "Way More invoices weekly on net 3 terms.",
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
            title="Counter the seller"
            description={`They asked for ${money(counter.amount)}. You can come back once.`}
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
              hint={`their ask ${money(counter.amount)}`}
            />
            <Textarea
              className="mt-4"
              label="Message to the seller"
              hint="optional"
              placeholder="This is where I need to be to make the numbers work…"
            />
          </Modal>

          <Modal
            open={action === "decline"}
            onClose={() => setAction(null)}
            title="Decline this counter?"
            description="Your original bid stays live until the event closes."
            footer={
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setAction(null)}>Keep negotiating</Button>
                <Button variant="danger" onClick={confirm}>Decline counter</Button>
              </div>
            }
          >
            <p className="text-[14px] text-body">
              The seller is notified and can accept your standing bid of{" "}
              {money(highBidFor(vehicle.id)?.amount ?? 0)}, counter again next event, or take
              another dealer&apos;s offer.
            </p>
          </Modal>
        </>
      )}
    </div>
  );
}
