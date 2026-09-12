"use client";

import { PortalHelpCard, PortalShell, PortalSignOut } from "@/components/portal/PortalShell";
import {
  IconCar,
  IconChat,
  IconDollarCircle,
  IconGear,
  IconHeadset,
  IconHome,
  IconTag,
} from "@/components/icons";
import { useSession } from "@/context/SessionContext";
import { threads } from "@/lib/data/marketplace";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { seller } = useSession();
  const unread = threads.reduce((n, t) => n + t.unreadCount, 0);

  return (
    <PortalShell
      tagline="A BETTER WAY TO SELL YOUR CAR"
      unread={unread}
      identity={{
        name: `${seller.firstName} ${seller.lastName}`,
        initials: seller.avatarInitials,
      }}
      nav={[
        { href: "/seller", label: "Dashboard", icon: IconHome },
        { href: "/seller/vehicle", label: "My Vehicle", icon: IconCar },
        { href: "/seller/offers", label: "Offers", icon: IconTag, deep: true },
        { href: "/seller/messages", label: "Messages", icon: IconChat, badge: unread },
        { href: "/seller/payout", label: "Payout & Pickup", icon: IconDollarCircle },
        { href: "/seller/settings", label: "Account Settings", icon: IconGear },
      ]}
      footer={
        <div className="space-y-2">
          <PortalHelpCard icon={<IconHeadset size={20} />} />
          <PortalSignOut />
        </div>
      }
    >
      {children}
    </PortalShell>
  );
}
