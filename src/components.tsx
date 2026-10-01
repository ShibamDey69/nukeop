import React from "react";
import { Text, View } from "react-native";
import { SearchIcon, HomeIcon, LibraryIcon, PluginsIcon, SkipBackIcon, SkipForwardIcon, PlayIcon, PauseIcon, QueueIcon } from "./icons";
import { usePlayer, usePlayerProgress } from "./player/PlayerContext";
import { fonts, radius, stroke, ThemeContextValue, useTheme, useThemedStyles } from "./theme";
import { Artwork, EqBars } from "./widgets/Artwork";
import { IconButton, PressableScale } from "./ui";

// ── Home top bar ─────────────────────────────────────────────────────────

const makeTopBarStyles = ({ colors }: ThemeContextValue) => ({
  bar: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, paddingHorizontal: 20, height: 52 },
  brand: {
    fontFamily: fonts.comic,
    fontSize: 24,
    letterSpacing: 0.5,
    color: colors.ink,
    transform: [{ rotate: "-2deg" }],
  },
});

export function HomeTopBar({ onSearch }: { onSearch: () => void }) {
  const s = useThemedStyles(makeTopBarStyles);
  const { colors } = useTheme();
  return (
    <View style={s.bar}>
      <Text style={s.brand}>nukeop</Text>
      <IconButton label="Search" icon={<SearchIcon size={21} color={colors.ink} />} onPress={onSearch} />
    </View>
  );
}

// ── Bottom tab bar ───────────────────────────────────────────────────────

export type Tab = "home" | "library" | "plugins";

const makeBottomNavStyles = ({ colors }: ThemeContextValue) => ({
  bar: { flexDirection: "row" as const, backgroundColor: colors.surface, paddingTop: 8 },
  item: { flex: 1, alignItems: "center" as const, justifyContent: "center" as const, gap: 3, paddingVertical: 6 },
  label: { fontSize: 10.5, marginTop: 1 },
});

export function BottomNavigation({ active, onTabChange }: { active: Tab; onTabChange: (t: Tab) => void }) {
  const { colors } = useTheme();
  const s = useThemedStyles(makeBottomNavStyles);
  const tabs: { id: Tab; label: string; Icon: typeof HomeIcon }[] = [
    { id: "home", label: "Home", Icon: HomeIcon },
    { id: "library", label: "Library", Icon: LibraryIcon },
    { id: "plugins", label: "Plugins", Icon: PluginsIcon },
  ];

  return (
    <View style={s.bar}>
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id;
        const color = isActive ? colors.accent : colors.faint;
        return (
          <PressableScale key={id} onPress={() => onTabChange(id)} style={s.item} scaleTo={0.9}>
            <Icon size={22} color={color} strokeWidth={isActive ? 2.3 : 2} />
            <Text style={[s.label, { color, fontFamily: isActive ? fonts.bodyBold : fonts.bodyMedium }]}>{label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

// ── Mini player ──────────────────────────────────────────────────────────

const makeMiniPlayerStyles = ({ colors, shadows }: ThemeContextValue) => ({
  wrap: { paddingHorizontal: 10, paddingBottom: 8, backgroundColor: "transparent" },
  card: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    borderRadius: radius.lg,
    borderWidth: stroke.base,
    borderColor: colors.outline,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 8,
    paddingHorizontal: 10,
    overflow: "hidden" as const,
    ...shadows.md,
  },
  progressTrack: { position: "absolute" as const, left: 0, right: 0, bottom: 0, height: 3, backgroundColor: "transparent" },
  progressFill: { height: 3, backgroundColor: colors.accent },
  info: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10, flex: 1, minWidth: 0 },
  title: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: colors.ink },
  artist: { fontFamily: fonts.body, fontSize: 11.5, color: colors.muted, marginTop: 1 },
  controls: { flexDirection: "row" as const, alignItems: "center" as const, gap: 2 },
  queueDot: { position: "absolute" as const, top: -1, right: -1, width: 8, height: 8, borderRadius: radius.sm, backgroundColor: colors.accent, borderWidth: 1.5, borderColor: colors.surfaceAlt },
});

export function MiniPlayer({ onTap, onQueue }: { onTap: () => void; onQueue?: () => void }) {
  const s = useThemedStyles(makeMiniPlayerStyles);
  const { colors } = useTheme();
  const { currentTrack, isPlaying, isBuffering, upNext, togglePlayPause, next, prev } = usePlayer();
  const { positionMillis, durationMillis } = usePlayerProgress();

  if (!currentTrack) return null;

  const progress = durationMillis > 0 ? Math.min(1, positionMillis / durationMillis) : 0;

  return (
    <View style={s.wrap}>
      <PressableScale onPress={onTap} scaleTo={0.99} style={s.card} accessibilityLabel="Now playing">
        <View style={s.info}>
          <Artwork uri={currentTrack.image} seed={currentTrack.albumId || currentTrack.id} size={38} radius={9} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.title} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={s.artist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>
        </View>

        <View style={s.controls}>
          <IconButton label="Previous" size={34} icon={<SkipBackIcon size={17} color={colors.ink} />} onPress={prev} />
          <IconButton
            label={isPlaying ? "Pause" : "Play"}
            size={38}
            variant="solid"
            icon={
              isBuffering ? (
                <EqBars color={colors.ink} playing height={12} />
              ) : isPlaying ? (
                <PauseIcon size={18} color={colors.ink} />
              ) : (
                <PlayIcon size={18} color={colors.ink} />
              )
            }
            onPress={togglePlayPause}
          />
          <IconButton label="Next" size={34} icon={<SkipForwardIcon size={17} color={colors.ink} />} onPress={next} />
          {onQueue && (
            <IconButton
              label="Queue"
              size={34}
              icon={
                <View>
                  <QueueIcon size={17} color={colors.ink} />
                  {upNext.length > 0 && <View style={s.queueDot} />}
                </View>
              }
              onPress={onQueue}
            />
          )}
        </View>

        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </PressableScale>
    </View>
  );
}
