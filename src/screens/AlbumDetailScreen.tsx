import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { ALBUMS, TRACKS } from "../data";
import { TrackRow } from "../widgets/TrackRow";
import { usePlayer } from "../player/PlayerContext";
import { useAppNavigation } from "../navigation/NavigationContext";
import { PlayIcon, ShuffleIcon } from "../icons";
import { useTheme, fonts, ThemeColors } from "../theme";

export default function AlbumDetailScreen({ albumId }: { albumId: string }) {
  const { colors, nbShadow } = useTheme();
  const styles = makeStyles(colors);
  const album = ALBUMS.find((a) => a.id === albumId);
  const { push } = useAppNavigation();
  const { currentTrack, isPlaying, playQueue, playTrack, toggleShuffle, isLiked, toggleLike } = usePlayer();

  if (!album) return null;

  const tracks = TRACKS.filter((t) => t.albumId === albumId);
  const totalSeconds = tracks.reduce((sum, t) => sum + t.duration, 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  return (
    <FlatList
      data={tracks}
      keyExtractor={(t) => t.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Image source={{ uri: album.image }} style={[styles.cover, nbShadow]} />
          <Text style={styles.title}>{album.title}</Text>
          <TouchableOpacity onPress={() => push({ screen: "artist", id: album.artistId })}>
            <Text style={styles.artistLink}>{album.artist}</Text>
          </TouchableOpacity>
          <Text style={styles.meta}>
            {album.year} · {album.genre} · {tracks.length} tracks · {totalMinutes} min
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
      renderItem={({ item: track, index }) => (
        <TrackRow
          track={track}
          index={index}
          showArt={false}
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
    cover: { width: 180, height: 180, borderWidth: 2, borderColor: colors.ink },
    title: { fontFamily: fonts.display, fontSize: 22, letterSpacing: -0.5, color: colors.ink, marginTop: 16, textAlign: "center" },
    artistLink: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.accent, marginTop: 4 },
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
  });
}
