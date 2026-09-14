import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
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

export interface Palette {
  accent: string;
  accentLight: string;
  surface: string;
  ground: string;
  ink: string;
  muted: string;
  white: string;
  black: string;
  border: string;
  isDark: boolean;
}

export type ThemeName = "Pink" | "Grape" | "Sky" | "Mint" | "Sunset" | "Midnight";

export const THEME_NAMES: ThemeName[] = ["Pink", "Grape", "Sky", "Mint", "Sunset", "Midnight"];

// Every theme keeps the same neobrutalist bones (hard borders, offset
// shadows) — only the palette changes underneath it.
export const PALETTES: Record<ThemeName, Palette> = {
  Pink: {
    accent: "#FF5C93",
    accentLight: "#FF9DBA",
    surface: "#FFF7EC",
    ground: "#FCEBED",
    ink: "#111111",
    muted: "#888888",
    white: "#FFFFFF",
    black: "#111111",
    border: "#111111",
    isDark: false,
  },
  Grape: {
    accent: "#8B5CF6",
    accentLight: "#C4B5FD",
    surface: "#FBF7FF",
    ground: "#F1E9FB",
    ink: "#161221",
    muted: "#8A7FA0",
    white: "#FFFFFF",
    black: "#161221",
    border: "#161221",
    isDark: false,
  },
  Sky: {
    accent: "#2563EB",
    accentLight: "#93C5FD",
    surface: "#F5F9FF",
    ground: "#E7F0FE",
    ink: "#0F172A",
    muted: "#7C8AA5",
    white: "#FFFFFF",
    black: "#0F172A",
    border: "#0F172A",
    isDark: false,
  },
  Mint: {
    accent: "#16A34A",
    accentLight: "#86EFAC",
    surface: "#F5FBF6",
    ground: "#E4F6E8",
    ink: "#0F1F14",
    muted: "#7C9385",
    white: "#FFFFFF",
    black: "#0F1F14",
    border: "#0F1F14",
    isDark: false,
  },
  Sunset: {
    accent: "#EA580C",
    accentLight: "#FDBA74",
    surface: "#FFF8F2",
    ground: "#FDEBDA",
    ink: "#1F1208",
    muted: "#9A8570",
    white: "#FFFFFF",
    black: "#1F1208",
    border: "#1F1208",
    isDark: false,
  },
  Midnight: {
    accent: "#FF5C93",
    accentLight: "#FF9DBA",
    surface: "#1C1B22",
    ground: "#131218",
    ink: "#F4F2F7",
    muted: "#8E8C9C",
    white: "#FFFFFF",
    black: "#000000",
    border: "#F4F2F7",
    isDark: true,
  },
};

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

// Neobrutalist "hard shadow" helpers — these depend on the current theme's
// border color, so they're generated per-theme rather than being static.
export function getNbBorder(p: Palette) {
  return { borderWidth: 2, borderColor: p.border };
}
export function getNbShadow(p: Palette) {
  return {
    shadowColor: p.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  };
}
export function getNbShadowSm(p: Palette) {
  return {
    shadowColor: p.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  };
}

const STORAGE_KEY = "nukeop:theme";

interface ThemeContextValue {
  themeName: ThemeName;
  setThemeName: (t: ThemeName) => void;
  colors: Palette;
  nbBorder: { borderWidth: number; borderColor: string };
  nbShadow: ReturnType<typeof getNbShadow>;
  nbShadowSm: ReturnType<typeof getNbShadowSm>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>("Pink");
  const [hydrated, setHydrated] = useState(false);

  // Load the saved theme once on boot.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved && THEME_NAMES.includes(saved as ThemeName)) {
          setThemeNameState(saved as ThemeName);
        }
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  function setThemeName(t: ThemeName) {
    setThemeNameState(t);
    AsyncStorage.setItem(STORAGE_KEY, t).catch(() => {});
  }

  const value = useMemo<ThemeContextValue>(() => {
    const colors = PALETTES[themeName];
    return {
      themeName,
      setThemeName,
      colors,
      nbBorder: getNbBorder(colors),
      nbShadow: getNbShadow(colors),
      nbShadowSm: getNbShadowSm(colors),
    };
  }, [themeName]);

  // Avoid a flash of the default theme before AsyncStorage resolves.
  if (!hydrated) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
