import React, { ReactNode, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import {
  SearchIcon,
  BackIcon,
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  HomeIcon,
  LibraryIcon,
  PluginsIcon,
  MusicNoteIcon,
} from "./icons";
import { useTheme, Palette, fonts } from "./theme";
import { AnimatedPressable } from "./motion";

// ─── TopBar ──────────────────────────────────────────────────────────────────
// The old hamburger icon opened nothing (onMenu was a no-op), so it's gone —
// the bar now only shows Back (when there's somewhere to go back to) plus
// the title and the search entry point, both of which do something.

interface TopBarProps {
  onBack?: () => void;
  onSearch?: () => void;
  title?: string;
}

export function TopBar({ onBack, onSearch, title = "nukeop" }: TopBarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.topBar}>
      <View style={styles.topBarSide}>
        {onBack ? (
          <AnimatedPressable onPress={onBack} style={styles.iconBtn} hitSlop={8}>
            <BackIcon size={22} color={colors.ink} />
          </AnimatedPressable>
        ) : (
          <View style={styles.iconBtnPlaceholder} />
        )}
      </View>
      <Text style={styles.topBarTitle}>{title}</Text>
      <View style={[styles.topBarSide, { alignItems: "flex-end" }]}>
        <AnimatedPressable onPress={onSearch} style={styles.iconBtn} hitSlop={8}>
          <SearchIcon size={22} color={colors.ink} />
        </AnimatedPressable>
      </View>
    </View>
  );
}

// ─── BottomNavigation ─────────────────────────────────────────────────────────

export type Tab = "home" | "library" | "plugins";

interface BottomNavProps {
  active: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNavigation({ active, onTabChange }: BottomNavProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const tabs: { id: Tab; label: string; Icon: typeof HomeIcon }[] = [
    { id: "home", label: "Home", Icon: HomeIcon },
    { id: "library", label: "Library", Icon: LibraryIcon },
    { id: "plugins", label: "Plugins", Icon: PluginsIcon },
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id;
        const color = isActive ? colors.accent : colors.muted;
        return (
          <AnimatedPressable
            key={id}
            onPress={() => onTabChange(id)}
            style={styles.bottomNavItem}
            scaleTo={0.92}
          >
            <Icon size={22} color={color} />
            <Text
              style={[
                styles.bottomNavLabel,
                { color, fontFamily: isActive ? fonts.bodyBold : fonts.bodyMedium },
              ]}
            >
              {label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

// ─── MiniPlayer ───────────────────────────────────────────────────────────────

interface MiniPlayerProps {
  isPlaying: boolean;
  title: string;
  artist: string;
  image?: string;
  onPlayPause: () => void;
  onTap: () => void;
}

export function MiniPlayer({ isPlaying, title, artist, image, onPlayPause, onTap }: MiniPlayerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.miniPlayer}>
      <TouchableOpacity onPress={onTap} style={styles.miniPlayerInfo} activeOpacity={0.8}>
        {image ? (
          <Image source={{ uri: image }} style={styles.miniPlayerArt} />
        ) : (
          <View style={[styles.miniPlayerArt, styles.miniPlayerArtFallback]}>
            <MusicNoteIcon size={16} color={colors.white} />
          </View>
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.miniPlayerTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.miniPlayerArtist} numberOfLines={1}>
            {artist}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.miniPlayerControls}>
        <TouchableOpacity style={styles.iconBtnSm} hitSlop={8}>
          <SkipBackIcon size={18} color={colors.ink} />
        </TouchableOpacity>
        <AnimatedPressable onPress={onPlayPause} style={styles.iconBtnSm} hitSlop={8} scaleTo={0.85}>
          {isPlaying ? <PauseIcon size={22} color={colors.ink} /> : <PlayIcon size={22} color={colors.ink} />}
        </AnimatedPressable>
        <TouchableOpacity style={styles.iconBtnSm} hitSlop={8}>
          <SkipForwardIcon size={18} color={colors.ink} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── SearchBar ────────────────────────────────────────────────────────────────

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}

export function SearchBar({ placeholder, value, onChange, autoFocus }: SearchBarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.searchBar}>
      <SearchIcon size={16} color={colors.muted} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChange}
        autoFocus={autoFocus}
      />
    </View>
  );
}

// ─── SegmentedControl (used for the Local / Global search toggle) ────────────

interface SegmentedControlProps<T extends string> {
  options: { id: T; label: string; Icon?: typeof SearchIcon }[];
  active: T;
  onChange: (id: T) => void;
}

export function SegmentedControl<T extends string>({ options, active, onChange }: SegmentedControlProps<T>) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.segmented}>
      {options.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <AnimatedPressable
            key={id}
            onPress={() => onChange(id)}
            style={[styles.segmentedItem, { backgroundColor: isActive ? colors.ink : "transparent" }]}
            scaleTo={0.95}
          >
            {Icon ? <Icon size={14} color={isActive ? colors.surface : colors.ink} /> : null}
            <Text style={[styles.segmentedLabel, { color: isActive ? colors.surface : colors.ink }]}>
              {label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

// ─── FilterChip ───────────────────────────────────────────────────────────────

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function FilterChip({ label, active, onPress }: FilterChipProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.filterChip, { backgroundColor: active ? colors.ink : colors.surface }]}
      scaleTo={0.94}
    >
      <Text style={[styles.filterChipLabel, { color: active ? colors.surface : colors.ink }]}>{label}</Text>
    </AnimatedPressable>
  );
}

// ─── SubTabBar ────────────────────────────────────────────────────────────────

interface SubTabBarProps<T extends string> {
  tabs: { id: T; label: string }[];
  active: T;
  onTab: (t: T) => void;
}

export function SubTabBar<T extends string>({ tabs, active, onTab }: SubTabBarProps<T>) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.subTabBar}>
      {tabs.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <AnimatedPressable
            key={id}
            onPress={() => onTab(id)}
            style={[styles.subTabItem, { borderBottomColor: isActive ? colors.accent : "transparent" }]}
            scaleTo={0.97}
          >
            <Text style={[styles.subTabLabel, { color: isActive ? colors.accent : colors.muted }]}>{label}</Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionHeaderSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ value, onChange }: ToggleProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <AnimatedPressable
      onPress={() => onChange(!value)}
      style={[styles.toggleTrack, { backgroundColor: value ? "#22c55e" : "#e5e7eb" }]}
      scaleTo={0.92}
    >
      <View style={[styles.toggleThumb, { left: value ? 22 : 2 }]} />
    </AnimatedPressable>
  );
}

// ─── HorizontalScrollRow (helper for chip rows) ───────────────────────────────

export function ChipRow({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {children}
    </ScrollView>
  );
}

// ─── Responsive grid helper ────────────────────────────────────────────────
// Used by screens with a FlatList grid (artists/albums) so column count
// grows on wider screens/tablets instead of staying fixed at 3.
export function useResponsiveColumns(base = 3) {
  const { width } = useWindowDimensions();
  if (width >= 900) return base + 3;
  if (width >= 600) return base + 1;
  return base;
}

// ─── Default artwork tile (used anywhere a track/album has no image) ────────

export function DefaultArt({ size = 48 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: colors.accent,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MusicNoteIcon size={Math.round(size * 0.42)} color={colors.white} />
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
      backgroundColor: colors.ground,
    },
    topBarSide: { width: 32 },
    iconBtn: { padding: 4 },
    iconBtnPlaceholder: { width: 30, height: 30 },
    iconBtnSm: { padding: 6 },
    topBarTitle: {
      fontFamily: fonts.display,
      fontSize: 18,
      color: colors.ink,
      letterSpacing: -0.5,
    },
    bottomNav: {
      flexDirection: "row",
      borderTopWidth: 2,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    bottomNavItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingVertical: 10,
    },
    bottomNavLabel: { fontSize: 11 },
    miniPlayer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderTopWidth: 2,
      borderBottomWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    miniPlayerInfo: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1, minWidth: 0 },
    miniPlayerArt: { width: 40, height: 40, borderWidth: 2, borderColor: colors.border },
    miniPlayerArtFallback: { backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
    miniPlayerTitle: { fontFamily: fonts.displayBold, fontSize: 13, color: colors.ink },
    miniPlayerArtist: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
    miniPlayerControls: { flexDirection: "row", alignItems: "center", gap: 4 },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 2,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.surface,
    },
    searchInput: {
      flex: 1,
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.ink,
      padding: 0,
    },
    segmented: {
      flexDirection: "row",
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 3,
      gap: 3,
    },
    segmentedItem: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 8,
    },
    segmentedLabel: { fontFamily: fonts.bodySemibold, fontSize: 13 },
    filterChip: {
      borderWidth: 2,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    filterChipLabel: { fontFamily: fonts.bodyMedium, fontSize: 13 },
    chipRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
    subTabBar: {
      flexDirection: "row",
      backgroundColor: colors.ground,
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
    },
    subTabItem: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 3,
    },
    subTabLabel: { fontFamily: fonts.bodySemibold, fontSize: 13 },
    sectionHeader: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 },
    sectionHeaderTitle: {
      fontFamily: fonts.display,
      fontSize: 26,
      lineHeight: 29,
      letterSpacing: -0.7,
      color: colors.ink,
    },
    sectionHeaderSubtitle: {
      fontFamily: fonts.body,
      fontSize: 13,
      color: colors.muted,
      marginTop: 2,
    },
    toggleTrack: {
      width: 48,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: "center",
    },
    toggleThumb: {
      position: "absolute",
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: "white",
    },
  });
}
