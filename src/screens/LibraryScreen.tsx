import React, { useMemo, useState } from "react";
import { Alert, FlatList, Linking, Text, View } from "react-native";
import { EmptyState, IconButton, LargeHeader, PressableScale, SearchField, TabBar } from "../ui";
import { TrackRow } from "../widgets/TrackRow";
import { TrackActionsSheet } from "../widgets/TrackActionsSheet";
import { PromptSheet } from "../widgets/PromptSheet";
import { Artwork, PlaylistCover } from "../widgets/Artwork";
import { MusicLoadingIndicator } from "../widgets/MusicLoadingIndicator";
import { Track } from "../data";
import { FolderIcon, PlusIcon, ScanIcon } from "../icons";
import { usePlayer } from "../player/PlayerContext";
import { fonts, radius, stroke, ThemeContextValue, useTheme, useThemedStyles } from "../theme";
import { deriveAlbums, deriveArtists, LIKED_PLAYLIST_ID, library, useLibrary } from "../library";
import { scanDeviceMusic, ScanPermissionState } from "../localMusic";
import { plural } from "../format";

type LibraryTab = "artists" | "albums" | "playlists" | "storage";
type PlaylistFilter = "all" | "mine" | "smart";

const LIBRARY_TABS: { id: LibraryTab; label: string }[] = [
  { id: "artists", label: "Artists" },
  { id: "albums", label: "Albums" },
  { id: "playlists", label: "Playlists" },
  { id: "storage", label: "On device" },
];

const PLAYLIST_FILTERS: { id: PlaylistFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "mine", label: "Mine" },
  { id: "smart", label: "Smart" },
];

interface LibraryScreenProps {
  initialTab?: LibraryTab;
  onGoToArtist: (id: string) => void;
  onGoToAlbum: (id: string) => void;
  onGoToPlaylist: (id: string) => void;
}

export default function LibraryScreen({ initialTab = "artists", onGoToArtist, onGoToAlbum, onGoToPlaylist }: LibraryScreenProps) {
  const { colors, shadows } = useTheme();
  const s = useThemedStyles(makeStyles);
  const [activeTab, setActiveTab] = useState<LibraryTab>(initialTab);

  const [artistSearch, setArtistSearch] = useState("");
  const [albumSearch, setAlbumSearch] = useState("");
  const [playlistFilter, setPlaylistFilter] = useState<PlaylistFilter>("all");
  const [storageSearch, setStorageSearch] = useState("");
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);

  const [scanning, setScanning] = useState(false);
  const [permission, setPermission] = useState<ScanPermissionState | null>(null);
  const [scanErrorDetail, setScanErrorDetail] = useState<string | null>(null);
  const [menuTrack, setMenuTrack] = useState<Track | null>(null);

  const { currentTrack, isPlaying, playTrack } = usePlayer();
  const { likedTracks, isLiked, playlists, smartPlaylists, deviceTracks, allTracks } = useLibrary();

  const artists = useMemo(() => deriveArtists(allTracks), [allTracks]);
  const albums = useMemo(() => deriveAlbums(allTracks), [allTracks]);

  async function handleScan() {
    setScanning(true);
    setPermission(null);
    setScanErrorDetail(null);
    try {
      const result = await scanDeviceMusic();
      setPermission(result.permission);
      if (result.permission === "unavailable" && result.errorDetail) {
        setScanErrorDetail(result.errorDetail);
        Alert.alert("Scan failed", result.errorDetail);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setPermission("unavailable");
      setScanErrorDetail(message);
      Alert.alert("Scan failed", message);
    } finally {
      setScanning(false);
    }
  }

  function submitNewPlaylist(name: string) {
    setCreatingPlaylist(false);
    const p = library.createPlaylist(name);
    onGoToPlaylist(p.id);
  }

  const filteredArtists = artists.filter((a) => a.name.toLowerCase().includes(artistSearch.toLowerCase()));

  const filteredAlbums = albums.filter(
    (a) => a.title.toLowerCase().includes(albumSearch.toLowerCase()) || a.artist.toLowerCase().includes(albumSearch.toLowerCase())
  );

  const likedRow = { id: LIKED_PLAYLIST_ID, name: "Liked Songs", count: likedTracks.length, images: likedTracks.slice(0, 4).map((t) => t.image), kind: "liked" as const };
  const userRows = playlists.map((p) => ({
    id: p.id,
    name: p.name,
    count: p.trackIds.length,
    images: p.trackIds
      .map((id) => allTracks.find((t) => t.id === id)?.image)
      .filter((x): x is string => !!x)
      .slice(0, 4),
    kind: "user" as const,
  }));
  const smartRows = smartPlaylists.map((p) => ({ id: p.id, name: p.name, count: p.trackIds.length, images: [p.image], kind: "smart" as const }));

  const allPlaylistRows = [likedRow, ...userRows, ...smartRows];
  const filteredPlaylists =
    playlistFilter === "mine" ? [likedRow, ...userRows] : playlistFilter === "smart" ? smartRows : allPlaylistRows;

  const filteredDeviceTracks = deviceTracks.filter(
    (t) => t.title.toLowerCase().includes(storageSearch.toLowerCase()) || t.artist.toLowerCase().includes(storageSearch.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      <LargeHeader title="Library" />
      <TabBar tabs={LIBRARY_TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === "artists" && (
        <FlatList
          data={filteredArtists}
          keyExtractor={(item) => item.id}
          numColumns={3}
          ListHeaderComponent={
            <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 }}>
              <SearchField placeholder="Search artists" value={artistSearch} onChange={setArtistSearch} />
            </View>
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          columnWrapperStyle={{ gap: 4 }}
          renderItem={({ item: artist }) => (
            <PressableScale style={s.artistItem} scaleTo={0.95} onPress={() => onGoToArtist(artist.id)}>
              <Artwork uri={artist.image} seed={artist.id} circle style={{ ...shadows.sm }} />
              <Text style={s.artistName} numberOfLines={1}>
                {artist.name}
              </Text>
              <Text style={s.mutedTiny}>{plural(artist.albumCount, "album")}</Text>
            </PressableScale>
          )}
          ListEmptyComponent={<EmptyState title="No artists found" message="Try a different search." />}
        />
      )}

      {activeTab === "albums" && (
        <FlatList
          data={filteredAlbums}
          keyExtractor={(item) => item.id}
          numColumns={3}
          ListHeaderComponent={
            <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10, gap: 10 }}>
              <SearchField placeholder="Search albums" value={albumSearch} onChange={setAlbumSearch} />
            </View>
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          columnWrapperStyle={{ gap: 4 }}
          renderItem={({ item: album }) => (
            <PressableScale style={s.albumItem} scaleTo={0.96} onPress={() => onGoToAlbum(album.id)}>
              <Artwork uri={album.image} seed={album.id} />
              <Text style={s.albumTitle} numberOfLines={1}>
                {album.title}
              </Text>
              <Text style={s.mutedTiny}>{album.artist}</Text>
            </PressableScale>
          )}
          ListEmptyComponent={<EmptyState title="No albums found" message="Try a different search." />}
        />
      )}

      {activeTab === "playlists" && (
        <FlatList
          data={filteredPlaylists}
          keyExtractor={(item) => item.id}
          numColumns={2}
          ListHeaderComponent={
            <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12, gap: 12 }}>
              <View style={s.rowBetween}>
                <TabBar tabs={PLAYLIST_FILTERS} active={playlistFilter} onChange={setPlaylistFilter} />
                <IconButton label="New playlist" variant="solid" icon={<PlusIcon size={18} color={colors.ink} />} onPress={() => setCreatingPlaylist(true)} />
              </View>
            </View>
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          columnWrapperStyle={{ gap: 4 }}
          renderItem={({ item: row }) => (
            <PressableScale style={s.playlistTile} scaleTo={0.96} onPress={() => onGoToPlaylist(row.id)}>
              <PlaylistCover images={row.images} seed={row.id} kind={row.kind === "liked" ? "liked" : "playlist"} />
              <Text style={s.albumTitle} numberOfLines={1}>
                {row.name}
              </Text>
              <Text style={s.mutedTiny}>{plural(row.count, "track")}</Text>
            </PressableScale>
          )}
          ListEmptyComponent={<EmptyState title="No playlists" message="Create one to get started." />}
        />
      )}

      {activeTab === "storage" && (
        <FlatList
          data={scanning ? [] : filteredDeviceTracks}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View>
              <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 }}>
                <Text style={s.storageIntro}>Finds audio files already on your phone and adds them here — nothing is uploaded anywhere.</Text>
              </View>
              <View style={s.scanRow}>
                <PressableScale
                  onPress={handleScan}
                  disabled={scanning}
                  scaleTo={0.97}
                  style={[s.scanBtn, scanning && { opacity: 0.7 }]}
                >
                  <ScanIcon size={16} color={colors.onAccent} />
                  <Text style={s.scanBtnLabel}>{scanning ? "Scanning…" : deviceTracks.length > 0 ? "Rescan device" : "Scan for music"}</Text>
                </PressableScale>
                {deviceTracks.length > 0 && !scanning && (
                  <View style={s.storageCountPill}>
                    <FolderIcon size={13} color={colors.ink} />
                    <Text style={s.storageCountText}>{plural(deviceTracks.length, "track")}</Text>
                  </View>
                )}
              </View>
              {!scanning && deviceTracks.length > 0 && (
                <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
                  <SearchField placeholder="Search on-device tracks" value={storageSearch} onChange={setStorageSearch} />
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            scanning ? (
              <MusicLoadingIndicator label="Scanning your device for music…" />
            ) : permission === "unavailable" ? (
              <EmptyState
                title="Scan needs a dev build"
                message={
                  scanErrorDetail
                    ? `Scan failed: ${scanErrorDetail}`
                    : "Device scanning uses a native module that isn't available in Expo Go — it needs a development or production build."
                }
              />
            ) : permission === "denied" ? (
              <EmptyState
                title="Permission needed"
                message="nukeop needs permission to see your music to scan this device."
                action={
                  <PressableScale onPress={() => Linking.openSettings()} style={s.settingsBtn}>
                    <Text style={s.scanBtnLabel}>Open settings</Text>
                  </PressableScale>
                }
              />
            ) : (
              <EmptyState
                icon={<FolderIcon size={26} color={colors.accent} />}
                title={deviceTracks.length === 0 ? "Nothing scanned yet" : "No matches"}
                message={deviceTracks.length === 0 ? 'Tap "Scan for music" to find audio files on this device.' : "Try a different search."}
              />
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
              onToggleLike={() => library.toggleLike(track)}
              onPress={() => playTrack(track, filteredDeviceTracks)}
              onMore={() => setMenuTrack(track)}
            />
          )}
        />
      )}

      <TrackActionsSheet visible={!!menuTrack} track={menuTrack} onClose={() => setMenuTrack(null)} onGoToArtist={onGoToArtist} onGoToAlbum={onGoToAlbum} />
      <PromptSheet
        visible={creatingPlaylist}
        title="New playlist"
        placeholder="Playlist name"
        confirmLabel="Create"
        onCancel={() => setCreatingPlaylist(false)}
        onSubmit={submitNewPlaylist}
      />
    </View>
  );
}

const makeStyles = ({ colors, shadows }: ThemeContextValue) => ({
  rowBetween: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const },
  artistItem: { flex: 1 / 3, alignItems: "center" as const, marginBottom: 18, paddingHorizontal: 4 },
  artistName: { fontFamily: fonts.bodySemibold, fontSize: 12.5, color: colors.ink, marginTop: 8, textAlign: "center" as const },
  mutedTiny: { fontFamily: fonts.bodyMedium, fontSize: 10.5, color: colors.muted, marginTop: 1, textAlign: "center" as const },
  albumItem: { flex: 1 / 3, marginBottom: 16, paddingHorizontal: 4 },
  albumTitle: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.ink, marginTop: 7 },
  playlistTile: { flex: 1 / 2, marginBottom: 18, paddingHorizontal: 4 },
  storageIntro: { fontFamily: fonts.bodyMedium, fontSize: 12.5, lineHeight: 17, color: colors.muted },
  scanRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10, marginHorizontal: 20, marginTop: 10, marginBottom: 10 },
  scanBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    borderWidth: stroke.base,
    borderColor: colors.outline,
    paddingHorizontal: 18,
    paddingVertical: 11,
    ...shadows.sm,
  },
  scanBtnLabel: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: colors.onAccent },
  storageCountPill: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: stroke.thin,
    borderColor: colors.outline,
    backgroundColor: colors.surfaceAlt,
  },
  storageCountText: { fontFamily: fonts.bodyBold, fontSize: 11.5, color: colors.ink },
  settingsBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    borderWidth: stroke.base,
    borderColor: colors.outline,
    paddingHorizontal: 18,
    paddingVertical: 10,
    ...shadows.sm,
  },
});
