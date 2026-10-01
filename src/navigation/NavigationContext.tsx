import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type Route =
  | { screen: "now-playing" }
  | { screen: "preferences" }
  | { screen: "whats-new" }
  | { screen: "logs" }
  | { screen: "search" }
  | { screen: "queue" }
  | { screen: "lyrics" }
  | { screen: "about" }
  | { screen: "artist"; id: string }
  | { screen: "album"; id: string }
  | { screen: "playlist"; id: string };

interface NavigationContextValue {
  stack: Route[];
  current: Route | null;
  push: (route: Route) => void;
  pop: () => void;
  popTo: (screen: Route["screen"]) => void;
  reset: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<Route[]>([]);

  const push = useCallback((route: Route) => setStack((s) => [...s, route]), []);
  const pop = useCallback(() => setStack((s) => s.slice(0, -1)), []);
  const popTo = useCallback((screen: Route["screen"]) => {
    setStack((s) => {
      const idx = [...s].reverse().findIndex((r) => r.screen === screen);
      if (idx === -1) return s;
      return s.slice(0, s.length - idx);
    });
  }, []);
  const reset = useCallback(() => setStack([]), []);

  const value = useMemo(
    () => ({ stack, current: stack[stack.length - 1] ?? null, push, pop, popTo, reset }),
    [stack, push, pop, popTo, reset]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useAppNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useAppNavigation must be used within NavigationProvider");
  return ctx;
}
