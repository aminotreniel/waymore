import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/context/SessionContext";
import { DemoSwitcher } from "@/components/portal/DemoSwitcher";
import { savedVehicleIds } from "@/lib/data/marketplace";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://trywaymore.com"),
  title: {
    default: "Way More — A better way to sell your car",
    template: "%s · Way More",
  },
  description:
    "Way More connects you directly with trusted local dealers who compete to buy your car. More offers. More money. Way less hassle.",
  openGraph: {
    title: "Way More — A better way to sell your car",
    description:
      "Trusted local dealers compete to buy your car. More offers. More money. Way less hassle.",
    type: "website",
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#0B2820",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="min-h-screen antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:top-3 focus:left-3 focus:rounded-lg focus:bg-ink-950 focus:px-4 focus:py-2.5 focus:text-white focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <SessionProvider initialSaved={savedVehicleIds}>
          {children}
          <DemoSwitcher />
        </SessionProvider>
      </body>
    </html>
  );
}
