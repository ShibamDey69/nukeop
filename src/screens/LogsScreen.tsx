import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { LOGS } from "../data";
import type { LogEntry } from "../data";
import { SearchBar, SectionHeader, ChipRow } from "../components";
import { useTheme, fonts, levelColors, levelBg, ThemeColors } from "../theme";

type Level = "All" | "INFO" | "DEBUG" | "WARN" | "ERROR";

const LEVELS: Level[] = ["All", "INFO", "DEBUG", "WARN", "ERROR"];

export default function LogsScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  function LogRow({ entry }: { entry: LogEntry }) {
    return (
      <View style={styles.logRow}>
        <Text style={styles.logTime}>{entry.time}</Text>
        <Text
          style={[
            styles.logLevel,
            { color: levelColors[entry.level], backgroundColor: levelBg[entry.level] },
          ]}
        >
          {entry.level}
        </Text>
        <Text style={styles.logMessage}>{entry.message}</Text>
      </View>
    );
  }

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<Level>("All");

  const filtered = LOGS.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === "All" || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <View style={{ flex: 1 }}>
      <SectionHeader title="Log viewer" subtitle="View application logs" />

      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <SearchBar placeholder="Search logs..." value={search} onChange={setSearch} />
      </View>

      <ChipRow>
        {LEVELS.map((level) => {
          const isActive = levelFilter === level;
          const bg = isActive ? (level === "All" ? colors.ink : levelColors[level]) : colors.surface;
          return (
            <TouchableOpacity
              key={level}
              onPress={() => setLevelFilter(level)}
              style={[styles.levelChip, { backgroundColor: bg }]}
            >
              <Text style={[styles.levelChipLabel, { color: isActive ? colors.white : colors.ink }]}>
                {level}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ChipRow>

      <View style={styles.consoleWrap}>
        <View style={styles.consoleHeader}>
          <Text style={styles.consoleHeaderText}>nukeop — application log</Text>
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => <LogRow entry={item} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No entries match filter</Text>}
        />
      </View>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    levelChip: { paddingHorizontal: 12, paddingVertical: 5, borderWidth: 2, borderColor: colors.ink },
    levelChipLabel: { fontFamily: fonts.monoSemibold, fontSize: 11 },
    consoleWrap: {
      marginHorizontal: 16,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: colors.ink,
      backgroundColor: colors.surface,
      flex: 1,
      overflow: "hidden",
    },
    consoleHeader: { borderBottomWidth: 2, borderBottomColor: colors.ink, backgroundColor: colors.ink, paddingHorizontal: 12, paddingVertical: 6 },
    consoleHeaderText: { fontFamily: fonts.mono, fontSize: 11, color: colors.white },
    logRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingVertical: 6, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
    logTime: { fontFamily: fonts.mono, fontSize: 10, color: colors.muted, minWidth: 52 },
    logLevel: { fontFamily: fonts.monoSemibold, fontSize: 10, minWidth: 40, textAlign: "center", paddingHorizontal: 2 },
    logMessage: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink, flex: 1, flexWrap: "wrap" },
    emptyText: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted, paddingVertical: 16, textAlign: "center" },
  });
}
