import React, { useState } from "react";
import { View, Text, Image, StyleSheet, FlatList } from "react-native";
import { SubTabBar, SearchBar, FilterChip, SectionHeader, ChipRow, useResponsiveColumns } from "../components";
import { ARTISTS, ALBUMS, PLAYLISTS } from "../data";
import { ChevronRightIcon } from "../icons";
import { useTheme, Palette, fonts } from "../theme";
import { AnimatedPressable, FadeSlideIn } from "../motion";

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
  const { colors, nbShadow } = useTheme();
  const styles = createStyles(colors);
  const columns = useResponsiveColumns(3);
  const [activeTab, setActiveTab] = useState<LibraryTab>(initialTab);
  const [artistSearch, setArtistSearch] = useState("");
  const [albumSearch, setAlbumSearch] = useState("");
  const [albumGenre, setAlbumGenre] = useState<Genre>("All");
  const [playlistTab, setPlaylistTab] = useState<PlaylistTab>("my");

  const filteredArtists = ARTISTS.filter((a) => a.name.toLowerCase().includes(artistSearch.toLowerCase()));

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
      <SubTabBar tabs={LIBRARY_TABS} active={activeTab} onTab={(t) => setActiveTab(t)} />

      {activeTab === "artists" && (
        <FlatList
          key={`artists-${columns}`}
          data={filteredArtists}
          keyExtractor={(item) => item.id}
          numColumns={columns}
          ListHeaderComponent={
            <>
              <SectionHeader title="Artists" />
              <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                <SearchBar placeholder="Search artists..." value={artistSearch} onChange={setArtistSearch} />
              </View>
            </>
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          columnWrapperStyle={{ gap: 16 }}
          renderItem={({ item: artist, index }) => (
            <FadeSlideIn delay={Math.min(index, 9) * 25} style={styles.artistItem}>
              <AnimatedPressable style={{ alignItems: "center" }} scaleTo={0.95}>
                <View style={[styles.artistImageWrap, nbShadow]}>
                  <Image source={{ uri: artist.image }} style={styles.squareImage} />
                </View>
                <Text style={styles.artistName} numberOfLines={1}>
                  {artist.name}
                </Text>
                <Text style={styles.mutedTiny}>{artist.albumCount} albums</Text>
              </AnimatedPressable>
            </FadeSlideIn>
          )}
        />
      )}

      {activeTab === "albums" && (
        <FlatList
          key={`albums-${columns}`}
          data={filteredAlbums}
          keyExtractor={(item) => item.id}
          numColumns={columns}
          ListHeaderComponent={
            <>
              <SectionHeader title="Albums" />
              <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                <SearchBar placeholder="Search albums..." value={albumSearch} onChange={setAlbumSearch} />
              </View>
              <ChipRow>
                {GENRES.map((g) => (
                  <FilterChip key={g} label={g} active={albumGenre === g} onPress={() => setAlbumGenre(g)} />
                ))}
              </ChipRow>
            </>
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item: album, index }) => (
            <FadeSlideIn delay={Math.min(index, 9) * 25} style={styles.albumItem}>
              <AnimatedPressable scaleTo={0.95}>
                <View style={styles.albumImageWrap}>
                  <Image source={{ uri: album.image }} style={styles.squareImage} />
                </View>
                <Text style={styles.albumTitle} numberOfLines={1}>
                  {album.title}
                </Text>
                <Text style={styles.mutedTiny}>{album.artist}</Text>
              </AnimatedPressable>
            </FadeSlideIn>
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
                    <AnimatedPressable
                      key={id}
                      onPress={() => setPlaylistTab(id)}
                      style={[styles.playlistTabBtn, { backgroundColor: isActive ? colors.accent : colors.surface }]}
                      scaleTo={0.95}
                    >
                      <Text style={[styles.playlistTabLabel, { color: isActive ? colors.white : colors.ink }]}>
                        {label}
                      </Text>
                    </AnimatedPressable>
                  );
                })}
              </View>
            </>
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          renderItem={({ item: playlist, index }) => (
            <FadeSlideIn delay={Math.min(index, 9) * 25}>
              <AnimatedPressable
                style={[
                  styles.playlistRow,
                  {
                    borderTopWidth: index === 0 ? 2 : 1,
                    borderTopColor: index === 0 ? colors.border : "#ddd",
                    borderBottomWidth: index === filteredPlaylists.length - 1 ? 2 : 0,
                    borderBottomColor: colors.border,
                  },
                ]}
                scaleTo={0.98}
              >
                <Image source={{ uri: playlist.image }} style={styles.playlistImage} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.playlistName} numberOfLines={1}>
                    {playlist.name}
                  </Text>
                  <Text style={styles.mutedTiny}>{playlist.trackCount} tracks</Text>
                </View>
                <ChevronRightIcon size={16} color={colors.muted} />
              </AnimatedPressable>
            </FadeSlideIn>
          )}
        />
      )}
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    squareImage: { width: "100%", height: "100%", resizeMode: "cover" },
    artistItem: { flex: 1, alignItems: "center", marginBottom: 16 },
    artistImageWrap: {
      width: "100%",
      aspectRatio: 1,
      borderWidth: 2,
      borderColor: colors.border,
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
    albumItem: { flex: 1, marginBottom: 12 },
    albumImageWrap: { width: "100%", aspectRatio: 1, borderWidth: 2, borderColor: colors.border, overflow: "hidden" },
    albumTitle: { fontFamily: fonts.displayBold, fontSize: 11, color: colors.ink, marginTop: 6 },
    playlistTabsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
    playlistTabBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 2, borderColor: colors.border },
    playlistTabLabel: { fontFamily: fonts.bodySemibold, fontSize: 13 },
    playlistRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
    playlistImage: { width: 48, height: 48, borderWidth: 2, borderColor: colors.border },
    playlistName: { fontFamily: fonts.displayBold, fontSize: 14, color: colors.ink },
  });
}
