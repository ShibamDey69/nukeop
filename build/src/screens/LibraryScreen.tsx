import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList } from "react-native";
import { SubTabBar, SearchBar, FilterChip, SectionHeader, ChipRow } from "../components";
import { ARTISTS, ALBUMS, PLAYLISTS } from "../data";
import { ChevronRightIcon } from "../icons";
import { useAppNavigation } from "../navigation/NavigationContext";
import { colors, fonts, nbShadow } from "../theme";

type LibraryTab = "artists" | "albums" | "playlists";
type PlaylistTab = "my" | "public" | "liked";
type Genre = "All" | "Rock" | "Pop" | "Hip-Hop" | "Indie" | "R&B" | "Electronic";

const LIBRARY_TABS = [
  { id: "artists" as LibraryTab, label: "Artists" },
  { id: "albums" as LibraryTab, label: "Albums" },
  { id: "playlists" as LibraryTab, label: "Playlists" },
];

const PLAYLIST_TABS = [
  { id: "my" as PlaylistTab, label: "My Playlists" },
  { id: "public" as PlaylistTab, label: "Public" },
  { id: "liked" as PlaylistTab, label: "Liked" },
];

const GENRES: Genre[] = ["All", "Rock", "Pop", "Hip-Hop", "Indie", "R&B", "Electronic"];

interface LibraryScreenProps {
  initialTab?: LibraryTab;
}

export default function LibraryScreen({ initialTab = "artists" }: LibraryScreenProps) {
  const [activeTab, setActiveTab] = useState<LibraryTab>(initialTab);
  const [artistSearch, setArtistSearch] = useState("");
  const [albumSearch, setAlbumSearch] = useState("");
  const [albumGenre, setAlbumGenre] = useState<Genre>("All");
  const [playlistTab, setPlaylistTab] = useState<PlaylistTab>("my");
  const { push } = useAppNavigation();

  const filteredArtists = ARTISTS.filter((a) =>
    a.name.toLowerCase().includes(artistSearch.toLowerCase())
  );

  const filteredAlbums = ALBUMS.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(albumSearch.toLowerCase()) ||
      a.artist.toLowerCase().includes(albumSearch.toLowerCase());
    const matchesGenre = albumGenre === "All" || a.genre === albumGenre;
    return matchesSearch && matchesGenre;
  });

  const filteredPlaylists = PLAYLISTS.filter((p) =>
    playlistTab === "liked" ? p.visibility === "liked" : p.visibility === playlistTab
  );

  return (
    <View style={{ flex: 1 }}>
      <SubTabBar tabs={LIBRARY_TABS} active={activeTab} onTab={setActiveTab} />

      {activeTab === "artists" && (
        <FlatList
          data={filteredArtists}
          keyExtractor={(item) => item.id}
          numColumns={3}
          ListHeaderComponent={
            <>
              <SectionHeader title="Artists" />
              <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                <SearchBar
                  placeholder="Search artists..."
                  value={artistSearch}
                  onChange={setArtistSearch}
                />
              </View>
            </>
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          columnWrapperStyle={{ gap: 16 }}
          renderItem={({ item: artist }) => (
            <TouchableOpacity
              style={styles.artistItem}
              activeOpacity={0.7}
              onPress={() => push({ screen: "artist", id: artist.id })}
            >
              <View style={[styles.artistImageWrap, nbShadow]}>
                <Image source={{ uri: artist.image }} style={styles.squareImage} />
              </View>
              <Text style={styles.artistName} numberOfLines={1}>
                {artist.name}
              </Text>
              <Text style={styles.mutedTiny}>{artist.albumCount} albums</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {activeTab === "albums" && (
        <FlatList
          data={filteredAlbums}
          keyExtractor={(item) => item.id}
          numColumns={3}
          ListHeaderComponent={
            <>
              <SectionHeader title="Albums" />
              <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                <SearchBar
                  placeholder="Search albums..."
                  value={albumSearch}
                  onChange={setAlbumSearch}
                />
              </View>
              <ChipRow>
                {GENRES.map((g) => (
                  <FilterChip
                    key={g}
                    label={g}
                    active={albumGenre === g}
                    onPress={() => setAlbumGenre(g)}
                  />
                ))}
              </ChipRow>
            </>
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item: album }) => (
            <TouchableOpacity
              style={styles.albumItem}
              activeOpacity={0.7}
              onPress={() => push({ screen: "album", id: album.id })}
            >
              <View style={styles.albumImageWrap}>
                <Image source={{ uri: album.image }} style={styles.squareImage} />
              </View>
              <Text style={styles.albumTitle} numberOfLines={1}>
                {album.title}
              </Text>
              <Text style={styles.mutedTiny}>{album.artist}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {activeTab === "playlists" && (
        <FlatList
          data={filteredPlaylists}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <SectionHeader title="Playlists" />
              <View style={styles.playlistTabsRow}>
                {PLAYLIST_TABS.map(({ id, label }) => {
                  const isActive = playlistTab === id;
                  return (
                    <TouchableOpacity
                      key={id}
                      onPress={() => setPlaylistTab(id)}
                      style={[
                        styles.playlistTabBtn,
                        { backgroundColor: isActive ? colors.accent : colors.surface },
                      ]}
                    >
                      <Text
                        style={[
                          styles.playlistTabLabel,
                          { color: isActive ? colors.white : colors.ink },
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          renderItem={({ item: playlist, index }) => (
            <TouchableOpacity
              style={[
                styles.playlistRow,
                {
                  borderTopWidth: index === 0 ? 2 : 1,
                  borderTopColor: index === 0 ? colors.ink : "#ddd",
                  borderBottomWidth: index === filteredPlaylists.length - 1 ? 2 : 0,
                  borderBottomColor: colors.ink,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => push({ screen: "playlist", id: playlist.id })}
            >
              <Image source={{ uri: playlist.image }} style={styles.playlistImage} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.playlistName} numberOfLines={1}>
                  {playlist.name}
                </Text>
                <Text style={styles.mutedTiny}>{playlist.trackIds.length} tracks</Text>
              </View>
              <ChevronRightIcon size={16} color={colors.muted} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  squareImage: { width: "100%", height: "100%", resizeMode: "cover" },
  artistItem: { flex: 1 / 3, alignItems: "center", marginBottom: 16 },
  artistImageWrap: {
    width: "100%",
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: colors.ink,
    overflow: "hidden",
  },
  artistName: {
    fontFamily: fonts.displayBold,
    fontSize: 12,
    color: colors.ink,
    marginTop: 8,
    textAlign: "center",
  },
  mutedTiny: { fontFamily: fonts.body, fontSize: 10, color: colors.muted, marginTop: 1, textAlign: "center" },
  albumItem: { flex: 1 / 3, marginBottom: 12 },
  albumImageWrap: { width: "100%", aspectRatio: 1, borderWidth: 2, borderColor: colors.ink, overflow: "hidden" },
  albumTitle: { fontFamily: fonts.displayBold, fontSize: 11, color: colors.ink, marginTop: 6 },
  playlistTabsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  playlistTabBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 2, borderColor: colors.ink },
  playlistTabLabel: { fontFamily: fonts.bodySemibold, fontSize: 13 },
  playlistRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  playlistImage: { width: 48, height: 48, borderWidth: 2, borderColor: colors.ink },
  playlistName: { fontFamily: fonts.displayBold, fontSize: 14, color: colors.ink },
});
