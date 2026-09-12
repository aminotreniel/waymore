import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { SellFlowProvider } from "@/context/SellFlowContext";
import { IconLock, IconPhone } from "@/components/icons";

export const metadata = {
  title: "Get my offer",
  description: "Tell us about your car and get an instant estimate — free, in about ten minutes.",
};

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return (
    <SellFlowProvider>
      <div className="flex min-h-screen flex-col bg-paper">
        <header className="bg-surface border-b border-line">
          <div className="container-page flex h-[70px] items-center justify-between gap-4">
            <Logo size="sm" />
            <div className="flex items-center gap-5">
              <a
                href="tel:+13145550123"
                className="hidden sm:inline-flex items-center gap-1.5 text-[13.5px] font-medium text-body hover:text-heading transition-colors"
              >
                <IconPhone size={15} />
                (314) 555-0123
              </a>
              <Link
                href="/seller"
                className="text-[13.5px] font-medium text-body hover:text-heading transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </header>

        <main id="main" className="flex-1">
          {children}
        </main>

        <footer className="border-t border-line bg-surface">
          <div className="container-page py-5 flex flex-col sm:flex-row gap-3 items-center justify-between text-[12.5px] text-muted">
            <p className="inline-flex items-center gap-1.5">
              <IconLock size={14} />
              Your information is encrypted and never sold. Dealers never see your contact details.
            </p>
            <p>© {new Date().getFullYear()} Way More</p>
          </div>
        </footer>
      </div>
    </SellFlowProvider>
  );
}
