"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DealerMark } from "@/components/brand/DealerMark";
import { LogoMark } from "@/components/brand/Logo";
import { ScriptMark } from "@/components/brand/ScriptMark";
import { Callout, Timeline } from "@/components/ui/Misc";
import {
  IconArrowLeft,
  IconCheck,
  IconClock,
  IconMail,
  IconMapPin,
  IconPencil,
  IconPhone,
  IconSearch,
  IconShieldCheck,
  IconVin,
  IconX,
} from "@/components/icons";
import { dealerById } from "@/lib/data/people";
import { messagesForThread, offerById, threads } from "@/lib/data/marketplace";
import { vehicleById } from "@/lib/data/vehicles";
import { cx, miles, money, vehicleTitle } from "@/lib/format";
import { marketingImages } from "@/lib/images";
import { Time } from "@/components/ui/Time";

export default function SellerMessagesPage() {
  const [activeId, setActiveId] = useState(threads[0].id);
  const [query, setQuery] = useState("");
  const [showListMobile, setShowListMobile] = useState(true);

  const visible = threads.filter((t) =>
    (t.participantName + " " + t.subject).toLowerCase().includes(query.toLowerCase()),
  );
  const thread = threads.find((t) => t.id === activeId)!;
  const msgs = messagesForThread(activeId);
  const offerMsg = msgs.find((m) => m.attachedOfferId);
  const offer = offerMsg?.attachedOfferId ? offerById(offerMsg.attachedOfferId) : null;

  return (
    <div>
      {/* ---------------------------------------------------------- band */}
      <div className="relative overflow-hidden">
        <Image
          src={marketingImages.sunsetDrive}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[70%_40%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/92 to-surface/60 sm:bg-gradient-to-r sm:from-surface sm:via-surface/95 sm:to-surface/10" />
        <div className="relative flex items-end justify-between gap-6 p-5 sm:p-7">
          <div>
            <h1 className="text-[30px] sm:text-[38px] leading-tight">Messages</h1>
            <p className="mt-1 text-[15px] text-body">
              Stay up to date on offers, activity, and next steps.
            </p>
          </div>
          <ScriptMark
            lines={["More", "Money.", "Less Hassle.", "Way More."]}
            tone="dark"
            size="sm"
            className="hidden lg:block shrink-0"
          />
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 pt-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)_300px] items-start">
          {/* ------------------------------------------------ thread list */}
          <Card className={cx("!p-0 overflow-hidden", !showListMobile && "hidden lg:block")}>
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

            <ul className="divide-y divide-line max-h-[540px] overflow-y-auto scrollbar-slim">
              {visible.map((t) => {
                const dealer = t.dealerId ? dealerById(t.dealerId) : null;
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
                      {dealer ? (
                        <DealerMark initials={dealer.markInitials} color={dealer.markColor} size={40} rounded="full" />
                      ) : (
                        <LogoMark size={40} />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className={cx("truncate text-[14px]", on ? "font-bold text-heading" : "font-semibold text-heading")}>
                            {t.participantName}
                          </span>
                          <Time
                            iso={t.lastMessageAt}
                            format="relative"
                            className="shrink-0 text-[11.5px] text-muted"
                          />
                        </span>
                        <span className="mt-0.5 flex items-start justify-between gap-2">
                          <span className="text-[12.5px] text-body line-clamp-2">{t.subject}</span>
                          {t.flag && (
                            <span
                              className={cx(
                                "mt-1 size-2 shrink-0 rounded-full",
                                t.flag === "new" ? "bg-danger" : "bg-success",
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

          {/* ---------------------------------------------------- thread */}
          <div className={cx("space-y-5 min-w-0", showListMobile && "hidden lg:block")}>
            <button
              onClick={() => setShowListMobile(true)}
              className="lg:hidden inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-body hover:text-heading"
            >
              <IconArrowLeft size={16} />
              Back to Messages
            </button>

            <Card className="!p-0 overflow-hidden">
              <div className="flex items-center gap-3 border-b border-line p-5">
                {thread.dealerId ? (
                  <DealerMark
                    initials={dealerById(thread.dealerId)!.markInitials}
                    color={dealerById(thread.dealerId)!.markColor}
                    size={44}
                  />
                ) : (
                  <LogoMark size={44} />
                )}
                <div className="min-w-0">
                  <p className="text-[15.5px] font-bold text-heading truncate">{thread.participantName}</p>
                  <p className="text-[12.5px] text-muted truncate">
                    Re: {vehicleTitle(vehicleById(thread.vehicleId)!)}
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {msgs.map((m) => (
                  <div
                    key={m.id}
                    className={cx(
                      "max-w-[92%]",
                      m.authorType === "seller" ? "ml-auto" : "",
                    )}
                  >
                    <div
                      className={cx(
                        "rounded-2xl px-4 py-3",
                        m.authorType === "seller"
                          ? "bg-ink-900 text-white rounded-br-md"
                          : "bg-paper ring-1 ring-line rounded-bl-md",
                      )}
                    >
                      <p
                        className={cx(
                          "text-[11.5px] font-semibold mb-1",
                          m.authorType === "seller" ? "text-white/55" : "text-muted",
                        )}
                      >
                        {m.authorName}
                      </p>
                      <p
                        className={cx(
                          "text-[14px] leading-relaxed",
                          m.authorType === "seller" ? "text-white/95" : "text-heading",
                        )}
                      >
                        {m.body}
                      </p>
                    </div>
                    <Time
                      iso={m.sentAt}
                      format="time"
                      className={cx(
                        "mt-1 block text-[11.5px] text-muted",
                        m.authorType === "seller" ? "text-right" : "",
                      )}
                    />
                  </div>
                ))}

                {/* rich offer card inside the thread */}
                {offer && (
                  <div className="rounded-2xl ring-1 ring-lime-200 bg-mint-50 overflow-hidden">
                    <div className="flex flex-col sm:flex-row gap-4 p-4">
                      <div className="relative w-full sm:w-[170px] shrink-0 aspect-[4/3] overflow-hidden rounded-lg">
                        <Image
                          src={vehicleById(offer.vehicleId)!.photos[0].url}
                          alt=""
                          fill
                          sizes="170px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[16.5px] leading-tight">
                          {vehicleTitle(vehicleById(offer.vehicleId)!)}
                        </h3>
                        <dl className="mt-2 space-y-1 text-[12.5px] text-body">
                          <div className="flex items-center gap-1.5">
                            <IconClock size={13} className="text-muted" />
                            Mileage: {miles(vehicleById(offer.vehicleId)!.mileage)}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <IconMapPin size={13} className="text-muted" />
                            {vehicleById(offer.vehicleId)!.city}, {vehicleById(offer.vehicleId)!.state}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <IconVin size={13} className="text-muted" />
                            {vehicleById(offer.vehicleId)!.vin}
                          </div>
                        </dl>
                      </div>
                    </div>

                    <div className="border-t border-lime-200 bg-white/60 px-4 py-4 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-700">
                          Dealer offer
                        </p>
                        <p className="mt-1 font-display font-extrabold text-[32px] leading-none tracking-tight text-heading tabular-nums">
                          {money(offer.amount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-[12.5px]">
                        <DealerMark
                          initials={dealerById(offer.dealerId)!.markInitials}
                          color={dealerById(offer.dealerId)!.markColor}
                          size={44}
                        />
                        <div className="space-y-0.5">
                          <p className="font-semibold text-heading">{dealerById(offer.dealerId)!.name}</p>
                          <p className="text-muted">{dealerById(offer.dealerId)!.city}, {dealerById(offer.dealerId)!.state}</p>
                          <p className="flex items-center gap-1.5 text-body"><IconPhone size={12} />{dealerById(offer.dealerId)!.phone}</p>
                          <p className="flex items-center gap-1.5 text-body"><IconMail size={12} />{dealerById(offer.dealerId)!.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-3 p-4 pt-0">
                      <Link
                        href={`/seller/offers/${offer.id}`}
                        className="flex items-center justify-center gap-2 rounded-xl bg-success px-3 py-3 text-white hover:brightness-110 transition-[filter]"
                      >
                        <IconCheck size={18} strokeWidth={3} />
                        <span className="text-left leading-tight">
                          <span className="block font-display font-bold text-[14px]">Accept Offer</span>
                          <span className="block text-[11px] text-white/80">Sell for {money(offer.amount)}</span>
                        </span>
                      </Link>
                      <Link
                        href={`/seller/offers/${offer.id}`}
                        className="flex items-center justify-center gap-2 rounded-xl bg-info px-3 py-3 text-white hover:brightness-110 transition-[filter]"
                      >
                        <IconPencil size={17} />
                        <span className="text-left leading-tight">
                          <span className="block font-display font-bold text-[14px]">Counter Offer</span>
                          <span className="block text-[11px] text-white/80">Suggest a price</span>
                        </span>
                      </Link>
                      <Link
                        href={`/seller/offers/${offer.id}`}
                        className="flex items-center justify-center gap-2 rounded-xl bg-danger px-3 py-3 text-white hover:brightness-110 transition-[filter]"
                      >
                        <IconX size={18} strokeWidth={3} />
                        <span className="text-left leading-tight">
                          <span className="block font-display font-bold text-[14px]">Decline Offer</span>
                          <span className="block text-[11px] text-white/80">Reject this bid</span>
                        </span>
                      </Link>
                    </div>

                    <div className="px-4 pb-4">
                      <Callout tone="info">
                        <strong>Need time?</strong> You can take your time to review and respond.
                        This offer will remain open for 48 hours.
                      </Callout>
                    </div>
                  </div>
                )}
              </div>

              {/* composer */}
              <div className="border-t border-line p-4 flex gap-3">
                <input
                  placeholder={`Reply to ${thread.participantName}…`}
                  aria-label="Message"
                  className="h-11 flex-1 rounded-xl bg-paper px-3.5 text-[14px] text-heading placeholder:text-muted ring-1 ring-inset ring-transparent focus:ring-ink-600 focus:outline-none"
                />
                <Button>Send</Button>
              </div>
            </Card>
          </div>

          {/* ------------------------------------------------- side rail */}
          <div className="hidden xl:block space-y-5">
            {offer && (
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
                      className="mt-0.5 block font-display font-extrabold text-[20px] text-heading leading-tight"
                    />
                    <Time iso={offer.expiresAt} className="block text-[12px] text-muted mt-0.5" suffix=" CT" />
                  </div>
                </div>
              </Card>
            )}

            <Card>
              <h3 className="text-[15.5px] mb-4">Next Steps</h3>
              <Timeline
                steps={[
                  { label: "Review the offer", description: "Compare against your other offers.", completedAt: new Date().toISOString() },
                  { label: "Accept, counter, or decline", description: "All three stay available until it expires.", completedAt: null, active: true },
                  { label: "We coordinate pickup", description: "If accepted, we help arrange pickup and payment.", completedAt: null },
                ]}
              />
            </Card>

            <Card>
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mint-50 text-ink-800">
                  <IconPhone size={19} />
                </span>
                <div>
                  <p className="text-[14.5px] font-semibold text-heading">Questions?</p>
                  <p className="text-[12.5px] text-muted mt-0.5">Our team is here to help.</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Button variant="dark" fullWidth size="sm">Chat with Us</Button>
                <a
                  href="tel:+13145550123"
                  className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-white text-[13px] font-display font-semibold text-ink-900 ring-1 ring-inset ring-line-strong hover:bg-paper transition-colors"
                >
                  Call 314-555-0123
                </a>
                <p className="text-center text-[12px] text-muted pt-1">Mon – Fri: 8am – 6pm CT</p>
              </div>
            </Card>

            <Card className="!bg-mint-50 !ring-lime-200">
              <div className="flex gap-2.5">
                <IconShieldCheck size={19} className="shrink-0 mt-0.5 text-lime-600" />
                <p className="text-[12.5px] leading-relaxed text-body">
                  <strong className="text-heading">You&apos;re in control.</strong> We only share
                  your information with verified, trusted dealers.
                </p>
              </div>
            </Card>

            <div className="px-1">
              <Badge tone="neutral">Dealers never see your phone number</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
