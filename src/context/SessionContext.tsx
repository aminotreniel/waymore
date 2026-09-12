"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Role } from "@/lib/types";
import { adminUsers, dealers, sellers } from "@/lib/data/people";

/* ==========================================================================
   Demo session
   --------------------------------------------------------------------------
   Stands in for the real auth layer. Every portal reads `useSession()` to
   discover who is signed in, exactly as it will once Supabase auth and
   row-level security are wired up — so replacing this provider is the only
   change the portals need.
   ========================================================================== */

export interface SessionValue {
  role: Role;
  setRole: (r: Role) => void;
  seller: (typeof sellers)[number];
  dealer: (typeof dealers)[number];
  admin: (typeof adminUsers)[number];
  /** Display name for whoever is currently "signed in". */
  displayName: string;
  initials: string;
  /** Ephemeral UI state so the prototype feels responsive without a backend. */
  savedVehicles: string[];
  toggleSaved: (vehicleId: string) => void;
  isSaved: (vehicleId: string) => boolean;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({
  children,
  initialRole = "seller",
  initialSaved = [],
}: {
  children: ReactNode;
  initialRole?: Role;
  initialSaved?: string[];
}) {
  const [role, setRole] = useState<Role>(initialRole);
  const [savedVehicles, setSavedVehicles] = useState<string[]>(initialSaved);

  const toggleSaved = useCallback((vehicleId: string) => {
    setSavedVehicles((prev) =>
      prev.includes(vehicleId) ? prev.filter((v) => v !== vehicleId) : [vehicleId, ...prev],
    );
  }, []);

  const value = useMemo<SessionValue>(() => {
    const seller = sellers[0];
    const dealer = dealers[0];
    const admin = adminUsers[0];
    const displayName =
      role === "seller" ? `${seller.firstName} ${seller.lastName}` : role === "dealer" ? dealer.name : admin.name;
    const initials =
      role === "seller" ? seller.avatarInitials : role === "dealer" ? dealer.markInitials : admin.avatarInitials;
    return {
      role,
      setRole,
      seller,
      dealer,
      admin,
      displayName,
      initials,
      savedVehicles,
      toggleSaved,
      isSaved: (id: string) => savedVehicles.includes(id),
    };
  }, [role, savedVehicles, toggleSaved]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
