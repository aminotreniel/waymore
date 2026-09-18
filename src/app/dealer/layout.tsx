"use client";

import { supabase } from "@/lib/supabase/client";
import { AuctionAccess } from "@/components/auction/AuctionAccess";
import { useAuctions } from "@/context/AuctionContext";
import { PortalHelpCard, PortalShell } from "@/components/portal/PortalShell";
import {
  IconBuilding,
  IconCalendar,
  IconCar,
  IconChat,
  IconClipboard,
  IconGavel,
  IconHeadset,
  IconHeart,
  IconHome,
} from "@/components/icons";
import { useSession } from "@/context/SessionContext";
import { dealerThreads } from "@/lib/data/marketplace";

export default function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dealer, savedVehicles } = useSession();
  const { data } = useAuctions();
  const activeBids = data.my_bids.filter((b) =>
    data.auctions.some((a) => a.id === b.auction_id && a.status === "open"),
  ).length;
  const unread = dealerThreads.reduce((n, t) => n + t.unreadCount, 0);

  return (
    <AuctionAccess>
      <PortalShell
        tagline="A BETTER WAY TO BUY CARS"
        unread={unread}
        identity={{
          name: dealer.name,
          subtitle: `${dealer.legalName.split(" ").slice(0, 2).join(" ")} · Dealer #${dealer.dealerNumber}`,
          initials: dealer.markInitials,
          markColor: dealer.markColor,
        }}
        nav={[
          { href: "/dealer", label: "Dashboard", icon: IconHome },
          {
            href: "/dealer/event",
            label: "This Week's Event",
            icon: IconCalendar,
          },
          {
            href: "/dealer/inventory",
            label: "Browse Inventory",
            icon: IconCar,
            deep: true,
          },
          {
            href: "/dealer/bids",
            label: "My Bids",
            icon: IconGavel,
            badge: activeBids,
          },
          {
            href: "/dealer/messages",
            label: "Messages",
            icon: IconChat,
            badge: unread,
          },
          {
            href: "/dealer/purchases",
            label: "Purchases",
            icon: IconClipboard,
          },
          {
            href: "/dealer/saved",
            label: "Saved Vehicles",
            icon: IconHeart,
            badge: savedVehicles.length,
          },
          { href: "/dealer/profile", label: "My Profile", icon: IconBuilding },
          {
            href: "/dealer/support",
            label: "Help & Support",
            icon: IconHeadset,
          },
        ]}
        footer={
          <div className="space-y-2">
            <PortalHelpCard
              title="More Cars. More Opportunities."
              body="Quality, locally sourced inventory from real sellers in your market."
              cta="Learn More"
              href="/dealer/event"
            />
            <button
              className="px-4 py-3 text-sm text-muted"
              onClick={() => void supabase.auth.signOut()}
            >
              Sign out
            </button>
          </div>
        }
      >
        {children}
      </PortalShell>
    </AuctionAccess>
  );
}
