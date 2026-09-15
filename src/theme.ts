export const colors = {
  accent: "#FF5C93",
  accentLight: "#FF9DBA",
  surface: "#FFF7EC",
  ground: "#FCEBED",
  ink: "#111111",
  muted: "#888888",
  white: "#FFFFFF",
  black: "#111111",
};

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

// Neobrutalist "hard shadow" used throughout (border + offset shadow)
export const nbBorder = {
  borderWidth: 2,
  borderColor: colors.ink,
};

export const nbShadow = {
  shadowColor: colors.ink,
  shadowOffset: { width: 3, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 4,
};

export const nbShadowSm = {
  shadowColor: colors.ink,
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 3,
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

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radii = { sm: 6, md: 10 };
export const type = {
  h1: 20,
  h2: 15,
  body: 13,
  label: 12,
  caption: 11,
  micro: 10,
};

export type Palette = typeof colors & { border: string; isDark: boolean };

export function useTheme() {
  return {
    colors: { ...colors, border: colors.ink, isDark: false },
    nbBorder,
    nbShadow,
    nbShadowSm,
  };
}
