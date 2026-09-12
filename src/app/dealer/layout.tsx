"use client";

import { PortalHelpCard, PortalShell, PortalSignOut } from "@/components/portal/PortalShell";
import {
  IconBuilding,
  IconCalendar,
  IconCar,
  IconClipboard,
  IconGavel,
  IconHeadset,
  IconHeart,
  IconHome,
} from "@/components/icons";
import { useSession } from "@/context/SessionContext";
import { bidsForDealer } from "@/lib/data/marketplace";

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  const { dealer, savedVehicles } = useSession();
  const activeBids = bidsForDealer(dealer.id).filter((b) =>
    ["active", "winning", "outbid"].includes(b.status),
  ).length;

  return (
    <PortalShell
      tagline="A BETTER WAY TO BUY CARS"
      unread={2}
      identity={{
        name: dealer.name,
        subtitle: `${dealer.legalName.split(" ").slice(0, 2).join(" ")} · Dealer #${dealer.dealerNumber}`,
        initials: dealer.markInitials,
        markColor: dealer.markColor,
      }}
      nav={[
        { href: "/dealer", label: "Dashboard", icon: IconHome },
        { href: "/dealer/event", label: "This Week's Event", icon: IconCalendar },
        { href: "/dealer/inventory", label: "Browse Inventory", icon: IconCar, deep: true },
        { href: "/dealer/bids", label: "My Bids", icon: IconGavel, badge: activeBids },
        { href: "/dealer/purchases", label: "Purchases", icon: IconClipboard },
        { href: "/dealer/saved", label: "Saved Vehicles", icon: IconHeart, badge: savedVehicles.length },
        { href: "/dealer/profile", label: "My Profile", icon: IconBuilding },
        { href: "/dealer/support", label: "Help & Support", icon: IconHeadset },
      ]}
      footer={
        <div className="space-y-2">
          <PortalHelpCard
            title="More Cars. More Opportunities."
            body="Quality, locally sourced inventory from real sellers in your market."
            cta="Learn More"
            href="/dealer/event"
          />
          <PortalSignOut />
        </div>
      }
    >
      {children}
    </PortalShell>
  );
}
