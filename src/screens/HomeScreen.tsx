import React, { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import {
  ArrowUpRightIcon,
  ArtistsIcon,
  AlbumsIcon,
  PlaylistIcon,
  PluginsIcon,
  PreferencesIcon,
  WhatsNewIcon,
  LogsIcon,
  ShuffleIcon,
  PlayIcon,
} from "../icons";
import { fonts, radius, stroke, ThemeContextValue, useTheme, useThemedStyles } from "../theme";
import { PressableScale } from "../ui";
import { Artwork } from "../widgets/Artwork";
import { usePlayer } from "../player/PlayerContext";
import { useLibrary } from "../library";
import { greeting } from "../format";

export type HomeNav =
  | "artists"
  | "albums"
  | "playlists"
  | "plugins"
  | "preferences"
  | "whats-new"
  | "logs"
  | "about"
  | "now-playing"
  | "shuffle-all";

interface HomeScreenProps {
  onNavigate: (dest: HomeNav) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { colors, shadows } = useTheme();
  const s = useThemedStyles(makeStyles);
  const { currentTrack, playTrack } = usePlayer();
  const { recentTracks } = useLibrary();

  function BentoCard({
    children,
    onPress,
    tone = "surface",
    span2,
    minHeight,
  }: {
    children: ReactNode;
    onPress?: () => void;
    tone?: "surface" | "accent" | "ink";
    span2?: boolean;
    minHeight?: number;
  }) {
    const bg = tone === "accent" ? colors.accent : tone === "ink" ? colors.ink : colors.surface;
    return (
      <PressableScale
        onPress={onPress}
        disabled={!onPress}
        scaleTo={0.97}
        style={[
          s.card,
          { backgroundColor: bg, width: span2 ? "100%" : "47.5%", borderColor: colors.outline },
          shadows.md,
          minHeight ? { minHeight } : null,
        ]}
      >
        {children}
      </PressableScale>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <Text style={s.greeting}>{greeting()}</Text>

      <View style={s.grid}>
        <BentoCard tone="accent" span2 minHeight={120} onPress={() => onNavigate("now-playing")}>
          <View style={s.rowBetween}>
            <Text style={s.heroTitle}>{currentTrack ? "Now\nplaying." : "Music,\nyour way."}</Text>
            {currentTrack ? <PlayIcon size={20} color={colors.onAccent} /> : <ArrowUpRightIcon size={20} color={colors.onAccent} />}
          </View>
          <Text style={s.heroSubtitle} numberOfLines={1}>
            {currentTrack ? `${currentTrack.title} — ${currentTrack.artist}` : "Listen. Organize. Extend."}
          </Text>
        </BentoCard>

        <BentoCard tone="ink" minHeight={112} onPress={() => onNavigate("shuffle-all")}>
          <ShuffleIcon size={22} color={colors.bg} />
          <View style={s.cardBottomSingle}>
            <Text style={[s.cardTitle, { color: colors.bg }]}>Shuffle all</Text>
            <Text style={[s.cardSubtitle, { color: colors.bg, opacity: 0.62 }]}>Random mix</Text>
          </View>
        </BentoCard>

        <BentoCard minHeight={112} onPress={() => onNavigate("artists")}>
          <ArtistsIcon size={22} color={colors.ink} />
          <View style={s.cardBottomSingle}>
            <Text style={s.cardTitle}>Artists</Text>
            <Text style={s.cardSubtitle}>Explore artists</Text>
          </View>
        </BentoCard>

        <BentoCard minHeight={64} onPress={() => onNavigate("albums")}>
          <View style={s.rowCard}>
            <View style={s.rowLeft}>
              <AlbumsIcon size={20} color={colors.ink} />
              <Text style={s.cardTitle}>Albums</Text>
            </View>
          </View>
        </BentoCard>

        <BentoCard minHeight={64} onPress={() => onNavigate("playlists")}>
          <View style={s.rowCard}>
            <View style={s.rowLeft}>
              <PlaylistIcon size={20} color={colors.ink} />
              <Text style={s.cardTitle}>Playlists</Text>
            </View>
          </View>
        </BentoCard>

        <BentoCard span2 minHeight={64} onPress={() => onNavigate("plugins")}>
          <View style={s.rowCard}>
            <View style={s.rowLeft}>
              <PluginsIcon size={20} color={colors.ink} />
              <View>
                <Text style={s.cardTitle}>Plugins</Text>
                <Text style={s.cardSubtitle}>Extend nukeop</Text>
              </View>
            </View>
            <ArrowUpRightIcon size={16} color={colors.faint} />
          </View>
        </BentoCard>

        <BentoCard minHeight={56} onPress={() => onNavigate("preferences")}>
          <View style={s.rowCard}>
            <View style={s.rowLeft}>
              <PreferencesIcon size={18} color={colors.ink} />
              <Text style={s.cardTitleSm}>Preferences</Text>
            </View>
          </View>
        </BentoCard>

        <BentoCard minHeight={56} onPress={() => onNavigate("whats-new")}>
          <View style={s.rowCard}>
            <View style={s.rowLeft}>
              <WhatsNewIcon size={18} color={colors.ink} />
              <Text style={s.cardTitleSm}>What's new</Text>
            </View>
          </View>
        </BentoCard>

        <BentoCard minHeight={56} onPress={() => onNavigate("logs")}>
          <View style={s.rowCard}>
            <View style={s.rowLeft}>
              <LogsIcon size={18} color={colors.ink} />
              <Text style={s.cardTitleSm}>Logs</Text>
            </View>
          </View>
        </BentoCard>
      </View>

      {recentTracks.length > 0 && (
        <>
          <Text style={s.sectionLabel}>Recently played</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.recentRow}>
            {recentTracks.slice(0, 10).map((track) => (
              <PressableScale key={track.id} onPress={() => playTrack(track, recentTracks)} style={s.recentItem} scaleTo={0.96}>
                <Artwork uri={track.image} seed={track.albumId || track.id} size={112} radius={14} />
                <Text style={s.recentTitle} numberOfLines={1}>
                  {track.title}
                </Text>
                <Text style={s.recentArtist} numberOfLines={1}>
                  {track.artist}
                </Text>
              </PressableScale>
            ))}
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
}

const makeStyles = ({ colors }: ThemeContextValue) => ({
  greeting: { fontFamily: fonts.comic, fontSize: 30, letterSpacing: 0.3, color: colors.ink, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14 },
  grid: { flexDirection: "row" as const, flexWrap: "wrap" as const, paddingHorizontal: 20, gap: 12, marginBottom: 8 },
  card: { borderRadius: radius.lg, borderWidth: stroke.base, padding: 14, justifyContent: "space-between" as const },
  rowBetween: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "flex-start" as const },
  rowCard: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, gap: 10 },
  rowLeft: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10 },
  heroTitle: { fontFamily: fonts.display, fontSize: 24, lineHeight: 26, letterSpacing: -0.7, color: colors.onAccent, flexShrink: 1 },
  heroSubtitle: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: colors.onAccent, opacity: 0.85, marginTop: 8 },
  cardBottomSingle: { marginTop: 14 },
  cardTitle: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: colors.ink },
  cardTitleSm: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: colors.ink },
  cardSubtitle: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.muted, marginTop: 2 },
  sectionLabel: { fontFamily: fonts.comic, fontSize: 20, color: colors.ink, paddingHorizontal: 20, marginTop: 12, marginBottom: 10 },
  recentRow: { paddingHorizontal: 20, gap: 14 },
  recentItem: { width: 112 },
  recentTitle: { fontFamily: fonts.bodySemibold, fontSize: 12.5, color: colors.ink, marginTop: 8 },
  recentArtist: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.muted, marginTop: 1 },
});
