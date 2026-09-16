import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { PLAYLISTS, TRACKS } from "../data";
import { TrackRow } from "../widgets/TrackRow";
import { usePlayer } from "../player/PlayerContext";
import { PlayIcon, ShuffleIcon } from "../icons";
import { useTheme, fonts, ThemeColors } from "../theme";

const VISIBILITY_LABEL: Record<string, string> = {
  my: "My playlist",
  public: "Public playlist",
  liked: "Liked songs",
};

export default function PlaylistDetailScreen({ playlistId }: { playlistId: string }) {
  const { colors, nbShadow } = useTheme();
  const styles = makeStyles(colors);
  const playlist = PLAYLISTS.find((p) => p.id === playlistId);
  const { currentTrack, isPlaying, playQueue, playTrack, toggleShuffle, isLiked, toggleLike } = usePlayer();

  if (!playlist) return null;

  const tracks = playlist.trackIds
    .map((id) => TRACKS.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <FlatList
      data={tracks}
      keyExtractor={(t) => t.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Image source={{ uri: playlist.image }} style={[styles.cover, nbShadow]} />
          <Text style={styles.title}>{playlist.name}</Text>
          <Text style={styles.meta}>
            {VISIBILITY_LABEL[playlist.visibility]} · {tracks.length} tracks
          </Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.playBtn, nbShadow]}
              onPress={() => tracks.length > 0 && playQueue(tracks, 0)}
              activeOpacity={0.85}
            >
              <PlayIcon size={16} color={colors.white} />
              <Text style={styles.playLabel}>Play</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.shuffleBtn, nbShadow]}
              onPress={() => {
                toggleShuffle();
                if (tracks.length > 0) playQueue(tracks, Math.floor(Math.random() * tracks.length));
              }}
              activeOpacity={0.85}
            >
              <ShuffleIcon size={16} color={colors.ink} />
              <Text style={styles.shuffleLabel}>Shuffle</Text>
            </TouchableOpacity>
          </View>
        </View>
      }
      ListEmptyComponent={<Text style={styles.emptyText}>This playlist has no tracks yet</Text>}
      renderItem={({ item: track, index }) => (
        <TrackRow
          track={track}
          index={index}
          isActive={currentTrack?.id === track.id}
          isPlaying={isPlaying}
          liked={isLiked(track.id)}
          onToggleLike={() => toggleLike(track.id)}
          onPress={() => playTrack(track, tracks)}
        />
      )}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    header: { alignItems: "center", paddingTop: 24, paddingBottom: 16, paddingHorizontal: 24 },
    cover: { width: 160, height: 160, borderWidth: 2, borderColor: colors.ink },
    title: { fontFamily: fonts.display, fontSize: 22, letterSpacing: -0.5, color: colors.ink, marginTop: 16, textAlign: "center" },
    meta: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 6 },
    actionsRow: { flexDirection: "row", gap: 10, marginTop: 18 },
    playBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.accent,
      borderWidth: 2,
      borderColor: colors.ink,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    playLabel: { fontFamily: fonts.displayBold, fontSize: 13, color: colors.white },
    shuffleBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.ink,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    shuffleLabel: { fontFamily: fonts.displayBold, fontSize: 13, color: colors.ink },
    emptyText: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, textAlign: "center", paddingVertical: 24 },
  });
}
