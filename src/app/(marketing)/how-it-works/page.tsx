import type { Metadata } from "next";
import Image from "next/image";
import { Fragment } from "react";
import { Accordion } from "@/components/ui/Disclosure";
import { ButtonLink } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/Card";
import {
  CTABand,
  PageHero,
  STEPS,
  StepArrow,
  Stars,
  TrustBar,
} from "@/components/marketing/Sections";
import { STEP_VISUALS } from "@/components/marketing/StepVisuals";
import { HOME_FAQS } from "@/lib/data/faqs";
import { marketingImages, vehicleImages } from "@/lib/images";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Four easy steps. Real dealers. Real competition. See exactly how selling your car through Way More works.",
};

const RESULTS = [
  { quote: "Got $4,200 more than I expected! Super easy.", name: "Tyler M.", location: "St. Louis, MO", image: vehicleImages.crv },
  { quote: "I had offers within hours and sold the same day. Way more is the real deal.", name: "Amanda R.", location: "O'Fallon, MO", image: vehicleImages.ram1500 },
  { quote: "No hassle, no pressure. Just a better way to sell your car.", name: "Kevin S.", location: "Chesterfield, MO", image: vehicleImages.altima },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title={
          <>
            A simple way
            <br />
            to sell your car.
          </>
        }
        lead={
          <>
            Four easy steps. Real dealers. Real competition.
            <br className="hidden sm:block" /> Get WAY more — without the hassle.
          </>
        }
        image={marketingImages.sideMirror}
        imagePosition="70% center"
        scriptLines={["More", "Money.", "Less Hassle.", "Way More."]}
      />

      {/* ====================================================== four steps */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="container-page">
          <SectionTitle
            title="Selling your car should be this easy."
            lead="From your driveway to top dealer offers, we handle the rest."
          />

          <ol className="mt-12 flex flex-col lg:flex-row items-stretch gap-10 lg:gap-0">
            {STEPS.map((step, i) => {
              const Visual = STEP_VISUALS[i];
              return (
                <Fragment key={step.n}>
                  <li className="flex-1 min-w-0 lg:px-3.5">
                    <div className="relative">
                      <span className="absolute -top-3 -left-3 z-10 grid size-9 place-items-center rounded-full bg-lime-400 text-ink-950 text-[15px] font-display font-extrabold shadow-card">
                        {step.n}
                      </span>
                      <Visual />
                    </div>
                    <h3 className="mt-5 text-[16.5px] leading-snug">{step.title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-body">{step.longBody}</p>
                  </li>
                  {i < STEPS.length - 1 && (
                    <li className="hidden lg:flex items-center shrink-0" aria-hidden="true">
                      <StepArrow />
                    </li>
                  )}
                </Fragment>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ==================================================== trust ribbon */}
      <section className="bg-mint-50 border-y border-lime-200/60 py-9">
        <div className="container-page">
          <TrustBar />
        </div>
      </section>

      {/* ======================================================== results */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="container-page grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] gap-10 lg:gap-14 items-start">
          <div>
            <h2 className="text-[32px] sm:text-[38px] leading-[1.08]">
              Real people.
              <br />
              Real results.
            </h2>
            <div className="mt-4 h-[3px] w-16 rounded-full bg-lime-400" />
            <p className="mt-5 text-[15.5px] leading-relaxed text-body">
              Thousands of everyday drivers are getting WAY more for their cars.
            </p>
            <div className="mt-7">
              <ButtonLink href="/sell" withArrow className="!rounded-full !h-12 !px-6">
                Get My Offer
              </ButtonLink>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {RESULTS.map((r) => (
              <figure
                key={r.name}
                className="rounded-2xl bg-surface ring-1 ring-line shadow-card overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={r.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 30vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <blockquote className="text-[14px] leading-relaxed text-heading flex-1">
                    “{r.quote}”
                  </blockquote>
                  <figcaption className="mt-3.5 flex items-end justify-between gap-2">
                    <span>
                      <span className="block text-[13.5px] font-semibold text-heading">
                        — {r.name}
                      </span>
                      <span className="block text-[12.5px] text-muted">{r.location}</span>
                    </span>
                    <Stars />
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================== questions */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="container-page grid lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] gap-10 lg:gap-14 items-start">
          <div>
            <h2 className="text-[30px] sm:text-[36px] leading-[1.08]">
              Common
              <br />
              Questions
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-body">
              Quick answers to help you feel confident.
            </p>
            <div className="mt-6">
              <ButtonLink href="/faqs" variant="outline" size="sm" withArrow>
                See all FAQs
              </ButtonLink>
            </div>
          </div>
          <Accordion items={HOME_FAQS.map((f) => ({ q: f.q, a: f.a }))} />
        </div>
      </section>

      <CTABand sub="It's fast. It's easy. It just makes sense." />
    </>
  );
}
