import React, { ReactNode, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SectionHeader, Toggle } from "../components";
import { ActionSheet } from "../widgets/ActionSheet";
import { ChevronRightIcon, CheckIcon } from "../icons";
import { colors, fonts } from "../theme";

type Theme = "System" | "Light" | "Dark" | "Pink";
const LANGUAGES = ["English (System)", "Spanish", "Japanese", "German", "French"];

function Section({ title, children }: { title: string; children: ReactNode }) {
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
}

function PrefRow({ label, right, onPress, border = true }: PrefRowProps) {
  const Wrapper: any = onPress ? TouchableOpacity : View;
  return (
    <Wrapper onPress={onPress} activeOpacity={0.6} style={[styles.prefRow, border && styles.prefRowBorder]}>
      <Text style={styles.prefLabel}>{label}</Text>
      {right}
    </Wrapper>
  );
}

export default function PreferencesScreen() {
  const [theme, setTheme] = useState<Theme>("System");
  const [useAlbumColors, setUseAlbumColors] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [startOnBoot, setStartOnBoot] = useState(false);
  const [checkUpdates, setCheckUpdates] = useState(true);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [lastfmConnected, setLastfmConnected] = useState(false);
  const [discordConnected, setDiscordConnected] = useState(false);
  const [languageSheetOpen, setLanguageSheetOpen] = useState(false);

  const themes: Theme[] = ["System", "Light", "Dark", "Pink"];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
      <SectionHeader title="Preferences" subtitle="Customize nukeop" />

      <Section title="Appearance">
        <PrefRow
          label="Theme"
          border={false}
          right={
            <View style={styles.themeRow}>
              {themes.map((t) => {
                const isActive = theme === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setTheme(t)}
                    style={[
                      styles.themeBtn,
                      {
                        backgroundColor: isActive
                          ? t === "Pink"
                            ? colors.accent
                            : colors.ink
                          : colors.surface,
                      },
                    ]}
                  >
                    <Text style={[styles.themeBtnLabel, { color: isActive ? colors.white : colors.ink }]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          }
        />
        <PrefRow
          label="Use album colors"
          right={<Toggle value={useAlbumColors} onChange={setUseAlbumColors} />}
        />
        <PrefRow label="Compact mode" right={<Toggle value={compactMode} onChange={setCompactMode} />} />
      </Section>

      <Section title="General">
        <PrefRow
          label="Language"
          border={false}
          onPress={() => setLanguageSheetOpen(true)}
          right={
            <View style={styles.linkRow}>
              <Text style={styles.linkText}>{language}</Text>
              <ChevronRightIcon size={14} color={colors.muted} />
            </View>
          }
        />
        <PrefRow
          label="Start on system boot"
          right={<Toggle value={startOnBoot} onChange={setStartOnBoot} />}
        />
        <PrefRow
          label="Check for updates"
          right={<Toggle value={checkUpdates} onChange={setCheckUpdates} />}
        />
      </Section>

      <Section title="Integrations">
        <PrefRow
          label="Last.fm"
          border={false}
          onPress={() => setLastfmConnected((c) => !c)}
          right={
            <View style={styles.linkRow}>
              <Text style={[styles.linkText, lastfmConnected && { color: "#22c55e" }]}>
                {lastfmConnected ? "Connected" : "Not connected"}
              </Text>
              <ChevronRightIcon size={14} color={colors.muted} />
            </View>
          }
        />
        <PrefRow
          label="Discord"
          onPress={() => setDiscordConnected((c) => !c)}
          right={
            <View style={styles.linkRow}>
              <Text style={[styles.linkText, discordConnected && { color: "#22c55e" }]}>
                {discordConnected ? "Connected" : "Not connected"}
              </Text>
              <ChevronRightIcon size={14} color={colors.muted} />
            </View>
          }
        />
      </Section>

      <ActionSheet
        visible={languageSheetOpen}
        onClose={() => setLanguageSheetOpen(false)}
        title="Language"
        options={LANGUAGES.map((lang) => ({
          label: lang,
          icon: lang === language ? <CheckIcon size={16} color={colors.accent} /> : undefined,
          onPress: () => setLanguage(lang),
        }))}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.ink,
    marginBottom: 8,
  },
  sectionBody: { borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.surface },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  prefRowBorder: { borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  prefLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.ink },
  themeRow: { flexDirection: "row", gap: 4 },
  themeBtn: { paddingHorizontal: 10, paddingVertical: 4, borderWidth: 2, borderColor: colors.ink },
  themeBtnLabel: { fontFamily: fonts.bodySemibold, fontSize: 11 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  linkText: { fontFamily: fonts.body, fontSize: 14, color: colors.muted },
});
