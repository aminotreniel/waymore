"use client";
import { useRouter } from "next/navigation";
import { dealers } from "@/lib/data/people";
import { useState, type FormEvent, type ReactNode } from "react";
import { useAuctions } from "@/context/AuctionContext";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";
export function AuctionAccess({ children }: { children: ReactNode }) {
  const { ready, session, loading, data, error, connected, refresh } =
    useAuctions();
  const router = useRouter();
  const demoEnabled = process.env.NEXT_PUBLIC_DEMO_LOGIN === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);
  async function login(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFailure("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setFailure(error.message);
    } catch {
      setFailure("Unable to connect. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }
  async function openDemo(account: number) {
    setBusy(true);
    setFailure("");
    try {
      const response = await fetch("/api/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to open demo account.");
      const { error } = await supabase.auth.setSession(result);
      if (error) throw error;
      router.replace("/dealer");
    } catch (error) {
      setFailure(
        error instanceof Error
          ? error.message
          : "Unable to connect. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!ready || (session && loading))
    return (
      <div className="p-12 text-center">Connecting to Way More auctions…</div>
    );
  if (!session)
    return (
      <div className="min-h-screen bg-paper px-5 py-20">
        <Card className="mx-auto max-w-md !p-8">
          <p className="text-sm font-bold text-success">
            WAY MORE · DEALER AUCTIONS
          </p>
          <h1 className="mt-3 text-3xl">
            {demoEnabled ? "Choose your demo account." : "Welcome back."}
          </h1>
          <p className="mt-3 text-body">
            {demoEnabled
              ? "Choose a dealer to open their dashboard and start bidding."
              : "Sign in to place bids and follow the auction live."}
          </p>
          {demoEnabled ? (
            <div className="mt-6 space-y-3">
              {dealers.slice(0, 3).map((dealer, index) => (
                <Button
                  key={dealer.id}
                  fullWidth
                  variant={index === 0 ? "primary" : "outline"}
                  disabled={busy}
                  onClick={() => void openDemo(index)}
                >
                  {busy
                    ? "Opening account…"
                    : `${dealer.name}${index === 0 ? " · Demo host" : ""}`}
                </Button>
              ))}
              {failure && (
                <p role="alert" className="text-danger text-sm">
                  {failure}
                </p>
              )}
            </div>
          ) : (
            /* Standard login is retained here for when demo mode is disabled. */
            <form onSubmit={login} className="mt-6 space-y-4">
              <Input
                label="Email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {failure && (
                <p role="alert" className="text-danger text-sm">
                  {failure}
                </p>
              )}
              <Button fullWidth disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          )}
          <p className="mt-5 text-xs text-muted">
            Paid exercise demo. Bids here are for demonstration only.
          </p>
        </Card>
      </div>
    );
  if (!data.dealer_id && !data.is_admin)
    return (
      <div className="p-12">
        <h1>Dealer access required</h1>
        <p className="my-4">
          {error || "Your account is not assigned to an approved dealer."}
        </p>
        <Button onClick={() => void supabase.auth.signOut()}>Sign out</Button>
      </div>
    );
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 bg-ink-950 px-5 py-2 text-xs text-white">
        <span>
          {connected
            ? "● Live auction updates"
            : "Connecting · checking every 5 seconds"}{" "}
          · Demo bids only
        </span>
        <span>
          {session.user.email}{" "}
          <button
            className="ml-4 underline"
            onClick={() => void supabase.auth.signOut()}
          >
            {demoEnabled ? "Switch account" : "Sign out"}
          </button>
        </span>
      </div>
      {error && (
        <div role="alert" className="bg-amber-50 px-5 py-3 text-sm">
          Updates interrupted: {error}{" "}
          <button className="underline" onClick={() => void refresh()}>
            Retry
          </button>
        </div>
      )}
      {children}
    </>
  );
}
