import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type Route =
  | { screen: "now-playing" }
  | { screen: "preferences" }
  | { screen: "whats-new" }
  | { screen: "logs" }
  | { screen: "search" }
  | { screen: "artist"; id: string }
  | { screen: "album"; id: string }
  | { screen: "playlist"; id: string };

interface NavigationContextValue {
  stack: Route[];
  current: Route | null;
  push: (route: Route) => void;
  pop: () => void;
  reset: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<Route[]>([]);

  const push = useCallback((route: Route) => setStack((s) => [...s, route]), []);
  const pop = useCallback(() => setStack((s) => s.slice(0, -1)), []);
  const reset = useCallback(() => setStack([]), []);

  const value = useMemo(
    () => ({ stack, current: stack[stack.length - 1] ?? null, push, pop, reset }),
    [stack, push, pop, reset]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useAppNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useAppNavigation must be used within NavigationProvider");
  return ctx;
}
