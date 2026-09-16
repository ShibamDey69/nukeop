import React, { useMemo, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { ARTISTS, ALBUMS, PLAYLISTS, TRACKS } from "../data";
import { SearchBar, TopBar } from "../components";
import { TrackRow } from "../widgets/TrackRow";
import { useAppNavigation } from "../navigation/NavigationContext";
import { usePlayer } from "../player/PlayerContext";
import { useTheme, fonts, ThemeColors } from "../theme";

interface SearchScreenProps {
  onBack: () => void;
}

export default function SearchScreen({ onBack }: SearchScreenProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState("");
  const { push } = useAppNavigation();
  const { currentTrack, isPlaying, playTrack, isLiked, toggleLike } = usePlayer();

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return { artists: [], albums: [], playlists: [], tracks: [] };
    return {
      artists: ARTISTS.filter((a) => a.name.toLowerCase().includes(q)).slice(0, 5),
      albums: ALBUMS.filter((a) => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)).slice(0, 5),
      playlists: PLAYLISTS.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5),
      tracks: TRACKS.filter((t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)).slice(0, 8),
    };
  }, [q]);

  const hasResults =
    results.artists.length + results.albums.length + results.playlists.length + results.tracks.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <TopBar title="Search" onBack={onBack} />
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <SearchBar
          placeholder="Search artists, albums, playlists, tracks..."
          value={query}
          onChange={setQuery}
          autoFocus
        />
      </View>

      {!q && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Find something to play</Text>
          <Text style={styles.emptySubtitle}>Search across your whole library</Text>
        </View>
      )}

      {q && !hasResults && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No results for "{query}"</Text>
          <Text style={styles.emptySubtitle}>Try a different search term</Text>
        </View>
      )}

      {q && hasResults && (
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          {results.artists.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Artists</Text>
              {results.artists.map((artist) => (
                <TouchableOpacity
                  key={artist.id}
                  style={styles.resultRow}
                  onPress={() => push({ screen: "artist", id: artist.id })}
                  activeOpacity={0.65}
                >
                  <Image source={{ uri: artist.image }} style={styles.circleImage} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.resultTitle} numberOfLines={1}>{artist.name}</Text>
                    <Text style={styles.resultSubtitle}>Artist · {artist.albumCount} albums</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {results.albums.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Albums</Text>
              {results.albums.map((album) => (
                <TouchableOpacity
                  key={album.id}
                  style={styles.resultRow}
                  onPress={() => push({ screen: "album", id: album.id })}
                  activeOpacity={0.65}
                >
                  <Image source={{ uri: album.image }} style={styles.squareImage} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.resultTitle} numberOfLines={1}>{album.title}</Text>
                    <Text style={styles.resultSubtitle}>Album · {album.artist}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {results.playlists.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Playlists</Text>
              {results.playlists.map((playlist) => (
                <TouchableOpacity
                  key={playlist.id}
                  style={styles.resultRow}
                  onPress={() => push({ screen: "playlist", id: playlist.id })}
                  activeOpacity={0.65}
                >
                  <Image source={{ uri: playlist.image }} style={styles.squareImage} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.resultTitle} numberOfLines={1}>{playlist.name}</Text>
                    <Text style={styles.resultSubtitle}>Playlist · {playlist.trackIds.length} tracks</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {results.tracks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Tracks</Text>
              {results.tracks.map((track, i) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  isActive={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  liked={isLiked(track.id)}
                  onToggleLike={() => toggleLike(track.id)}
                  onPress={() => playTrack(track, results.tracks)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  emptyTitle: { fontFamily: fonts.displayBold, fontSize: 16, color: colors.ink, textAlign: "center" },
  emptySubtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 6, textAlign: "center" },
  section: { marginBottom: 8 },
  sectionLabel: {
    fontFamily: fonts.display,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.muted,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  resultRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 8 },
  circleImage: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: colors.ink },
  squareImage: { width: 44, height: 44, borderWidth: 2, borderColor: colors.ink },
  resultTitle: { fontFamily: fonts.displayBold, fontSize: 13, color: colors.ink },
  resultSubtitle: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 1 },
  });
}
