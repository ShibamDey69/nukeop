import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, Alert } from "react-native";
import { SubTabBar, SearchBar, FilterChip, SectionHeader, ChipRow } from "../components";
import { TrackRow } from "../widgets/TrackRow";
import { MusicLoadingIndicator } from "../widgets/MusicLoadingIndicator";
import { ARTISTS, ALBUMS, PLAYLISTS, TRACKS, Track } from "../data";
import { ChevronRightIcon, ScanIcon, FolderIcon } from "../icons";
import { useAppNavigation } from "../navigation/NavigationContext";
import { usePlayer } from "../player/PlayerContext";
import { useTheme, fonts, ThemeColors } from "../theme";
import { loadCachedLocalTracks, scanDeviceMusic } from "../localMusic";

type LibraryTab = "artists" | "albums" | "playlists" | "storage";
type PlaylistTab = "my" | "public" | "liked";
type Genre = "All" | "Rock" | "Pop" | "Hip-Hop" | "Indie" | "R&B" | "Electronic";

const LIBRARY_TABS = [
  { id: "artists" as LibraryTab, label: "Artists" },
  { id: "albums" as LibraryTab, label: "Albums" },
  { id: "playlists" as LibraryTab, label: "Playlists" },
  { id: "storage" as LibraryTab, label: "Local Storage" },
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
  const styles = makeStyles(colors);
  const [activeTab, setActiveTab] = useState<LibraryTab>(initialTab);
  const [artistSearch, setArtistSearch] = useState("");
  const [albumSearch, setAlbumSearch] = useState("");
  const [albumGenre, setAlbumGenre] = useState<Genre>("All");
  const [playlistTab, setPlaylistTab] = useState<PlaylistTab>("my");
  const [storageSearch, setStorageSearch] = useState("");
  const [deviceTracks, setDeviceTracks] = useState<Track[]>([]);
  const [scanning, setScanning] = useState(false);
  const [hasScannedOnce, setHasScannedOnce] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scanUnavailable, setScanUnavailable] = useState(false);
  const { push } = useAppNavigation();
  const { currentTrack, isPlaying, isLiked, toggleLike, playTrack } = usePlayer();

  // Load whatever we found on a previous scan immediately, so the tab isn't
  // empty while the user decides whether to (re)scan.
  useEffect(() => {
    loadCachedLocalTracks().then((cached) => {
      if (cached.length > 0) {
        setDeviceTracks(cached);
        setHasScannedOnce(true);
      }
    });
  }, []);

  async function handleScan() {
    setScanning(true);
    setPermissionDenied(false);
    setScanUnavailable(false);
    try {
      const result = await scanDeviceMusic();
      if (result.permission === "unavailable") {
        setScanUnavailable(true);
      } else if (result.permission === "denied") {
        setPermissionDenied(true);
      } else {
        setDeviceTracks(result.tracks);
        setHasScannedOnce(true);
      }
    } catch (err) {
      Alert.alert("Scan failed", "Something went wrong while scanning your device for music.");
    } finally {
      setScanning(false);
    }
  }

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

  // "Local Storage" combines device tracks found by scanning (cached across
  // launches) with any liked tracks from the built-in library, so everything
  // you've told the app to keep locally lives in one filterable place.
  const likedTracks = TRACKS.filter((t) => isLiked(t.id));
  const deviceTrackIds = new Set(deviceTracks.map((t) => t.id));
  const localTracks = [...deviceTracks, ...likedTracks.filter((t) => !deviceTrackIds.has(t.id))];
  const filteredStorageTracks = localTracks.filter(
    (t) =>
      t.title.toLowerCase().includes(storageSearch.toLowerCase()) ||
      t.artist.toLowerCase().includes(storageSearch.toLowerCase())
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

      {activeTab === "storage" && (
        <FlatList
          data={scanning ? [] : filteredStorageTracks}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <SectionHeader title="Local Storage" subtitle="Music found and saved on this device" />

              <View style={styles.scanRow}>
                <TouchableOpacity
                  style={[styles.scanBtn, nbShadow, scanning && { opacity: 0.7 }]}
                  onPress={handleScan}
                  disabled={scanning}
                  activeOpacity={0.85}
                >
                  <ScanIcon size={16} color={colors.white} />
                  <Text style={styles.scanBtnLabel}>{scanning ? "Scanning..." : "Scan for music"}</Text>
                </TouchableOpacity>
                {hasScannedOnce && !scanning && (
                  <View style={styles.storageCountPill}>
                    <FolderIcon size={13} color={colors.ink} />
                    <Text style={styles.storageCountText}>{deviceTracks.length} found</Text>
                  </View>
                )}
              </View>

              {!scanning && (
                <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                  <SearchBar
                    placeholder="Search local storage..."
                    value={storageSearch}
                    onChange={setStorageSearch}
                  />
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            scanning ? (
              <MusicLoadingIndicator label="Scanning your device for music..." />
            ) : scanUnavailable ? (
              <Text style={styles.emptyText}>
                Scanning needs a custom development or production build — it isn't available in Expo Go. If
                you're already in a standalone build, try a clean rebuild (this can also mean the app needs
                updating).
              </Text>
            ) : permissionDenied ? (
              <Text style={styles.emptyText}>
                nukeop needs permission to access your music to scan this device. You can allow it from your system
                settings and try again.
              </Text>
            ) : (
              <Text style={styles.emptyText}>
                {localTracks.length === 0
                  ? "Nothing here yet — tap \"Scan for music\" to find tracks on this device, or heart a track to keep it here."
                  : "No local tracks match your search"}
              </Text>
            )
          }
          contentContainerStyle={{ paddingBottom: 16, flexGrow: 1 }}
          renderItem={({ item: track, index }) => (
            <TrackRow
              track={track}
              index={index}
              isActive={currentTrack?.id === track.id}
              isPlaying={isPlaying}
              liked={isLiked(track.id)}
              onToggleLike={() => toggleLike(track.id)}
              onPress={() => playTrack(track, filteredStorageTracks)}
            />
          )}
        />
      )}
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
    scanRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginHorizontal: 16,
      marginBottom: 12,
    },
    scanBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.accent,
      borderWidth: 2,
      borderColor: colors.ink,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    scanBtnLabel: { fontFamily: fonts.displayBold, fontSize: 13, color: colors.white },
    storageCountPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: 2,
      borderColor: colors.ink,
      backgroundColor: colors.surface,
    },
    storageCountText: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.ink },
    emptyText: {
      fontFamily: fonts.body,
      fontSize: 13,
      color: colors.muted,
      textAlign: "center",
      paddingHorizontal: 32,
      paddingTop: 24,
    },
  });
}
