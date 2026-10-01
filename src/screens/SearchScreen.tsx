import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Header, IconButton, PressableScale, SearchField } from "../ui";
import { TrackRow } from "../widgets/TrackRow";
import { TrackActionsSheet } from "../widgets/TrackActionsSheet";
import { Artwork, PlaylistCover } from "../widgets/Artwork";
import { useAppNavigation } from "../navigation/NavigationContext";
import { usePlayer } from "../player/PlayerContext";
import { fonts, radius, ThemeContextValue, useTheme, useThemedStyles } from "../theme";
import { deriveAlbums, deriveArtists, library, LIKED_PLAYLIST_ID, useLibrary } from "../library";
import { ClockIcon, CloseIcon, ListPlusIcon, YouTubeIcon } from "../icons";
import type { Track } from "../data";
import { plural, formatDuration } from "../format";
import { isPluginEnabled } from "../plugins";
import { useSettings } from "../settings";
import { resolveYouTubeTrack, searchYouTube, YouTubeSearchResult, YouTubeSourceError, YouTubeSourceSettings } from "../plugins/youtubeSource";

interface SearchScreenProps {
  onBack: () => void;
  onGoToArtist: (id: string) => void;
  onGoToAlbum: (id: string) => void;
  onGoToPlaylist: (id: string) => void;
}

export default function SearchScreen({ onBack, onGoToArtist, onGoToAlbum, onGoToPlaylist }: SearchScreenProps) {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);
  const [query, setQuery] = useState("");
  const { currentTrack, isPlaying, playTrack, addToQueue } = usePlayer();
  const { isLiked, likedTracks, playlists, smartPlaylists, allTracks, searches } = useLibrary();
  const [menuTrack, setMenuTrack] = useState<Track | null>(null);
  const settings = useSettings();
  const youtubeEnabled = isPluginEnabled("youtube");
  const ytSettings: YouTubeSourceSettings = useMemo(
    () => ({ mode: settings.youtubeSourceMode, serverUrl: settings.youtubeServerUrl }),
    [settings.youtubeSourceMode, settings.youtubeServerUrl]
  );

  const q = query.trim().toLowerCase();
  const hasQuery = q.length > 0;

  // ── YouTube Source plugin ────────────────────────────────────────────
  const [ytResults, setYtResults] = useState<YouTubeSearchResult[]>([]);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);
  const [ytBusyId, setYtBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!youtubeEnabled || !hasQuery) {
      setYtResults([]);
      setYtError(null);
      return;
    }
    let cancelled = false;
    setYtLoading(true);
    setYtError(null);
    const timer = setTimeout(async () => {
      try {
        const results = await searchYouTube(query, ytSettings);
        if (!cancelled) setYtResults(results);
      } catch (e) {
        if (!cancelled) {
          setYtResults([]);
          setYtError(e instanceof YouTubeSourceError ? e.message : "YouTube search failed.");
        }
      } finally {
        if (!cancelled) setYtLoading(false);
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeEnabled, query, ytSettings]);

  async function playYouTubeResult(result: YouTubeSearchResult) {
    setYtBusyId(result.id);
    try {
      const track = await resolveYouTubeTrack(result, ytSettings);
      playTrack(track, [track]);
    } catch (e) {
      setYtError(e instanceof YouTubeSourceError ? e.message : "Couldn't play that video.");
    } finally {
      setYtBusyId(null);
    }
  }

  async function queueYouTubeResult(result: YouTubeSearchResult) {
    setYtBusyId(result.id);
    try {
      const track = await resolveYouTubeTrack(result, ytSettings);
      addToQueue(track);
    } catch (e) {
      setYtError(e instanceof YouTubeSourceError ? e.message : "Couldn't add that video to the queue.");
    } finally {
      setYtBusyId(null);
    }
  }

  const results = useMemo(() => {
    if (!q) return { artists: [], albums: [], playlists: [], tracks: [] as Track[] };
    const playlistMatches = [
      ...(likedTracks.length > 0 && "liked songs".includes(q) ? [{ id: LIKED_PLAYLIST_ID, name: "Liked Songs", count: likedTracks.length, images: likedTracks.slice(0, 4).map((t) => t.image), kind: "liked" as const }] : []),
      ...playlists.filter((p) => p.name.toLowerCase().includes(q)).map((p) => ({ id: p.id, name: p.name, count: p.trackIds.length, images: p.trackIds.map((id) => allTracks.find((t) => t.id === id)?.image).filter((x): x is string => !!x), kind: "user" as const })),
      ...smartPlaylists.filter((p) => p.name.toLowerCase().includes(q)).map((p) => ({ id: p.id, name: p.name, count: p.trackIds.length, images: [p.image], kind: "smart" as const })),
    ].slice(0, 5);

    return {
      artists: deriveArtists(allTracks).filter((a) => a.name.toLowerCase().includes(q)).slice(0, 5),
      albums: deriveAlbums(allTracks).filter((a) => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)).slice(0, 5),
      playlists: playlistMatches,
      tracks: allTracks.filter((t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)).slice(0, 10),
    };
  }, [q, allTracks, likedTracks, playlists, smartPlaylists]);

  const hasResults = results.artists.length + results.albums.length + results.playlists.length + results.tracks.length > 0;

  function commitSearch(text: string) {
    library.addSearch(text);
  }

  return (
    <View style={{ flex: 1 }}>
      <Header title="Search" onBack={onBack} />
      <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
        <SearchField placeholder="Search artists, albums, playlists, tracks" value={query} onChange={setQuery} autoFocus onSubmit={() => commitSearch(query)} />
      </View>

      {!hasQuery && (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8 }} keyboardShouldPersistTaps="handled">
          {searches.length > 0 ? (
            <>
              <View style={s.recentHeader}>
                <Text style={s.sectionLabel}>Recent searches</Text>
                <TouchableOpacity onPress={() => library.clearSearches()} hitSlop={8}>
                  <Text style={s.clearLabel}>Clear</Text>
                </TouchableOpacity>
              </View>
              {searches.map((term) => (
                <TouchableOpacity key={term} style={s.recentRow} onPress={() => setQuery(term)} activeOpacity={0.7}>
                  <ClockIcon size={16} color={colors.faint} />
                  <Text style={s.recentText} numberOfLines={1}>
                    {term}
                  </Text>
                  <TouchableOpacity onPress={() => library.removeSearch(term)} hitSlop={10}>
                    <CloseIcon size={14} color={colors.faint} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={s.emptyState}>
              <Text style={s.emptyTitle}>Find something to play</Text>
              <Text style={s.emptySubtitle}>Search across your whole library{youtubeEnabled ? " and YouTube" : ""}</Text>
            </View>
          )}
        </ScrollView>
      )}

      {hasQuery && !hasResults && !youtubeEnabled && (
        <View style={s.emptyState}>
          <Text style={s.emptyTitle}>No results for "{query}"</Text>
          <Text style={s.emptySubtitle}>Try a different search term</Text>
        </View>
      )}

      {hasQuery && (hasResults || youtubeEnabled) && (
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled" onScrollBeginDrag={() => commitSearch(query)}>
          {results.artists.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionLabelPad}>Artists</Text>
              {results.artists.map((artist) => (
                <TouchableOpacity key={artist.id} style={s.resultRow} onPress={() => onGoToArtist(artist.id)} activeOpacity={0.65}>
                  <Artwork uri={artist.image} seed={artist.id} size={44} circle />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.resultTitle} numberOfLines={1}>
                      {artist.name}
                    </Text>
                    <Text style={s.resultSubtitle}>Artist · {plural(artist.albumCount, "album")}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {results.albums.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionLabelPad}>Albums</Text>
              {results.albums.map((album) => (
                <TouchableOpacity key={album.id} style={s.resultRow} onPress={() => onGoToAlbum(album.id)} activeOpacity={0.65}>
                  <Artwork uri={album.image} seed={album.id} size={44} radius={9} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.resultTitle} numberOfLines={1}>
                      {album.title}
                    </Text>
                    <Text style={s.resultSubtitle}>Album · {album.artist}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {results.playlists.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionLabelPad}>Playlists</Text>
              {results.playlists.map((p) => (
                <TouchableOpacity key={p.id} style={s.resultRow} onPress={() => onGoToPlaylist(p.id)} activeOpacity={0.65}>
                  <PlaylistCover images={p.images} seed={p.id} size={44} radius={9} kind={p.kind === "liked" ? "liked" : "playlist"} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.resultTitle} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={s.resultSubtitle}>Playlist · {plural(p.count, "track")}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {results.tracks.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionLabelPad}>Tracks</Text>
              {results.tracks.map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  isActive={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  liked={isLiked(track.id)}
                  onToggleLike={() => library.toggleLike(track)}
                  onPress={() => {
                    commitSearch(query);
                    playTrack(track, results.tracks);
                  }}
                  onAddToQueue={() => {
                    commitSearch(query);
                    addToQueue(track);
                  }}
                  onMore={() => setMenuTrack(track)}
                />
              ))}
            </View>
          )}

          {youtubeEnabled && (
            <View style={s.section}>
              <View style={s.ytHeader}>
                <YouTubeIcon size={14} color={colors.ink} />
                <Text style={s.sectionLabelInline}>YouTube</Text>
                {ytLoading ? <ActivityIndicator size="small" color={colors.accent} /> : null}
              </View>

              {ytError ? (
                <Text style={[s.ytHint, { color: colors.danger }]}>{ytError}</Text>
              ) : ytResults.length === 0 && !ytLoading ? (
                <Text style={s.ytHint}>No YouTube results for "{query}".</Text>
              ) : (
                ytResults.map((r) => (
                  <PressableScale
                    key={r.id}
                    style={s.resultRow}
                    scaleTo={0.985}
                    onPress={() => playYouTubeResult(r)}
                    disabled={ytBusyId === r.id}
                  >
                    <Artwork uri={r.thumbnail} seed={r.id} size={44} radius={radius.sm} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={s.resultTitle} numberOfLines={1}>
                        {r.title}
                      </Text>
                      <Text style={s.resultSubtitle} numberOfLines={1}>
                        {r.channel} · {formatDuration(r.durationSeconds)}
                      </Text>
                    </View>
                    {ytBusyId === r.id ? (
                      <ActivityIndicator size="small" color={colors.accent} />
                    ) : (
                      <IconButton
                        label="Add to queue"
                        size={30}
                        icon={<ListPlusIcon size={17} color={colors.faint} />}
                        onPress={() => queueYouTubeResult(r)}
                      />
                    )}
                  </PressableScale>
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}

      <TrackActionsSheet visible={!!menuTrack} track={menuTrack} onClose={() => setMenuTrack(null)} onGoToArtist={onGoToArtist} onGoToAlbum={onGoToAlbum} />
    </View>
  );
}

const makeStyles = ({ colors }: ThemeContextValue) => ({
  emptyState: { flex: 1, alignItems: "center" as const, justifyContent: "center" as const, paddingHorizontal: 32 },
  emptyTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink, textAlign: "center" as const },
  emptySubtitle: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted, marginTop: 6, textAlign: "center" as const },
  section: { marginBottom: 8 },
  sectionLabel: { fontFamily: fonts.display, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" as const, color: colors.muted },
  sectionLabelPad: { fontFamily: fonts.display, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" as const, color: colors.muted, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 },
  recentHeader: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, marginBottom: 6 },
  clearLabel: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: colors.accent },
  recentRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12, paddingVertical: 10 },
  recentText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink },
  resultRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12, paddingHorizontal: 20, paddingVertical: 8 },
  resultTitle: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: colors.ink },
  resultSubtitle: { fontFamily: fonts.bodyMedium, fontSize: 11.5, color: colors.muted, marginTop: 1 },
  ytHeader: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 },
  sectionLabelInline: { fontFamily: fonts.display, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" as const, color: colors.muted },
  ytHint: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: colors.muted, paddingHorizontal: 20, paddingBottom: 10, lineHeight: 17 },
});
