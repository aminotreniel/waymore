"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { Lobby } from "@/lib/auction";

const empty: Lobby = {
  server_time: "",
  dealer_id: null,
  is_admin: false,
  auctions: [],
  vehicles: [],
  my_bids: [],
};
interface State {
  session: Session | null;
  ready: boolean;
  loading: boolean;
  data: Lobby;
  now: number;
  connected: boolean;
  error: string;
  refresh: () => Promise<void>;
}
const Context = createContext<State | null>(null);
export function AuctionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Lobby>(empty);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [now, setNow] = useState(0);
  const clock = useRef({ server: 0, monotonic: 0 });
  const generation = useRef(0);
  const request = useRef(0);
  const signedIn = useRef(false);
  const currentUser = useRef<string | null>(null);
  const invalidate = useCallback(() => {
    generation.current++;
  }, []);
  // Stable across token refreshes so the subscription below is not torn down.
  const refresh = useCallback(async () => {
    if (!signedIn.current) return;
    const gen = generation.current;
    const req = ++request.current;
    const start = performance.now();
    const { data: result, error: failure } =
      await supabase.rpc("auction_lobby");
    if (gen !== generation.current || req !== request.current) return;
    setLoading(false);
    if (failure) {
      setError(failure.message);
      return;
    }
    const lobby = result as Lobby;
    clock.current = {
      server: Date.parse(lobby.server_time) + (performance.now() - start) / 2,
      monotonic: performance.now(),
    };
    setNow(clock.current.server);
    setData(lobby);
    setError("");
  }, []);
  useEffect(() => {
    // Auth events include the initial restored session and token refreshes.
    // A token refresh is the same dealer with a new JWT: keep the data and the
    // Realtime channel, or the screen blanks and reconnects roughly hourly.
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, value) => {
        const next = value?.user.id ?? null;
        signedIn.current = Boolean(value);
        setSession(value);
        setReady(true);
        if (currentUser.current === next) return;
        currentUser.current = next;
        generation.current++;
        setData(empty);
        setLoading(Boolean(value));
        setError("");
        setUserId(next);
      },
    );
    return () => subscription.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    const sync = () => {
      if (alive) void refresh();
    };
    const initial = setTimeout(sync, 0);
    const channel = supabase
      .channel(`auction-lobby-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "auctions" },
        sync,
      )
      .subscribe((status) => {
        if (!alive) return;
        setConnected(status === "SUBSCRIBED");
        if (status === "SUBSCRIBED") sync();
      });
    const poll = setInterval(sync, 5000);
    const tick = setInterval(() => {
      if (clock.current.server)
        setNow(
          clock.current.server + performance.now() - clock.current.monotonic,
        );
    }, 250);
    const offline = () => setConnected(false);
    window.addEventListener("online", sync);
    window.addEventListener("offline", offline);
    window.addEventListener("focus", sync);
    const visibility = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      alive = false;
      invalidate();
      clearTimeout(initial);
      clearInterval(poll);
      clearInterval(tick);
      void supabase.removeChannel(channel);
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", offline);
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [userId, refresh, invalidate]);
  return (
    <Context.Provider
      value={{ session, ready, loading, data, now, connected, error, refresh }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAuctions() {
  const value = useContext(Context);
  if (!value) throw new Error("AuctionProvider is required");
  return value;
}
