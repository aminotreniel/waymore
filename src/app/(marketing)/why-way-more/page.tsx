import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { CTABand, PageHero, Testimonials } from "@/components/marketing/Sections";
import {
  IconCheck,
  IconClock,
  IconDollarCircle,
  IconGavel,
  IconLock,
  IconShieldCheck,
  IconUsers,
  IconX,
} from "@/components/icons";
import { marketingImages } from "@/lib/images";

export const metadata: Metadata = {
  title: "Why Way More",
  description:
    "Trade-in, private sale, or instant-offer site? See how Way More's dealer competition gets you a better number with less hassle.",
};

const REASONS = [
  {
    icon: <IconGavel size={26} />,
    title: "Competition, not a single number",
    body: "Instant-offer sites give you one take-it-or-leave-it price. Way More puts your car in front of every dealer in your market at once and lets them bid against each other. The number you see is the best of many, not the only one.",
  },
  {
    icon: <IconDollarCircle size={26} />,
    title: "Free for sellers, always",
    body: "No listing fee, no commission, nothing deducted at closing. The price a dealer offers is the amount that reaches your account. Dealers pay to take part in our events — you never do.",
  },
  {
    icon: <IconLock size={26} />,
    title: "Your details stay private",
    body: "Dealers see your vehicle, not your phone number. Every message runs through your Way More inbox, and contact ends when your listing does. No cold calls, no inbox full of follow-ups.",
  },
  {
    icon: <IconClock size={26} />,
    title: "Days, not weekends",
    body: "A private sale means listings, tyre kickers and strangers at your door. Way More runs on a weekly schedule — list by Tuesday, have real offers Wednesday evening, and be paid by the weekend.",
  },
  {
    icon: <IconShieldCheck size={26} />,
    title: "Verified dealers only",
    body: "Every dealer is checked against their state licence and bond before their first bid, and we track post-sale behaviour. Dealers who try to renegotiate at pickup lose access.",
  },
  {
    icon: <IconUsers size={26} />,
    title: "You stay in control",
    body: "Accept, counter, or walk away — every offer is no-obligation. If nothing works this week, relist next week for free. Nothing happens to your car until you say so.",
  },
];

const COMPARISON = [
  { feature: "Multiple dealers compete for your car", waymore: true, tradein: false, instant: false, private: false },
  { feature: "No fees taken from your sale", waymore: true, tradein: true, instant: true, private: false },
  { feature: "No strangers at your home", waymore: true, tradein: true, instant: true, private: false },
  { feature: "Your contact details stay private", waymore: true, tradein: false, instant: false, private: false },
  { feature: "Free pickup from your driveway", waymore: true, tradein: false, instant: false, private: false },
  { feature: "Offer is firm, not revised on inspection", waymore: true, tradein: false, instant: false, private: false },
  { feature: "Done in under a week", waymore: true, tradein: true, instant: true, private: false },
];

const COLUMNS = [
  { key: "waymore" as const, label: "Way More", highlight: true },
  { key: "tradein" as const, label: "Dealer trade-in", highlight: false },
  { key: "instant" as const, label: "Instant-offer site", highlight: false },
  { key: "private" as const, label: "Private sale", highlight: false },
];

export default function WhyWayMorePage() {
  return (
    <>
      <PageHero
        eyebrow="Why Way More"
        title={
          <>
            One car.
            <br />
            Every local dealer.
          </>
        }
        lead="Most ways of selling a car ask you to accept one number from one buyer. We think your car deserves an auction — so we built one that runs every week, in your own market."
        image={marketingImages.highway}
        imagePosition="60% center"
        scriptLines={["More", "Money.", "Less Hassle.", "Way More."]}
      />

      {/* ======================================================== reasons */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="container-page">
          <SectionTitle
            eyebrow="The difference"
            title="Six reasons sellers choose us"
            lead="Everything below is a direct consequence of one design decision: dealers bid against each other instead of quoting you in isolation."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {REASONS.map((r) => (
              <Card key={r.title} className="flex flex-col">
                <span className="grid size-11 place-items-center rounded-xl bg-mint-50 text-ink-800 ring-1 ring-lime-200">
                  {r.icon}
                </span>
                <h3 className="mt-4 text-[16.5px] leading-snug">{r.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-body">{r.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================== comparison */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="container-page">
          <SectionTitle
            title="How the options actually compare"
            lead="The honest version — including the places where a trade-in or an instant offer is perfectly fine."
          />

          <div className="mt-11 overflow-x-auto scrollbar-slim -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[720px] border-separate border-spacing-0">
              <caption className="sr-only">
                Comparison of Way More against dealer trade-in, instant-offer sites and private sale
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="text-left align-bottom pb-4 pr-4 w-[38%]">
                    <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-muted">
                      What you get
                    </span>
                  </th>
                  {COLUMNS.map((c) => (
                    <th
                      key={c.key}
                      scope="col"
                      className={`pb-4 px-3 text-center text-[14px] font-display font-bold ${
                        c.highlight ? "text-heading" : "text-body"
                      }`}
                    >
                      {c.highlight ? (
                        <span className="inline-block rounded-full bg-lime-400 px-3.5 py-1.5 text-ink-950">
                          {c.label}
                        </span>
                      ) : (
                        c.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-surface">
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature}>
                    <th
                      scope="row"
                      className={`text-left py-3.5 pl-5 pr-4 text-[14px] font-medium text-heading ring-1 ring-line ${
                        i === 0 ? "rounded-tl-2xl" : ""
                      } ${i === COMPARISON.length - 1 ? "rounded-bl-2xl" : ""}`}
                    >
                      {row.feature}
                    </th>
                    {COLUMNS.map((c, ci) => (
                      <td
                        key={c.key}
                        className={`py-3.5 px-3 text-center ring-1 ring-line ${
                          c.highlight ? "bg-mint-50" : ""
                        } ${i === 0 && ci === COLUMNS.length - 1 ? "rounded-tr-2xl" : ""} ${
                          i === COMPARISON.length - 1 && ci === COLUMNS.length - 1
                            ? "rounded-br-2xl"
                            : ""
                        }`}
                      >
                        {row[c.key] ? (
                          <span className="inline-grid size-6 place-items-center rounded-full bg-success-bg text-success">
                            <IconCheck size={14} strokeWidth={3} />
                            <span className="sr-only">Yes</span>
                          </span>
                        ) : (
                          <span className="inline-grid size-6 place-items-center rounded-full bg-paper text-muted/60">
                            <IconX size={13} strokeWidth={2.5} />
                            <span className="sr-only">No</span>
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-[13px] text-muted max-w-2xl">
            A trade-in still makes sense when you&apos;re buying from the same dealer the same day and
            want the tax credit. We&apos;d rather tell you that than pretend otherwise.
          </p>
        </div>
      </section>

      {/* ========================================================== proof */}
      <section className="relative overflow-hidden bg-ink-950">
        <Image src={marketingImages.dealerLot} alt="" fill sizes="100vw" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-950/50" />
        <div className="container-page relative py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="max-w-lg">
              <h2 className="text-white text-[30px] sm:text-[38px] leading-[1.1]">
                34 dealers. One event. Every Wednesday.
              </h2>
              <p className="mt-5 text-[16px] leading-relaxed text-white/75">
                Instead of trickling listings out one at a time, Way More collects the week&apos;s
                cars and opens them to every verified dealer in the region at once. Concentrated
                supply means dealers show up ready to buy — and bid like it.
              </p>
              <div className="mt-8">
                <ButtonLink href="/sell" size="lg" withArrow>
                  Get My Offer
                </ButtonLink>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-4 lg:justify-self-end lg:w-full lg:max-w-md">
              {[
                { v: "34", l: "Verified dealers bidding" },
                { v: "4.2", l: "Average offers per car" },
                { v: "18 hrs", l: "Median time to first offer" },
                { v: "$0", l: "Cost to the seller" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-white/8 ring-1 ring-white/12 backdrop-blur-sm p-5">
                  <dt className="sr-only">{s.l}</dt>
                  <dd>
                    <span className="block font-display font-extrabold text-[30px] text-white leading-none tracking-tight">
                      {s.v}
                    </span>
                    <span className="mt-2 block text-[13px] text-white/60 leading-snug">{s.l}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <Testimonials heading="Sellers who tried the other way first" />
      <CTABand />
    </>
  );
}
