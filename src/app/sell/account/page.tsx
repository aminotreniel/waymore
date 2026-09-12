"use client";

import { EstimateAside, FunnelShell } from "@/components/marketing/FunnelShell";
import { Checkbox, Input } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Misc";
import { IconLock } from "@/components/icons";
import { useSellFlow } from "@/context/SellFlowContext";

export default function SellAccountPage() {
  const { data, set } = useSellFlow();

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email);
  const canContinue =
    data.firstName.trim() !== "" &&
    data.lastName.trim() !== "" &&
    emailValid &&
    data.phone.replace(/\D/g, "").length >= 10 &&
    data.password.length >= 8 &&
    data.agreedToTerms;

  return (
    <FunnelShell
      stepIndex={3}
      title="Create your free account"
      lead="This is how you'll track dealer activity, review offers, and message dealers — without any of them getting your phone number."
      aside={<EstimateAside />}
      backHref="/sell/estimate"
      nextHref="/sell/photos"
      canContinue={canContinue}
    >
      <div className="rounded-2xl bg-surface ring-1 ring-line shadow-card p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            required
            autoComplete="given-name"
            value={data.firstName}
            onChange={(e) => set("firstName", e.target.value)}
          />
          <Input
            label="Last name"
            required
            autoComplete="family-name"
            value={data.lastName}
            onChange={(e) => set("lastName", e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={data.email}
            error={data.email && !emailValid ? "Enter a valid email address" : undefined}
            onChange={(e) => set("email", e.target.value)}
            className="sm:col-span-2"
          />
          <Input
            label="Mobile number"
            type="tel"
            required
            autoComplete="tel"
            hint="for offer alerts only"
            placeholder="(314) 555-0142"
            value={data.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            required
            autoComplete="new-password"
            hint="8+ characters"
            value={data.password}
            error={data.password && data.password.length < 8 ? "Use at least 8 characters" : undefined}
            onChange={(e) => set("password", e.target.value)}
          />
        </div>

        <div className="mt-6 pt-5 border-t border-line space-y-3.5">
          <Checkbox
            label="Email me when a dealer bids on my car"
            description="Recommended — this is how most sellers find out they have offers."
            checked
            onChange={() => {}}
          />
          <Checkbox
            label={
              <>
                I agree to the <span className="underline underline-offset-2">Terms of Service</span>{" "}
                and <span className="underline underline-offset-2">Privacy Policy</span>
              </>
            }
            checked={data.agreedToTerms}
            onChange={(v) => set("agreedToTerms", v)}
          />
        </div>
      </div>

      <div className="mt-5">
        <Callout tone="neutral" icon={<IconLock size={17} />}>
          <strong>Dealers never see your contact details.</strong> Your name, email and phone number
          stay with Way More. Dealers see your vehicle and message you through the platform only.
        </Callout>
      </div>
    </FunnelShell>
  );
}
