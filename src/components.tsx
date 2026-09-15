import React, { ReactNode } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  MenuIcon,
  SearchIcon,
  BackIcon,
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  HomeIcon,
  LibraryIcon,
  PluginsIcon,
} from "./icons";
import { usePlayer } from "./player/PlayerContext";
import { colors, fonts } from "./theme";

interface TopBarProps {
  title?: string;
  onMenu?: () => void;
  onBack?: () => void;
  onSearch?: () => void;
}

export function TopBar({ title = "nukeop", onMenu, onBack, onSearch }: TopBarProps) {
  return (
    <View style={styles.topBar}>
      <TouchableOpacity onPress={onBack ?? onMenu} style={styles.iconBtn} hitSlop={10}>
        {onBack ? <BackIcon size={22} /> : <MenuIcon size={22} />}
      </TouchableOpacity>
      <Text style={styles.topBarTitle} numberOfLines={1}>
        {title}
      </Text>
      <TouchableOpacity onPress={onSearch} style={styles.iconBtn} hitSlop={10} disabled={!onSearch}>
        {onSearch ? <SearchIcon size={22} /> : <View style={{ width: 22, height: 22 }} />}
      </TouchableOpacity>
    </View>
  );
}

export type Tab = "home" | "library" | "plugins";

interface BottomNavProps {
  active: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNavigation({ active, onTabChange }: BottomNavProps) {
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
          <TouchableOpacity
            key={id}
            onPress={() => onTabChange(id)}
            style={styles.bottomNavItem}
            activeOpacity={0.6}
            hitSlop={4}
          >
            {isActive && <View style={styles.bottomNavIndicator} />}
            <Icon size={22} color={color} />
            <Text
              style={[
                styles.bottomNavLabel,
                { color, fontFamily: isActive ? fonts.bodyBold : fonts.bodyMedium },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

interface MiniPlayerProps {
  onTap: () => void;
}

export function MiniPlayer({ onTap }: MiniPlayerProps) {
  const { currentTrack, isPlaying, isBuffering, positionMillis, durationMillis, togglePlayPause, next, prev } =
    usePlayer();

  if (!currentTrack) return null;

  const progress = durationMillis > 0 ? Math.min(1, positionMillis / durationMillis) : 0;

  return (
    <View style={styles.miniPlayer}>
      <View style={styles.miniPlayerProgressTrack}>
        <View style={[styles.miniPlayerProgressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.miniPlayerRow}>
        <TouchableOpacity onPress={onTap} style={styles.miniPlayerInfo} activeOpacity={0.75}>
          <Image source={{ uri: currentTrack.image }} style={styles.miniPlayerArt} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.miniPlayerTitle} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.miniPlayerArtist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.miniPlayerControls}>
          <TouchableOpacity onPress={prev} style={styles.iconBtnSm} hitSlop={8}>
            <SkipBackIcon size={18} />
          </TouchableOpacity>
          <TouchableOpacity onPress={togglePlayPause} style={styles.iconBtnSm} hitSlop={8}>
            {isBuffering ? (
              <View style={styles.bufferingDot} />
            ) : isPlaying ? (
              <PauseIcon size={22} />
            ) : (
              <PlayIcon size={22} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={next} style={styles.iconBtnSm} hitSlop={8}>
            <SkipForwardIcon size={18} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}

export function SearchBar({ placeholder, value, onChange, autoFocus }: SearchBarProps) {
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
        returnKeyType="search"
      />
    </View>
  );
}

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function FilterChip({ label, active, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.filterChip, { backgroundColor: active ? colors.ink : colors.surface }]}
    >
      <Text style={[styles.filterChipLabel, { color: active ? colors.surface : colors.ink }]}>{label}</Text>
    </TouchableOpacity>
  );
}

interface SubTabBarProps<T extends string> {
  tabs: { id: T; label: string }[];
  active: T;
  onTab: (t: T) => void;
}

export function SubTabBar<T extends string>({ tabs, active, onTab }: SubTabBarProps<T>) {
  return (
    <View style={styles.subTabBar}>
      {tabs.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <TouchableOpacity
            key={id}
            onPress={() => onTab(id)}
            activeOpacity={0.7}
            style={[styles.subTabItem, { borderBottomColor: isActive ? colors.accent : "transparent" }]}
          >
            <Text style={[styles.subTabLabel, { color: isActive ? colors.accent : colors.muted }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionHeaderSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ value, onChange }: ToggleProps) {
  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      activeOpacity={0.8}
      style={[styles.toggleTrack, { backgroundColor: value ? "#22c55e" : "#e5e7eb" }]}
    >
      <View style={[styles.toggleThumb, { left: value ? 22 : 2 }]} />
    </TouchableOpacity>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.ink,
    backgroundColor: colors.ground,
  },
  iconBtn: { padding: 4 },
  iconBtnSm: { padding: 6 },
  topBarTitle: {
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 2,
    borderTopColor: colors.ink,
    backgroundColor: colors.surface,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
  },
  bottomNavIndicator: {
    position: "absolute",
    top: 0,
    width: 28,
    height: 3,
    backgroundColor: colors.accent,
  },
  bottomNavLabel: { fontSize: 11 },
  miniPlayer: {
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  miniPlayerProgressTrack: { height: 3, backgroundColor: "#e5e7eb" },
  miniPlayerProgressFill: { height: 3, backgroundColor: colors.accent },
  miniPlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  miniPlayerInfo: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1, minWidth: 0 },
  miniPlayerArt: { width: 40, height: 40, borderWidth: 2, borderColor: colors.ink },
  miniPlayerTitle: { fontFamily: fonts.displayBold, fontSize: 13, color: colors.ink },
  miniPlayerArtist: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
  miniPlayerControls: { flexDirection: "row", alignItems: "center", gap: 4 },
  bufferingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.muted },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: colors.ink,
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
  filterChip: {
    borderWidth: 2,
    borderColor: colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  filterChipLabel: { fontFamily: fonts.bodyMedium, fontSize: 13 },
  chipRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  subTabBar: { flexDirection: "row", backgroundColor: colors.ground, borderBottomWidth: 2, borderBottomColor: colors.ink },
  subTabItem: {
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
    borderColor: colors.ink,
    justifyContent: "center",
  },
  toggleThumb: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: "white",
  },
});
