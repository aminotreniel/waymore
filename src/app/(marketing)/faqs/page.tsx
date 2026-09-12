import type { Metadata } from "next";
import { Accordion } from "@/components/ui/Disclosure";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CTABand, PageHero } from "@/components/marketing/Sections";
import { IconChat, IconHeadset, IconPhone } from "@/components/icons";
import { FAQS, FAQ_CATEGORIES } from "@/lib/data/faqs";
import { marketingImages } from "@/lib/images";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Fees, offers, dealers, payment and pickup — straight answers to the questions sellers ask most.",
};

export default function FaqsPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQs"
        title="Questions, answered."
        lead="No fine print and no runaround. If something isn't covered here, our team in St. Louis will pick up the phone."
        image={marketingImages.sunsetDrive}
        imagePosition="70% center"
      />

      <section className="bg-surface py-14 sm:py-18">
        <div className="container-page grid lg:grid-cols-[minmax(0,1fr)_300px] gap-10 lg:gap-14 items-start">
          <div className="space-y-12">
            {FAQ_CATEGORIES.map((cat) => {
              const items = FAQS.filter((f) => f.category === cat.key);
              return (
                <section key={cat.key} aria-labelledby={`faq-${cat.key}`}>
                  <h2 id={`faq-${cat.key}`} className="text-[24px] mb-5">
                    {cat.label}
                  </h2>
                  <Accordion items={items.map((f) => ({ q: f.q, a: f.a }))} />
                </section>
              );
            })}
          </div>

          <aside className="lg:sticky lg:top-24 space-y-4">
            <Card>
              <span className="grid size-11 place-items-center rounded-xl bg-mint-50 text-ink-800 ring-1 ring-lime-200">
                <IconHeadset size={24} />
              </span>
              <h3 className="mt-4 text-[16.5px]">Still have a question?</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-body">
                Our team is here Monday to Friday, 8am – 6pm CT. Real people, based in St. Louis.
              </p>
              <div className="mt-5 space-y-2.5">
                <ButtonLink href="/seller/messages" variant="dark" fullWidth size="sm">
                  <IconChat size={15} />
                  Chat with us
                </ButtonLink>
                <a
                  href="tel:+13145550123"
                  className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-white text-[13px] font-display font-semibold text-ink-900 ring-1 ring-inset ring-line-strong hover:bg-paper transition-colors"
                >
                  <IconPhone size={15} />
                  (314) 555-0123
                </a>
              </div>
            </Card>

            <Card className="!bg-mint-50 !ring-lime-200">
              <h3 className="text-[15.5px]">Ready when you are</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-body">
                Listing takes about ten minutes and costs nothing.
              </p>
              <div className="mt-4">
                <ButtonLink href="/sell" fullWidth size="sm" withArrow>
                  Get My Offer
                </ButtonLink>
              </div>
            </Card>
          </aside>
        </div>
      </section>

      <CTABand />
    </>
  );
}
