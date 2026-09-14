import React, { ReactNode, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SectionHeader, Toggle } from "../components";
import { ChevronRightIcon } from "../icons";
import { useTheme, Palette, fonts, THEME_NAMES, PALETTES, ThemeName } from "../theme";
import { AnimatedPressable, FadeSlideIn } from "../motion";

function Section({ title, children, colors }: { title: string; children: ReactNode; colors: Palette }) {
  const styles = createStyles(colors);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

interface PrefRowProps {
  label: string;
  right?: ReactNode;
  onPress?: () => void;
  border?: boolean;
  colors: Palette;
}

function PrefRow({ label, right, onPress, border = true, colors }: PrefRowProps) {
  const styles = createStyles(colors);
  const rowStyle = [styles.prefRow, border && styles.prefRowBorder];
  if (onPress) {
    return (
      <AnimatedPressable onPress={onPress} style={rowStyle} scaleTo={0.99}>
        <Text style={styles.prefLabel}>{label}</Text>
        {right}
      </AnimatedPressable>
    );
  }
  return (
    <View style={rowStyle}>
      <Text style={styles.prefLabel}>{label}</Text>
      {right}
    </View>
  );
}

export default function PreferencesScreen() {
  const { colors, themeName, setThemeName } = useTheme();
  const styles = createStyles(colors);
  const [useAlbumColors, setUseAlbumColors] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [startOnBoot, setStartOnBoot] = useState(false);
  const [checkUpdates, setCheckUpdates] = useState(true);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
      <SectionHeader title="Preferences" subtitle="Customize nukeop" />

      <Section title="Appearance" colors={colors}>
        <View style={styles.themeGrid}>
          {THEME_NAMES.map((t, i) => {
            const isActive = themeName === t;
            const swatch = PALETTES[t];
            return (
              <FadeSlideIn key={t} delay={i * 30} style={styles.themeCardWrap}>
                <AnimatedPressable onPress={() => setThemeName(t)} scaleTo={0.95}>
                  <View
                    style={[
                      styles.themeCard,
                      { borderColor: colors.border, backgroundColor: swatch.ground },
                      isActive && { borderColor: swatch.accent, borderWidth: 3 },
                    ]}
                  >
                    <View style={[styles.themeSwatch, { backgroundColor: swatch.accent }]} />
                    <View style={[styles.themeSwatchSm, { backgroundColor: swatch.surface, borderColor: swatch.border }]} />
                  </View>
                  <Text style={[styles.themeCardLabel, { color: colors.ink, fontFamily: isActive ? fonts.bodyBold : fonts.bodyMedium }]}>
                    {t}
                  </Text>
                </AnimatedPressable>
              </FadeSlideIn>
            );
          })}
        </View>
        <PrefRow
          label="Use album colors"
          colors={colors}
          right={<Toggle value={useAlbumColors} onChange={setUseAlbumColors} />}
        />
        <PrefRow label="Compact mode" colors={colors} right={<Toggle value={compactMode} onChange={setCompactMode} />} border={false} />
      </Section>

      <Section title="General" colors={colors}>
        <PrefRow
          label="Language"
          colors={colors}
          border={false}
          onPress={() => {}}
          right={
            <View style={styles.linkRow}>
              <Text style={styles.linkText}>English (System)</Text>
              <ChevronRightIcon size={14} color={colors.muted} />
            </View>
          }
        />
        <PrefRow
          label="Start on system boot"
          colors={colors}
          right={<Toggle value={startOnBoot} onChange={setStartOnBoot} />}
        />
        <PrefRow
          label="Check for updates"
          colors={colors}
          right={<Toggle value={checkUpdates} onChange={setCheckUpdates} />}
          border={false}
        />
      </Section>

      <Section title="Integrations" colors={colors}>
        <PrefRow
          label="Last.fm"
          colors={colors}
          border={false}
          onPress={() => {}}
          right={
            <View style={styles.linkRow}>
              <Text style={styles.linkText}>Not connected</Text>
              <ChevronRightIcon size={14} color={colors.muted} />
            </View>
          }
        />
        <PrefRow
          label="Discord"
          colors={colors}
          onPress={() => {}}
          right={
            <View style={styles.linkRow}>
              <Text style={styles.linkText}>Not connected</Text>
              <ChevronRightIcon size={14} color={colors.muted} />
            </View>
          }
        />
      </Section>
    </ScrollView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    section: { paddingHorizontal: 16, marginBottom: 16 },
    sectionTitle: {
      fontFamily: fonts.display,
      fontSize: 13,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: colors.ink,
      marginBottom: 8,
    },
    sectionBody: { borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface },
    themeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
    themeCardWrap: { alignItems: "center", width: 76 },
    themeCard: {
      width: 64,
      height: 64,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    themeSwatch: { width: 26, height: 26, borderRadius: 13 },
    themeSwatchSm: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, marginTop: -8, marginLeft: 16 },
    themeCardLabel: { fontSize: 11, marginTop: 6, textAlign: "center" },
    prefRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    prefRowBorder: { borderTopWidth: 1, borderTopColor: "#e5e7eb" },
    prefLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.ink },
    linkRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    linkText: { fontFamily: fonts.body, fontSize: 14, color: colors.muted },
  });
}
