import type { Metadata } from "next";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Disclosure";
import { PortalHeader } from "@/components/portal/PortalShell";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { IconChat, IconHeadset, IconMail, IconPhone } from "@/components/icons";

export const metadata: Metadata = { title: "Help & Support" };

const DEALER_FAQS = [
  {
    q: "What does it cost to buy through Way More?",
    a: "Nothing to browse or bid. There is no membership fee, no subscription, and no buyer's premium — the price you bid is the price you pay. Way More charges the seller nothing either; our revenue comes from a flat per-event participation fee agreed with your dealership.",
  },
  {
    q: "How binding is a bid?",
    a: "Bids are binding for 48 hours after the event closes. If a seller accepts yours in that window you're committed at that price, subject to the vehicle matching its disclosed condition.",
  },
  {
    q: "What if the vehicle doesn't match the listing?",
    a: "Document it at pickup and contact us before taking delivery. If something material was undisclosed, we unwind the sale at no cost to you and the seller's listing is flagged. We don't ask dealers to absorb undisclosed damage.",
  },
  {
    q: "How does automatic bidding work?",
    a: "Set a maximum and we bid the smallest increment needed to keep you in front, up to that number. Your maximum is never shown to the seller or to competing dealers.",
  },
  {
    q: "When do I pay, and how?",
    a: "Way More invoices weekly on net-3 terms via the ACH details on your profile. Funds are released to the seller once you confirm you've collected the vehicle.",
  },
  {
    q: "Can I inspect a vehicle before bidding?",
    a: "Not during the event — that's what keeps the process fast for sellers. Every listing carries seller-disclosed condition, photos, VIN and title status, and our unwind policy covers you if something material was missed.",
  },
];

export default function DealerSupportPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1150px]">
      <PortalHeader
        title="Help & Support"
        lead="Real people in St. Louis, Monday to Friday, 8am – 6pm CT."
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
        <div className="space-y-5 min-w-0">
          <Card>
            <CardHeader
              title="Send us a message"
              subtitle="We reply to dealer tickets within one business hour."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Topic"
                className="sm:col-span-2"
                options={[
                  "A vehicle I won",
                  "A bid or an event",
                  "Billing and invoices",
                  "Listing condition dispute",
                  "Account and users",
                  "Something else",
                ]}
              />
              <Input label="Related VIN" hint="optional" placeholder="1HGCV1F32KA123456" className="sm:col-span-2" />
              <Textarea label="How can we help?" className="sm:col-span-2" placeholder="Tell us what's going on…" />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline">Save draft</Button>
              <Button withArrow>Send message</Button>
            </div>
          </Card>

          <div>
            <h2 className="text-[20px] mb-4">Dealer FAQs</h2>
            <Accordion items={DEALER_FAQS} />
          </div>
        </div>

        <div className="space-y-5">
          <Card>
            <span className="grid size-11 place-items-center rounded-xl bg-mint-50 text-ink-800 ring-1 ring-lime-200">
              <IconHeadset size={23} />
            </span>
            <h3 className="mt-4 text-[16px]">Talk to a person</h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-body">
              Dealer support has its own line — you won&apos;t go through the consumer queue.
            </p>
            <div className="mt-5 space-y-2">
              <Button variant="dark" fullWidth size="sm">
                <IconChat size={15} />
                Start a chat
              </Button>
              <a
                href="tel:+13145550123"
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-white text-[13px] font-display font-semibold text-ink-900 ring-1 ring-inset ring-line-strong hover:bg-paper transition-colors"
              >
                <IconPhone size={15} />
                (314) 555-0123
              </a>
              <a
                href="mailto:dealers@trywaymore.com"
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-[13px] font-display font-semibold text-body hover:text-heading transition-colors"
              >
                <IconMail size={15} />
                dealers@trywaymore.com
              </a>
            </div>
          </Card>

          <Card className="!bg-mint-50 !ring-lime-200">
            <h3 className="text-[15.5px]">New to Way More?</h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-body">
              A ten-minute walkthrough of how events, bidding, and pickup work.
            </p>
            <div className="mt-4">
              <ButtonLink href="/dealer/event" fullWidth size="sm" withArrow>
                See this week&apos;s event
              </ButtonLink>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
