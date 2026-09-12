import { Fragment } from "react";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/Card";
import { ScriptMark, Way } from "@/components/brand/ScriptMark";
import {
  CTABand,
  STEPS,
  StepArrow,
  Testimonials,
  TrustBar,
  TRUST_ITEMS,
} from "@/components/marketing/Sections";
import {
  IconCar,
  IconClock,
  IconDocument,
  IconDollarCircle,
  IconHandshake,
  IconShieldCheck,
  IconUsers,
} from "@/components/icons";
import { marketingImages } from "@/lib/images";

const STEP_ICONS = [
  <IconDocument key="1" size={44} strokeWidth={1.4} />,
  <IconUsers key="2" size={44} strokeWidth={1.4} />,
  <IconDollarCircle key="3" size={44} strokeWidth={1.4} />,
  <IconCar key="4" size={44} strokeWidth={1.4} />,
];

export default function HomePage() {
  return (
    <>
      {/* ============================================================ hero */}
      <section className="relative overflow-hidden bg-ink-950 isolate">
        <Image
          src={marketingImages.hero}
          alt="A car on an open road at sunset"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/92 to-ink-950/25 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent lg:hidden" />

        <div className="container-page relative py-16 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_auto] gap-10 items-center">
            <div className="max-w-[660px]">
              <h1 className="text-white text-[42px] sm:text-[58px] lg:text-[64px] leading-[1.02]">
                Get <Way /> more
                <br />
                for your car.
              </h1>

              <p className="mt-6 text-[17px] leading-relaxed text-white/80 max-w-lg">
                Way More connects you directly with{" "}
                <strong className="text-white font-semibold">trusted local dealers</strong> who
                compete to buy your car. More offers. More money. Way less hassle.
              </p>
              <p className="mt-3.5 text-[16px] text-white/65">
                Real dealers. Real competition. A better way to sell.
              </p>

              <div className="mt-8">
                <ButtonLink href="/sell" size="lg" withArrow>
                  Get My Offer
                </ButtonLink>
                <p className="mt-3.5 text-[13.5px] text-white/55">
                  It&apos;s free. Takes just a few minutes.
                </p>
              </div>

              <div className="mt-11 pt-8 border-t border-white/10">
                <TrustBar tone="light" items={TRUST_ITEMS.slice(0, 3)} compact />
              </div>
            </div>

            <ScriptMark
              lines={["More", "Money.", "More Freedom.", "Way More."]}
              size="lg"
              align="right"
              className="hidden lg:block shrink-0 self-end mb-6"
            />
          </div>
        </div>
      </section>

      {/* =================================================== how it works */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="container-page">
          <SectionTitle
            title="How Way More Works"
            lead={
              <>
                Selling your car should be simple. We make it{" "}
                <strong className="text-heading font-semibold">Way More</strong> simple.
              </>
            }
          />

          <ol className="mt-12 flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap items-stretch gap-9 sm:gap-6 lg:gap-0">
            {STEPS.map((step, i) => (
              <Fragment key={step.n}>
                <li className="flex-1 min-w-[220px] text-center lg:px-4">
                  <div className="flex justify-center text-ink-900">{STEP_ICONS[i]}</div>
                  <div className="mt-4 flex justify-center">
                    <span className="grid size-7 place-items-center rounded-full bg-lime-400 text-ink-950 text-[13px] font-display font-bold">
                      {step.n}
                    </span>
                  </div>
                  <h3 className="mt-3.5 text-[16.5px]">{step.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-body max-w-[15.5rem] mx-auto">
                    {step.body}
                  </p>
                </li>
                {i < STEPS.length - 1 && (
                  <li className="hidden lg:flex items-start pt-[18px] shrink-0" aria-hidden="true">
                    <StepArrow />
                  </li>
                )}
              </Fragment>
            ))}
          </ol>
        </div>
      </section>

      {/* ================================================== save time band */}
      <section className="relative overflow-hidden bg-ink-950">
        <Image
          src={marketingImages.sunsetDrive}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[65%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/88 to-ink-950/30" />

        <div className="container-page relative py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="max-w-lg">
              <h2 className="text-white text-[32px] sm:text-[42px] leading-[1.08]">
                Save <Way /> more
                <br />
                time selling your car.
              </h2>
              <p className="mt-5 text-[16px] leading-relaxed text-white/75">
                Skip the tire kickers, lowball offers, and endless haggling. With Way More, you get
                top offers from dealers who are ready to buy — fast.
              </p>
              <div className="mt-8">
                <ButtonLink href="/sell" withArrow className="!rounded-full !h-12 !px-6">
                  Get My Offer
                </ButtonLink>
              </div>
            </div>

            <div className="lg:justify-self-end w-full max-w-sm rounded-2xl bg-ink-950/55 backdrop-blur-md ring-1 ring-white/12 p-6 space-y-5">
              {[
                { icon: <IconClock size={26} />, title: "Sell in Days", sub: "Not Weeks" },
                { icon: <IconHandshake size={26} />, title: "No Strangers", sub: "at Your House" },
                { icon: <IconShieldCheck size={26} />, title: "Safe, Secure", sub: "and Professional" },
              ].map((f) => (
                <div key={f.title} className="flex items-center gap-3.5">
                  <span className="shrink-0 text-white">{f.icon}</span>
                  <span className="leading-tight">
                    <span className="block text-[15px] font-semibold text-white">{f.title}</span>
                    <span className="block text-[15px] text-white/65">{f.sub}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== testimonials */}
      <Testimonials
        lead={
          <>
            Thousands of people are getting <strong className="text-heading font-semibold">WAY</strong>{" "}
            more for their cars.
          </>
        }
      />

      <CTABand />
    </>
  );
}
