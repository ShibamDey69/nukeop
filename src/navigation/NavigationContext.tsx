import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type Route =
  | { screen: "now-playing" }
  | { screen: "preferences" }
  | { screen: "whats-new" }
  | { screen: "logs" }
  | { screen: "search" }
  | { screen: "local-songs" }
  | { screen: "artist"; id: string }
  | { screen: "album"; id: string }
  | { screen: "playlist"; id: string };

export type NavDirection = "forward" | "back" | "none";

interface NavigationContextValue {
  stack: Route[];
  current: Route | null;
  direction: NavDirection;
  canGoBack: boolean;
  push: (route: Route) => void;
  pop: () => boolean;
  reset: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<Route[]>([]);
  const [direction, setDirection] = useState<NavDirection>("none");

  const push = useCallback((route: Route) => {
    setDirection("forward");
    setStack((s) => [...s, route]);
  }, []);

  const pop = useCallback(() => {
    let didPop = false;
    setStack((s) => {
      if (s.length === 0) return s;
      didPop = true;
      return s.slice(0, -1);
    });
    setDirection("back");
    return didPop;
  }, []);

  const reset = useCallback(() => {
    setDirection("none");
    setStack([]);
  }, []);

  const value = useMemo(
    () => ({
      stack,
      current: stack[stack.length - 1] ?? null,
      direction,
      canGoBack: stack.length > 0,
      push,
      pop,
      reset,
    }),
    [stack, direction, push, pop, reset]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useAppNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useAppNavigation must be used within NavigationProvider");
  return ctx;
}
