import React from "react";
import { Linking, ScrollView, Text, View } from "react-native";
import { APP_VERSION } from "../data";
import { Header, SettingsGroup, SettingsRow } from "../ui";
import { MusicNoteIcon, ShareIcon } from "../icons";
import { fonts, radius, stroke, ThemeContextValue, useTheme, useThemedStyles } from "../theme";
import { Gradient } from "../widgets/Gradient";
import { useAppNavigation } from "../navigation/NavigationContext";

export default function AboutScreen() {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);
  const { pop } = useAppNavigation();

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <Header title="About" onBack={pop} />

      <View style={s.hero}>
        <Gradient stops={[{ color: colors.accent }, { color: colors.ink }]} direction="diagonal" style={[s.mark, { borderColor: colors.outline }]}>
          <MusicNoteIcon size={30} color="#FFFFFF" strokeWidth={1.8} />
        </Gradient>
        <Text style={s.name}>nukeop</Text>
        <Text style={s.version}>Version {APP_VERSION}</Text>
        <Text style={s.tagline}>A calm, minimal player for the music already on your phone.</Text>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <SettingsGroup title="Links">
          <SettingsRow label="Source & issues" sublabel="github.com/nukeop" icon={<ShareIcon size={16} color={colors.ink} />} chevron onPress={() => Linking.openURL("https://github.com")} />
        </SettingsGroup>

        <Text style={s.footnote}>
          Built with Expo and React Native. Lyrics powered by LRCLIB. YouTube Source talks to YouTube directly, or to a
          self-hosted server if you set one up.
        </Text>
      </View>
    </ScrollView>
  );
}

const makeStyles = ({ colors, shadows }: ThemeContextValue) => ({
  hero: { alignItems: "center" as const, paddingTop: 20, paddingBottom: 28 },
  mark: { width: 76, height: 76, borderRadius: radius.lg, borderWidth: stroke.base, alignItems: "center" as const, justifyContent: "center" as const, marginBottom: 16, ...shadows.md },
  name: { fontFamily: fonts.comic, fontSize: 30, letterSpacing: 0.4, color: colors.ink },
  version: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted, marginTop: 4 },
  tagline: { fontFamily: fonts.bodyMedium, fontSize: 13.5, color: colors.muted, textAlign: "center" as const, marginTop: 12, paddingHorizontal: 40, lineHeight: 19 },
  footnote: { fontFamily: fonts.bodyMedium, fontSize: 11.5, color: colors.faint, textAlign: "center" as const, lineHeight: 16, marginTop: 8, paddingHorizontal: 8 },
});
