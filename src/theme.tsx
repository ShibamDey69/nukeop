import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useColorScheme, ViewStyle } from "react-native";
import { createStore } from "./storage";
import { usePluginEnabled } from "./plugins";
import { withAlpha } from "./color";

export const fonts = {
  // Bangers = the shonen-manga "sound effect" font — used sparingly, for the
  // wordmark and a couple of hero numbers, to keep the otaku energy without
  // hurting readability everywhere else.
  comic: "Bangers_400Regular",
  display: "SpaceGrotesk_700Bold",
  displaySemi: "SpaceGrotesk_500Medium",
  body: "DMSans_400Regular",
  bodyMedium: "DMSans_500Medium",
  bodySemibold: "DMSans_600SemiBold",
  bodyBold: "DMSans_700Bold",
  mono: "JetBrainsMono_400Regular",
  monoMedium: "JetBrainsMono_500Medium",
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
// Chunky rounded-rect brutalism — the "nuclear player" reference: thick
// black outlines and hard shadows, but corners stay softened rectangles,
// not stadium pills and not knife-sharp squares.
export const radius = { sm: 10, md: 14, lg: 18, xl: 22, pill: 18 } as const;
// Neubrutalist outline weights — every card, button and field gets one of
// these solid strokes instead of a faint 1px hairline.
export const stroke = { thin: 1.5, base: 2.5, thick: 3.5 } as const;

export type ThemeMode = "system" | "light" | "dark";
export type AccentKey = "pink" | "blue" | "green" | "purple" | "orange" | "teal" | "red" | "amber" | "mono";

interface AccentDef {
  label: string;
  accent: string;
  onAccent: string;
}

// Punchy, saturated, poster-ink colours — closer to a con-exclusive vinyl
// sleeve or a manga cover than a corporate palette.
export const ACCENTS: Record<Exclude<AccentKey, "mono">, AccentDef> & { mono: { label: string } } = {
  pink: { label: "Pink", accent: "#FF4FB0", onAccent: "#1F0A17" },
  blue: { label: "Blue", accent: "#4FA8FF", onAccent: "#00142B" },
  green: { label: "Green", accent: "#16C172", onAccent: "#06120B" },
  purple: { label: "Purple", accent: "#B478FF", onAccent: "#1A0033" },
  orange: { label: "Orange", accent: "#FF7A1A", onAccent: "#1A0E00" },
  teal: { label: "Teal", accent: "#00C2CC", onAccent: "#031414" },
  red: { label: "Red", accent: "#FF3355", onAccent: "#FFFFFF" },
  amber: { label: "Amber", accent: "#FFC700", onAccent: "#1A1200" },
  mono: { label: "Mono" },
};

export const BASE_ACCENTS: AccentKey[] = ["pink", "blue", "green", "purple", "orange"];
export const EXTRA_ACCENTS: AccentKey[] = ["teal", "red", "amber", "mono"];

export interface ThemeColors {
  accent: string;
  accentSoft: string;
  onAccent: string;
  bg: string;
  surface: string;
  surfaceAlt: string;
  surfaceHigh: string;
  border: string;
  /** Solid neubrutalist outline colour — near-black in light mode, near-white in dark. */
  outline: string;
  /** Colour of the hard offset "sticker" shadow behind cards/buttons. */
  hardShadow: string;
  ink: string;
  muted: string;
  faint: string;
  overlay: string;
  danger: string;
  success: string;
  warning: string;
  info: string;
}

function buildColors(isDark: boolean, accentKey: AccentKey): ThemeColors {
  let accent: string;
  let onAccent: string;
  if (accentKey === "mono") {
    accent = isDark ? "#F6F6F8" : "#0E0E12";
    onAccent = isDark ? "#09090B" : "#FFFFFF";
  } else {
    accent = ACCENTS[accentKey].accent;
    onAccent = ACCENTS[accentKey].onAccent;
  }

  if (isDark) {
    // A near-black, faintly violet "midnight con-hall" backdrop — bright
    // accent-coloured hard shadows pop off it the way neon signage does.
    return {
      accent,
      accentSoft: withAlpha(accent, 0.22),
      onAccent,
      bg: "#0B0710",
      surface: "#161027",
      surfaceAlt: "#1F1733",
      surfaceHigh: "#2B2142",
      border: "rgba(253,246,255,0.14)",
      outline: "#FDF6FF",
      hardShadow: accent,
      ink: "#FDF6FF",
      muted: "#BCB0D4",
      faint: "#7C6F98",
      overlay: "rgba(4,2,10,0.72)",
      danger: "#FF6369",
      success: "#3DD68C",
      warning: "#FFB224",
      info: "#5BB2FF",
    };
  }
  // The "nuclear player" reference: a candy-pink canvas with white,
  // black-outlined cards sitting on top like panels on a page.
  return {
    accent,
    accentSoft: withAlpha(accent, 0.16),
    onAccent,
    bg: "#F7B8D3",
    surface: "#FFFFFF",
    surfaceAlt: "#FBD8E6",
    surfaceHigh: "#F6AACB",
    border: "rgba(31,10,23,0.14)",
    outline: "#1F0A17",
    hardShadow: "#1F0A17",
    ink: "#1F0A17",
    muted: "#7A4C61",
    faint: "#B98CA0",
    overlay: "rgba(31,10,23,0.5)",
    danger: "#E5484D",
    success: "#1E9E5A",
    warning: "#C2760A",
    info: "#2058D6",
  };
}

export interface Shadows {
  sm: ViewStyle;
  md: ViewStyle;
  lg: ViewStyle;
}

/**
 * Neubrutalist "sticker" shadows: a solid offset block with zero blur,
 * instead of a soft drop shadow — the classic hard shadow-radius:0 look.
 * `color` is near-black on the light theme and the current accent on the
 * dark theme, so the shadow always reads as a deliberate colour, not a
 * generic dim.
 */
function buildShadows(color: string): Shadows {
  return {
    sm: { shadowColor: color, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 },
    md: { shadowColor: color, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 6 },
    lg: { shadowColor: color, shadowOffset: { width: 7, height: 7 }, shadowOpacity: 1, shadowRadius: 0, elevation: 10 },
  };
}

interface ThemePrefs {
  mode: ThemeMode;
  accentKey: AccentKey;
}

// Same storage key the previous version used, so saved choices carry over.
const themeStore = createStore<ThemePrefs>("nukeop:theme", { mode: "system", accentKey: "pink" });

export interface ThemeContextValue {
  mode: ThemeMode;
  accentKey: AccentKey;
  isDark: boolean;
  colors: ThemeColors;
  shadows: Shadows;
  setMode: (m: ThemeMode) => void;
  setAccentKey: (a: AccentKey) => void;
  accentChoices: AccentKey[];
  accentSwatch: (key: AccentKey) => string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const prefs = themeStore.use();
  const extrasEnabled = usePluginEnabled("themes-extra");

  const isDark = prefs.mode === "system" ? systemScheme !== "light" : prefs.mode === "dark";

  // If the Themes Extra plugin gets disabled while an extra accent is in use, fall back to pink.
  const accentKey: AccentKey = !extrasEnabled && EXTRA_ACCENTS.includes(prefs.accentKey) ? "pink" : prefs.accentKey;

  const colors = useMemo(() => buildColors(isDark, accentKey), [isDark, accentKey]);
  const shadows = useMemo(() => buildShadows(colors.hardShadow), [colors.hardShadow]);

  const setMode = useCallback((m: ThemeMode) => themeStore.set({ mode: m }), []);
  const setAccentKey = useCallback((a: AccentKey) => themeStore.set({ accentKey: a }), []);

  const accentChoices = useMemo<AccentKey[]>(
    () => (extrasEnabled ? [...BASE_ACCENTS, ...EXTRA_ACCENTS] : BASE_ACCENTS),
    [extrasEnabled]
  );

  const accentSwatch = useCallback(
    (key: AccentKey) => (key === "mono" ? (isDark ? "#F6F6F8" : "#0E0E12") : ACCENTS[key].accent),
    [isDark]
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ mode: prefs.mode, accentKey, isDark, colors, shadows, setMode, setAccentKey, accentChoices, accentSwatch }),
    [prefs.mode, accentKey, isDark, colors, shadows, setMode, setAccentKey, accentChoices, accentSwatch]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

/** Memoised, theme-aware StyleSheet. `factory` must be a stable (module-level) function. */
export function useThemedStyles<T>(factory: (theme: ThemeContextValue) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}

export function logLevelColors(colors: ThemeColors) {
  return {
    INFO: colors.info,
    DEBUG: colors.faint,
    WARN: colors.warning,
    ERROR: colors.danger,
  } as const;
}
