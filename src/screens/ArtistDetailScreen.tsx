import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { findArtist, getAllAlbums, getAllTracks } from "../data";
import { TrackRow } from "../widgets/TrackRow";
import { usePlayer } from "../player/PlayerContext";
import { useAppNavigation } from "../navigation/NavigationContext";
import { PlayIcon } from "../icons";
import { colors, fonts, nbShadow } from "../theme";

export default function ArtistDetailScreen({ artistId }: { artistId: string }) {
  const artist = findArtist(artistId);
  const { push } = useAppNavigation();
  const { currentTrack, isPlaying, playTrack, playQueue, isLiked, toggleLike } = usePlayer();

  if (!artist) return null;

  const albums = getAllAlbums().filter((al) => al.artistId === artistId);
  const tracks = getAllTracks().filter((t) => t.artistId === artistId);

  return (
    <FlatList
      data={tracks}
      keyExtractor={(t) => t.id}
      ListHeaderComponent={
        <View>
          <View style={styles.header}>
            <Image source={{ uri: artist.image }} style={[styles.avatar, nbShadow]} />
            <Text style={styles.name}>{artist.name}</Text>
            <Text style={styles.meta}>{artist.albumCount} albums</Text>
            <TouchableOpacity
              style={[styles.playAllBtn, nbShadow]}
              onPress={() => tracks.length > 0 && playQueue(tracks, 0)}
              activeOpacity={0.85}
            >
              <PlayIcon size={16} color={colors.white} />
              <Text style={styles.playAllLabel}>Play all</Text>
            </TouchableOpacity>
          </View>

          {albums.length > 0 && (
            <View style={styles.albumsSection}>
              <Text style={styles.sectionLabel}>Albums</Text>
              <FlatList
                data={albums}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(al) => al.id}
                contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}
                renderItem={({ item: album }) => (
                  <TouchableOpacity
                    style={styles.albumCard}
                    onPress={() => push({ screen: "album", id: album.id })}
                    activeOpacity={0.75}
                  >
                    <Image source={{ uri: album.image }} style={styles.albumArt} />
                    <Text style={styles.albumTitle} numberOfLines={1}>
                      {album.title}
                    </Text>
                    <Text style={styles.albumYear}>{album.year}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          <Text style={[styles.sectionLabel, { paddingHorizontal: 16, marginTop: 20 }]}>Popular tracks</Text>
        </View>
      }
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

const styles = StyleSheet.create({
  header: { alignItems: "center", paddingTop: 24, paddingBottom: 8 },
  avatar: { width: 120, height: 120, borderWidth: 2, borderColor: colors.ink, borderRadius: 60 },
  name: { fontFamily: fonts.display, fontSize: 24, letterSpacing: -0.6, color: colors.ink, marginTop: 14 },
  meta: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 2 },
  playAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.ink,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 16,
  },
  playAllLabel: { fontFamily: fonts.displayBold, fontSize: 13, color: colors.white },
  albumsSection: { marginTop: 24 },
  sectionLabel: {
    fontFamily: fonts.display,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.ink,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  albumCard: { width: 110 },
  albumArt: { width: 110, height: 110, borderWidth: 2, borderColor: colors.ink },
  albumTitle: { fontFamily: fonts.displayBold, fontSize: 12, color: colors.ink, marginTop: 6 },
  albumYear: { fontFamily: fonts.body, fontSize: 10, color: colors.muted },
});
