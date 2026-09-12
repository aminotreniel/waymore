import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const COLUMNS = [
  {
    title: "Sell your car",
    links: [
      { href: "/sell", label: "Get my offer" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/why-way-more", label: "Why Way More" },
      { href: "/faqs", label: "FAQs" },
    ],
  },
  {
    title: "For dealers",
    links: [
      { href: "/dealer", label: "Dealer portal" },
      { href: "/dealer/event", label: "This week's event" },
      { href: "/about", label: "Partner with us" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Way More" },
      { href: "/faqs", label: "Support" },
      { href: "/about", label: "Contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink-950 text-white/70">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo tone="light" size="md" href={null} />
            <p className="mt-5 text-[14px] leading-relaxed text-white/55">
              Way More connects everyday drivers with trusted local dealers who compete to buy
              their car. More offers. More money. Way less hassle.
            </p>
            <p className="mt-5 text-[13.5px] text-white/45">
              Mon – Fri: 8am – 6pm CT
              <br />
              <a href="tel:+13145550123" className="hover:text-lime-400 transition-colors">
                (314) 555-0123
              </a>
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/90 mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[14px] text-white/55 hover:text-lime-400 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-7 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-between text-[12.5px] text-white/40">
          <p>© {new Date().getFullYear()} Way More. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/faqs" className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link href="/faqs" className="hover:text-white/70 transition-colors">Terms</Link>
            <Link href="/faqs" className="hover:text-white/70 transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
