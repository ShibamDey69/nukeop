import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { CHANGELOG } from "../data";
import { SectionHeader } from "../components";
import { useTheme, fonts, ThemeColors } from "../theme";

export default function WhatsNewScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
      <SectionHeader title="What's new" subtitle="Changelog & updates" />

      <View style={styles.timelineWrap}>
        <View style={styles.timelineLine} />

        {CHANGELOG.map((entry, i) => (
          <View key={entry.version} style={styles.entryRow}>
            <View style={styles.dotWrap}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: i === 0 ? colors.accent : colors.surface },
                ]}
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryVersion}>{entry.version}</Text>
                <Text style={styles.entryDate}>{entry.date}</Text>
              </View>
              <Text style={styles.entrySummary}>{entry.summary}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    timelineWrap: { paddingHorizontal: 16, position: "relative" },
    timelineLine: {
      position: "absolute",
      left: 28,
      top: 0,
      bottom: 32,
      width: 2,
      backgroundColor: colors.accentLight,
    },
    entryRow: { flexDirection: "row", gap: 16, paddingBottom: 24 },
    dotWrap: { width: 16, marginTop: 4, alignItems: "center" },
    dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.ink },
    entryHeader: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 4 },
    entryVersion: { fontFamily: fonts.display, fontSize: 15, color: colors.ink },
    entryDate: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
    entrySummary: { fontFamily: fonts.body, fontSize: 14, color: colors.ink, lineHeight: 21 },
  });
}
