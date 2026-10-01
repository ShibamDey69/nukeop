import React, { useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import { Header, EmptyState, IconButton, PressableScale } from "../ui";
import { TrackRow } from "../widgets/TrackRow";
import { EqBars, Artwork } from "../widgets/Artwork";
import { usePlayer } from "../player/PlayerContext";
import { useLibrary } from "../library";
import { fonts, radius, stroke, ThemeContextValue, useTheme, useThemedStyles } from "../theme";
import { formatDuration } from "../format";
import { ChevronDownIcon, ChevronUpIcon, CloseIcon, QueueIcon, ShuffleIcon, TrashIcon } from "../icons";
import { Track } from "../data";

interface QueueScreenProps {
  onBack: () => void;
}

interface Row {
  key: string;
  track: Track;
  queueIndex: number;
}

const MAX_RECOMMENDATIONS = 12;

export default function QueueScreen({ onBack }: QueueScreenProps) {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);
  const { currentTrack, index, shuffle, upNext, jumpToQueueIndex, removeFromQueue, reorderQueue, clearUpNext, toggleShuffle, playTrack, addToQueue } = usePlayer();
  const { isLiked, likedTracks, recentTracks, allTracks } = useLibrary();

  const rows: Row[] = upNext.map((track, i) => ({ key: `${track.id}-${index + 1 + i}`, track, queueIndex: index + 1 + i }));

  // Nothing queued up — surface real recommendations instead of a blank
  // screen: liked songs first, then recently played, then whatever's left
  // in the library. Never fabricated content.
  const recommended = useMemo(() => {
    if (rows.length > 0) return [];
    const seen = new Set<string>(currentTrack ? [currentTrack.id] : []);
    const out: Track[] = [];
    for (const t of [...likedTracks, ...recentTracks, ...allTracks]) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      out.push(t);
      if (out.length >= MAX_RECOMMENDATIONS) break;
    }
    return out;
  }, [rows.length, currentTrack, likedTracks, recentTracks, allTracks]);

  function onRecommendedPress(track: Track, pool: Track[]) {
    if (currentTrack) addToQueue(track);
    else playTrack(track, pool);
  }

  return (
    <View style={{ flex: 1 }}>
      <Header
        title="Queue"
        onBack={onBack}
        right={
          upNext.length > 0 ? (
            <IconButton label="Clear queue" variant="solid" icon={<TrashIcon size={16} color={colors.ink} />} onPress={clearUpNext} />
          ) : undefined
        }
      />

      {currentTrack && (
        <View style={s.nowSection}>
          <Text style={s.sectionLabel}>Now playing</Text>
          <View style={s.nowRow}>
            <Artwork uri={currentTrack.image} seed={currentTrack.albumId || currentTrack.id} size={48} radius={11} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.nowTitle} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <Text style={s.nowArtist} numberOfLines={1}>
                {currentTrack.artist}
              </Text>
            </View>
            <EqBars color={colors.accent} playing height={16} />
          </View>
        </View>
      )}

      <View style={s.upNextHeader}>
        <Text style={s.sectionLabel}>{shuffle ? "Up next · shuffled" : "Up next"}</Text>
        <PressableScale onPress={toggleShuffle} style={[s.shuffleChip, shuffle && s.shuffleChipActive]} scaleTo={0.95}>
          <ShuffleIcon size={13} color={shuffle ? colors.onAccent : colors.ink} />
          <Text style={[s.shuffleChipLabel, shuffle && { color: colors.onAccent }]}>Shuffle</Text>
        </PressableScale>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        ListEmptyComponent={
          recommended.length > 0 ? (
            <View style={{ paddingTop: 4 }}>
              <Text style={[s.sectionLabel, { paddingHorizontal: 20, marginBottom: 8 }]}>
                {likedTracks.length > 0 || recentTracks.length > 0 ? "Recommended for you" : "From your library"}
              </Text>
              {recommended.map((track, i) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={i}
                  liked={isLiked(track.id)}
                  onPress={() => onRecommendedPress(track, recommended)}
                  onAddToQueue={() => addToQueue(track)}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              icon={<QueueIcon size={22} color={colors.accent} />}
              title="Queue is empty"
              message="Scan your device for music, or search, to start building a queue."
            />
          )
        }
        renderItem={({ item, index: rowIndex }) => (
          <PressableScale onPress={() => jumpToQueueIndex(item.queueIndex)} scaleTo={0.99} style={s.row}>
            <Artwork uri={item.track.image} seed={item.track.albumId || item.track.id} size={42} radius={10} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.rowTitle} numberOfLines={1}>
                {item.track.title}
              </Text>
              <Text style={s.rowArtist} numberOfLines={1}>
                {item.track.artist}
              </Text>
            </View>
            <Text style={s.rowDuration}>{formatDuration(item.track.duration)}</Text>
            <View style={s.reorderCol}>
              <IconButton
                label="Move up"
                size={22}
                disabled={rowIndex === 0}
                icon={<ChevronUpIcon size={14} color={rowIndex === 0 ? colors.faint : colors.ink} />}
                onPress={() => reorderQueue(item.queueIndex, item.queueIndex - 1)}
              />
              <IconButton
                label="Move down"
                size={22}
                disabled={rowIndex === rows.length - 1}
                icon={<ChevronDownIcon size={14} color={rowIndex === rows.length - 1 ? colors.faint : colors.ink} />}
                onPress={() => reorderQueue(item.queueIndex, item.queueIndex + 1)}
              />
            </View>
            <IconButton label="Remove from queue" size={30} icon={<CloseIcon size={15} color={colors.faint} />} onPress={() => removeFromQueue(item.queueIndex)} />
          </PressableScale>
        )}
      />
    </View>
  );
}

const makeStyles = ({ colors, shadows }: ThemeContextValue) => ({
  sectionLabel: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.7, textTransform: "uppercase" as const, color: colors.muted },
  nowSection: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 10 },
  nowRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    borderWidth: stroke.base,
    borderColor: colors.outline,
    padding: 10,
    ...shadows.sm,
  },
  nowTitle: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: colors.ink },
  nowArtist: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: colors.muted, marginTop: 1 },
  upNextHeader: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, paddingHorizontal: 20, marginBottom: 8 },
  shuffleChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: stroke.thin,
    borderColor: colors.outline,
    backgroundColor: colors.surfaceAlt,
  },
  shuffleChipActive: { backgroundColor: colors.accent },
  shuffleChipLabel: { fontFamily: fonts.bodyBold, fontSize: 11.5, color: colors.ink },
  row: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8, paddingHorizontal: 20, paddingVertical: 7 },
  reorderCol: { gap: 1 },
  rowTitle: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.ink },
  rowArtist: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.muted, marginTop: 1 },
  rowDuration: { fontFamily: fonts.mono, fontSize: 10.5, color: colors.faint },
});
