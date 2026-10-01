import React, { useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { Chip, EmptyState, Header, IconButton, LargeHeader, SearchField } from "../ui";
import { formatLogTime, logger, LogLevel, useLogs } from "../logger";
import { LogsIcon, TrashIcon } from "../icons";
import { fonts, logLevelColors, radius, stroke, ThemeContextValue, useTheme, useThemedStyles } from "../theme";
import { useAppNavigation } from "../navigation/NavigationContext";

type LevelFilter = "All" | LogLevel;
const LEVELS: LevelFilter[] = ["All", "INFO", "DEBUG", "WARN", "ERROR"];

export default function LogsScreen() {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);
  const levelColors = logLevelColors(colors);
  const entries = useLogs();
  const { pop } = useAppNavigation();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("All");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries
      .filter((e) => levelFilter === "All" || e.level === levelFilter)
      .filter((e) => e.message.toLowerCase().includes(q))
      .slice()
      .reverse();
  }, [entries, search, levelFilter]);

  return (
    <View style={{ flex: 1 }}>
      <Header onBack={pop} />
      <LargeHeader
        title="Logs"
        subtitle={`${entries.length} entries this session`}
        right={<IconButton label="Clear logs" variant="solid" icon={<TrashIcon size={17} color={colors.ink} />} onPress={() => logger.clear()} />}
      />

      <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
        <SearchField placeholder="Search logs" value={search} onChange={setSearch} />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={LEVELS}
        keyExtractor={(l) => l}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 12 }}
        renderItem={({ item: level }) => <Chip label={level} active={levelFilter === level} onPress={() => setLevelFilter(level)} />}
      />

      <View style={s.consoleWrap}>
        <View style={s.consoleHeader}>
          <Text style={s.consoleHeaderText}>nukeop — session log</Text>
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          inverted={false}
          renderItem={({ item }) => (
            <View style={s.logRow}>
              <Text style={s.logTime}>{formatLogTime(item.ts)}</Text>
              <Text style={[s.logLevel, { color: levelColors[item.level] }]}>{item.level}</Text>
              <Text style={s.logMessage}>{item.message}</Text>
            </View>
          )}
          ListEmptyComponent={<EmptyState icon={<LogsIcon size={22} color={colors.accent} />} title="No entries" message="Nothing matches your filter yet." />}
        />
      </View>
    </View>
  );
}

const makeStyles = ({ colors, shadows }: ThemeContextValue) => ({
  consoleWrap: { marginHorizontal: 20, marginBottom: 16, borderRadius: radius.lg, borderWidth: stroke.base, borderColor: colors.outline, backgroundColor: colors.surface, flex: 1, overflow: "hidden" as const, ...shadows.sm },
  consoleHeader: { backgroundColor: colors.ink, paddingHorizontal: 14, paddingVertical: 8 },
  consoleHeaderText: { fontFamily: fonts.mono, fontSize: 11, color: colors.bg },
  logRow: { flexDirection: "row" as const, alignItems: "flex-start" as const, gap: 8, paddingVertical: 7, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  logTime: { fontFamily: fonts.mono, fontSize: 10, color: colors.faint, minWidth: 54 },
  logLevel: { fontFamily: fonts.monoMedium, fontSize: 10, minWidth: 42 },
  logMessage: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink, flex: 1, flexWrap: "wrap" as const },
});
