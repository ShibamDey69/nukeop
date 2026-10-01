import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, View } from "react-native";
import { Header, LargeHeader, PressableScale, SettingsGroup, SettingsRow, Switch } from "../ui";
import { CheckIcon, InfoIcon, LogsIcon, MoonIcon, TrashIcon, WhatsNewIcon, YouTubeIcon } from "../icons";
import { fonts, radius, stroke, ThemeContextValue, ThemeMode, useTheme, useThemedStyles } from "../theme";
import { useSettings } from "../settings";
import { library } from "../library";
import { useAppNavigation } from "../navigation/NavigationContext";
import { getPluginState } from "../plugins";
import { pingYouTubeServer } from "../plugins/youtubeSource";

const MODES: { id: ThemeMode; label: string }[] = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

export default function PreferencesScreen() {
  const { colors, mode, setMode, accentKey, setAccentKey, accentChoices, accentSwatch } = useTheme();
  const s = useThemedStyles(makeStyles);
  const settings = useSettings();
  const { push, pop } = useAppNavigation();
  const [ytUrlDraft, setYtUrlDraft] = useState(settings.youtubeServerUrl);
  const [ytTesting, setYtTesting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(settings.youtubeSourceMode === "server" || !!settings.youtubeServerUrl);
  const youtubeInstalled = getPluginState("youtube").installed;

  async function testYoutubeServer() {
    setYtTesting(true);
    const ok = await pingYouTubeServer(ytUrlDraft);
    setYtTesting(false);
    Alert.alert(ok ? "Connected" : "Couldn't connect", ok ? "The self-hosted server is reachable." : "Check the URL and make sure the server is running.");
  }

  function confirmReset() {
    Alert.alert(
      "Reset all data?",
      "This clears liked songs, playlists, play history, saved YouTube tracks, and scanned local tracks. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: () => library.resetAll() },
      ]
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <Header onBack={pop} />
      <LargeHeader title="Preferences" subtitle="Customize nukeop" />

      <View style={{ paddingHorizontal: 20 }}>
        <SettingsGroup title="Appearance">
          <SettingsRow
            label="Theme"
            right={
              <View style={s.pillRow}>
                {MODES.map((m) => {
                  const active = mode === m.id;
                  return (
                    <PressableScale key={m.id} onPress={() => setMode(m.id)} style={[s.pill, active && s.pillActive]} scaleTo={0.94}>
                      <Text style={[s.pillLabel, active && s.pillLabelActive]}>{m.label}</Text>
                    </PressableScale>
                  );
                })}
              </View>
            }
          />
          <SettingsRow
            label="Accent color"
            right={
              <View style={s.swatchRow}>
                {accentChoices.map((key) => {
                  const active = accentKey === key;
                  return (
                    <PressableScale key={key} onPress={() => setAccentKey(key)} style={[s.swatch, { backgroundColor: accentSwatch(key) }, active && s.swatchActive]} scaleTo={0.85}>
                      {active ? <CheckIcon size={12} color="#fff" strokeWidth={3} /> : null}
                    </PressableScale>
                  );
                })}
              </View>
            }
          />
          <SettingsRow label="Compact track rows" sublabel="Tighter spacing in track lists" right={<Switch value={settings.compactRows} onChange={(v) => settings.set({ compactRows: v })} />} />
          <SettingsRow
            label="Dynamic colors"
            sublabel="Tint Now Playing with the track's own colour"
            right={<Switch value={settings.dynamicColors} onChange={(v) => settings.set({ dynamicColors: v })} />}
          />
        </SettingsGroup>

        <SettingsGroup title="Playback">
          <SettingsRow
            label="Background playback"
            sublabel="Keep playing and show lock-screen controls"
            icon={<MoonIcon size={16} color={colors.ink} />}
            right={<Switch value={settings.backgroundPlayback} onChange={(v) => settings.set({ backgroundPlayback: v })} />}
          />
          <SettingsRow
            label="Resume on launch"
            sublabel="Reopen your last queue, paused"
            right={<Switch value={settings.resumeOnLaunch} onChange={(v) => settings.set({ resumeOnLaunch: v })} />}
          />
        </SettingsGroup>

        <SettingsGroup title="Local library">
          <SettingsRow
            label="Rescan on launch"
            sublabel="Look for new on-device tracks every time nukeop opens"
            right={<Switch value={settings.rescanOnLaunch} onChange={(v) => settings.set({ rescanOnLaunch: v })} />}
          />
        </SettingsGroup>

        {youtubeInstalled && (
          <SettingsGroup title="YouTube Source">
            <SettingsRow
              label="Works out of the box"
              sublabel="Search and playback happen directly on your device — nothing to set up"
              icon={<YouTubeIcon size={16} color={colors.ink} />}
            />
            <SettingsRow
              label="Prefer self-hosted server"
              sublabel="More reliable playback if direct streaming gets blocked; falls back to direct automatically"
              right={
                <Switch
                  value={settings.youtubeSourceMode === "server"}
                  onChange={(v) => {
                    settings.set({ youtubeSourceMode: v ? "server" : "direct" });
                    if (v) setShowAdvanced(true);
                  }}
                />
              }
            />
            <SettingsRow label={showAdvanced ? "Hide advanced" : "Advanced: self-hosted server"} onPress={() => setShowAdvanced((v) => !v)} chevron />
            {showAdvanced && (
              <>
                <View style={s.ytUrlRow}>
                  <TextInput
                    style={s.ytInput}
                    value={ytUrlDraft}
                    onChangeText={setYtUrlDraft}
                    onEndEditing={() => settings.set({ youtubeServerUrl: ytUrlDraft.trim() })}
                    placeholder="http://192.168.1.20:8787"
                    placeholderTextColor={colors.faint}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                  />
                </View>
                <SettingsRow
                  label="Test connection"
                  sublabel="Checks the yt-source-server URL above (see yt-source-server/README.md)"
                  right={ytTesting ? <ActivityIndicator size="small" color={colors.accent} /> : undefined}
                  onPress={ytTesting || !ytUrlDraft.trim() ? undefined : testYoutubeServer}
                />
              </>
            )}
          </SettingsGroup>
        )}

        <SettingsGroup title="About">
          <SettingsRow label="What's new" icon={<WhatsNewIcon size={16} color={colors.ink} />} chevron onPress={() => push({ screen: "whats-new" })} />
          <SettingsRow label="Logs" icon={<LogsIcon size={16} color={colors.ink} />} chevron onPress={() => push({ screen: "logs" })} />
          <SettingsRow label="About nukeop" icon={<InfoIcon size={16} color={colors.ink} />} chevron onPress={() => push({ screen: "about" })} />
        </SettingsGroup>

        <SettingsGroup title="Data">
          <SettingsRow label="Reset all data" icon={<TrashIcon size={16} color={colors.danger} />} destructive onPress={confirmReset} />
        </SettingsGroup>
      </View>
    </ScrollView>
  );
}

const makeStyles = ({ colors }: ThemeContextValue) => ({
  pillRow: { flexDirection: "row" as const, gap: 6 },
  pill: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: radius.pill, borderWidth: stroke.thin, borderColor: colors.outline, backgroundColor: colors.surfaceAlt },
  pillActive: { backgroundColor: colors.accent },
  pillLabel: { fontFamily: fonts.bodyBold, fontSize: 11.5, color: colors.ink },
  pillLabelActive: { color: colors.onAccent },
  swatchRow: { flexDirection: "row" as const, gap: 7, flexWrap: "wrap" as const, justifyContent: "flex-end" as const, maxWidth: 160 },
  swatch: { width: 24, height: 24, borderRadius: radius.sm, alignItems: "center" as const, justifyContent: "center" as const, borderWidth: stroke.thin, borderColor: colors.outline },
  swatchActive: { borderWidth: stroke.base, borderColor: colors.outline },
  ytUrlRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: stroke.thin,
    borderBottomColor: colors.border,
  },
  ytInput: { flex: 1, fontFamily: fonts.mono, fontSize: 13, color: colors.ink, padding: 0 },
});
