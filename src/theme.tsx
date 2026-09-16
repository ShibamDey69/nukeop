import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const fonts = {
  display: "Outfit_900Black",
  displayBold: "Outfit_700Bold",
  body: "DMSans_400Regular",
  bodyMedium: "DMSans_500Medium",
  bodySemibold: "DMSans_600SemiBold",
  bodyBold: "DMSans_700Bold",
  mono: "JetBrainsMono_400Regular",
  monoMedium: "JetBrainsMono_500Medium",
  monoSemibold: "JetBrainsMono_600SemiBold",
};

export type ThemeMode = "system" | "light" | "dark";
export type AccentKey = "pink" | "blue" | "green" | "purple" | "orange";

export const ACCENTS: Record<AccentKey, { label: string; accent: string; accentLight: string }> = {
  pink: { label: "Pink", accent: "#FF5C93", accentLight: "#FF9DBA" },
  blue: { label: "Blue", accent: "#3B82F6", accentLight: "#93C5FD" },
  green: { label: "Green", accent: "#22C55E", accentLight: "#86EFAC" },
  purple: { label: "Purple", accent: "#A855F7", accentLight: "#D8B4FE" },
  orange: { label: "Orange", accent: "#F97316", accentLight: "#FDBA74" },
};

export interface ThemeColors {
  accent: string;
  accentLight: string;
  surface: string;
  ground: string;
  ink: string;
  muted: string;
  white: string;
  black: string;
  border: string;
}

function buildColors(resolvedDark: boolean, accentKey: AccentKey): ThemeColors {
  const { accent, accentLight } = ACCENTS[accentKey];
  if (resolvedDark) {
    return {
      accent,
      accentLight,
      surface: "#1C1C1E",
      ground: "#0E0E10",
      ink: "#F5F5F5",
      muted: "#9A9A9E",
      white: "#FFFFFF",
      black: "#111111",
      border: "#F5F5F5",
    };
  }
  return {
    accent,
    accentLight,
    surface: "#FFF7EC",
    ground: "#FCEBED",
    ink: "#111111",
    muted: "#888888",
    white: "#FFFFFF",
    black: "#111111",
    border: "#111111",
  };
}

// Neobrutalist "hard shadow" used throughout (border + offset shadow)
export function useNbShadow(colors: ThemeColors) {
  return useMemo(
    () => ({
      shadowColor: colors.border,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    }),
    [colors.border]
  );
}

export const levelColors: Record<string, string> = {
  INFO: "#2563eb",
  DEBUG: "#888888",
  WARN: "#d97706",
  ERROR: "#dc2626",
};

export const levelBg: Record<string, string> = {
  INFO: "#eff6ff",
  DEBUG: "#f3f4f6",
  WARN: "#fffbeb",
  ERROR: "#fef2f2",
};

interface ThemeContextValue {
  mode: ThemeMode;
  accentKey: AccentKey;
  isDark: boolean;
  colors: ThemeColors;
  nbShadow: { shadowColor: string; shadowOffset: { width: number; height: number }; shadowOpacity: number; shadowRadius: number; elevation: number };
  nbShadowSm: { shadowColor: string; shadowOffset: { width: number; height: number }; shadowOpacity: number; shadowRadius: number; elevation: number };
  setMode: (m: ThemeMode) => void;
  setAccentKey: (a: AccentKey) => void;
  accents: typeof ACCENTS;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "nukeop:theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [accentKey, setAccentKeyState] = useState<AccentKey>("pink");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.mode) setModeState(parsed.mode);
          if (parsed.accentKey) setAccentKeyState(parsed.accentKey);
        }
      } catch {
        // ignore — fall back to defaults
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, accentKey })).catch(() => {});
  }, [mode, accentKey, hydrated]);

  const setMode = useCallback((m: ThemeMode) => setModeState(m), []);
  const setAccentKey = useCallback((a: AccentKey) => setAccentKeyState(a), []);

  const isDark = mode === "system" ? systemScheme === "dark" : mode === "dark";
  const colors = useMemo(() => buildColors(isDark, accentKey), [isDark, accentKey]);

  const nbShadow = useMemo(
    () => ({
      shadowColor: colors.border,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    }),
    [colors.border]
  );

  const nbShadowSm = useMemo(
    () => ({
      shadowColor: colors.border,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    }),
    [colors.border]
  );

  const value: ThemeContextValue = useMemo(
    () => ({ mode, accentKey, isDark, colors, nbShadow, nbShadowSm, setMode, setAccentKey, accents: ACCENTS }),
    [mode, accentKey, isDark, colors, nbShadow, nbShadowSm, setMode, setAccentKey]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
