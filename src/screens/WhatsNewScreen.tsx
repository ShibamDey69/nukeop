import React from "react";
import { ScrollView, Text, View } from "react-native";
import { CHANGELOG } from "../data";
import { Header, LargeHeader } from "../ui";
import { fonts, radius, stroke, ThemeContextValue, useThemedStyles } from "../theme";
import { useAppNavigation } from "../navigation/NavigationContext";

export default function WhatsNewScreen() {
  const s = useThemedStyles(makeStyles);
  const { pop } = useAppNavigation();
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <Header onBack={pop} />
      <LargeHeader title="What's new" subtitle="Changelog & updates" />

      <View style={s.timelineWrap}>
        <View style={s.timelineLine} />

        {CHANGELOG.map((entry, i) => (
          <View key={entry.version} style={s.entryRow}>
            <View style={s.dotWrap}>
              <View style={[s.dot, i === 0 && s.dotActive]} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={s.entryHeader}>
                <Text style={s.entryVersion}>{entry.version}</Text>
                <Text style={s.entryDate}>{entry.date}</Text>
              </View>
              <Text style={s.entrySummary}>{entry.summary}</Text>
              {entry.highlights && (
                <View style={{ marginTop: 8, gap: 4 }}>
                  {entry.highlights.map((h) => (
                    <View key={h} style={s.bulletRow}>
                      <View style={s.bullet} />
                      <Text style={s.bulletText}>{h}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const makeStyles = ({ colors }: ThemeContextValue) => ({
  timelineWrap: { paddingHorizontal: 20, position: "relative" as const },
  timelineLine: { position: "absolute" as const, left: 29, top: 4, bottom: 32, width: stroke.thin, backgroundColor: colors.outline },
  entryRow: { flexDirection: "row" as const, gap: 16, paddingBottom: 26 },
  dotWrap: { width: 16, marginTop: 4, alignItems: "center" as const },
  dot: { width: 14, height: 14, borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: stroke.base, borderColor: colors.outline },
  dotActive: { backgroundColor: colors.accent, borderColor: colors.outline },
  entryHeader: { flexDirection: "row" as const, alignItems: "baseline" as const, gap: 8, marginBottom: 4 },
  entryVersion: { fontFamily: fonts.display, fontSize: 15, color: colors.ink },
  entryDate: { fontFamily: fonts.mono, fontSize: 11, color: colors.muted },
  entrySummary: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink, lineHeight: 20 },
  bulletRow: { flexDirection: "row" as const, gap: 8, alignItems: "flex-start" as const },
  bullet: { width: 4, height: 4, borderRadius: 1, backgroundColor: colors.muted, marginTop: 7 },
  bulletText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted, lineHeight: 18 },
});
