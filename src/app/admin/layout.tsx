"use client";

import { PortalShell, PortalSignOut } from "@/components/portal/PortalShell";
import {
  IconBuilding,
  IconCalendar,
  IconCar,
  IconChart,
  IconClipboard,
  IconGear,
  IconTag,
  IconUsers,
} from "@/components/icons";
import { useSession } from "@/context/SessionContext";
import { approvalQueue } from "@/lib/data/marketplace";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin } = useSession();

  return (
    <PortalShell
      tagline="OPERATIONS CONSOLE"
      unread={approvalQueue.length}
      identity={{
        name: admin.name,
        subtitle: admin.role === "owner" ? "Owner" : admin.role === "ops" ? "Operations" : "Support",
        initials: admin.avatarInitials,
      }}
      nav={[
        { href: "/admin", label: "Overview", icon: IconChart },
        { href: "/admin/approvals", label: "Approval Queue", icon: IconClipboard, badge: approvalQueue.length },
        { href: "/admin/vehicles", label: "Vehicles", icon: IconCar },
        { href: "/admin/events", label: "Events", icon: IconCalendar },
        { href: "/admin/offers", label: "Offers & Sales", icon: IconTag },
        { href: "/admin/dealers", label: "Dealers", icon: IconBuilding },
        { href: "/admin/sellers", label: "Sellers", icon: IconUsers },
        { href: "/admin/settings", label: "Settings", icon: IconGear },
      ]}
      footer={<PortalSignOut />}
    >
      {children}
    </PortalShell>
  );
}
