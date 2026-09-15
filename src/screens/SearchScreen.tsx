import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SearchBar, TopBar, ChipRow, FilterChip } from "../components";
import { TrackRow } from "../widgets/TrackRow";
import { useAppNavigation } from "../navigation/NavigationContext";
import { usePlayer } from "../player/PlayerContext";
import { searchLocal, searchGlobal, groupSearchResults, SearchScope } from "../search";
import { DEMO_LOCAL_TRACKS, LocalTrack, SearchResult } from "../data";
import { DeviceStorageIcon, GlobeIcon } from "../icons";
import { colors, fonts, nbShadowSm } from "../theme";

type Category = "All" | "Tracks" | "Artists" | "Albums" | "Playlists";
const CATEGORIES: Category[] = ["All", "Tracks", "Artists", "Albums", "Playlists"];

interface SearchScreenProps {
  onBack: () => void;
  localTracks?: LocalTrack[];
}

export default function SearchScreen({ onBack, localTracks = DEMO_LOCAL_TRACKS }: SearchScreenProps) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("local");
  const [category, setCategory] = useState<Category>("All");
  const [globalResults, setGlobalResults] = useState<SearchResult[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(false);

  const { push } = useAppNavigation();
  const { currentTrack, isPlaying, playTrack, isLiked, toggleLike } = usePlayer();

  const q = query.trim();

  // Local search is synchronous
  const localResults = useMemo(() => {
    if (!q || scope !== "local") return [];
    return searchLocal(q, localTracks);
  }, [q, scope, localTracks]);

  // Global search is asynchronous with simulated network lookup
  useEffect(() => {
    if (!q || scope !== "global") {
      setGlobalResults([]);
      setLoadingGlobal(false);
      return;
    }

    let active = true;
    setLoadingGlobal(true);

    searchGlobal(q)
      .then((res) => {
        if (active) {
          setGlobalResults(res);
          setLoadingGlobal(false);
        }
      })
      .catch(() => {
        if (active) {
          setGlobalResults([]);
          setLoadingGlobal(false);
        }
      });

    return () => {
      active = false;
    };
  }, [q, scope]);

  const rawResults = scope === "local" ? localResults : globalResults;
  const grouped = useMemo(() => groupSearchResults(rawResults), [rawResults]);

  const filteredTracks = useMemo(() => {
    if (category !== "All" && category !== "Tracks") return [];
    return grouped.tracks;
  }, [category, grouped.tracks]);

  const filteredArtists = useMemo(() => {
    if (category !== "All" && category !== "Artists") return [];
    return grouped.artists;
  }, [category, grouped.artists]);

  const filteredAlbums = useMemo(() => {
    if (category !== "All" && category !== "Albums") return [];
    return grouped.albums;
  }, [category, grouped.albums]);

  const filteredPlaylists = useMemo(() => {
    if (category !== "All" && category !== "Playlists") return [];
    return grouped.playlists;
  }, [category, grouped.playlists]);

  const totalResultsCount =
    filteredTracks.length +
    filteredArtists.length +
    filteredAlbums.length +
    filteredPlaylists.length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <TopBar title="Search" onBack={onBack} />

      {/* Scope Selector: Local vs Global */}
      <View style={styles.scopeBar}>
        <TouchableOpacity
          style={[styles.scopeBtn, scope === "local" && styles.scopeBtnActive]}
          onPress={() => setScope("local")}
          activeOpacity={0.7}
        >
          <DeviceStorageIcon size={16} color={scope === "local" ? colors.white : colors.ink} />
          <Text
            style={[
              styles.scopeBtnText,
              { color: scope === "local" ? colors.white : colors.ink },
            ]}
          >
            Local Library
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.scopeBtn, scope === "global" && styles.scopeBtnActive]}
          onPress={() => setScope("global")}
          activeOpacity={0.7}
        >
          <GlobeIcon size={16} color={scope === "global" ? colors.white : colors.ink} />
          <Text
            style={[
              styles.scopeBtnText,
              { color: scope === "global" ? colors.white : colors.ink },
            ]}
          >
            Global Catalog
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 }}>
        <SearchBar
          placeholder={
            scope === "local"
              ? "Search local tracks, artists, albums..."
              : "Search online streaming catalog & hits..."
          }
          value={query}
          onChange={setQuery}
          autoFocus
        />
      </View>

      {/* Category filter chips */}
      {q.length > 0 && (
        <ChipRow>
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              active={category === cat}
              onPress={() => setCategory(cat)}
            />
          ))}
        </ChipRow>
      )}

      {/* Loading state for global search */}
      {loadingGlobal && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.loadingText}>Searching online catalog...</Text>
        </View>
      )}

      {/* Empty query guidance */}
      {!q && (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            {scope === "local" ? (
              <DeviceStorageIcon size={32} color={colors.accent} />
            ) : (
              <GlobeIcon size={32} color={colors.accent} />
            )}
          </View>
          <Text style={styles.emptyTitle}>
            {scope === "local" ? "Search Local Library" : "Search Global Catalog"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {scope === "local"
              ? "Search across your device audio files, built-in artists, albums, and playlists."
              : "Search worldwide top hits, global artists, trending albums, and viral charts."}
          </Text>
        </View>
      )}

      {/* No results */}
      {q && !loadingGlobal && totalResultsCount === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No results in {scope === "local" ? "Local" : "Global"}</Text>
          <Text style={styles.emptySubtitle}>
            {scope === "local"
              ? `No local matches for "${query}". Try switching to "Global Catalog".`
              : `No global matches for "${query}". Try a different search term.`}
          </Text>
        </View>
      )}

      {/* Results content */}
      {q && totalResultsCount > 0 && (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Artists */}
          {filteredArtists.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Artists</Text>
              {filteredArtists.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.resultRow}
                  onPress={() => push({ screen: "artist", id: item.entityId ?? item.id })}
                  activeOpacity={0.65}
                >
                  <Image source={{ uri: item.image }} style={styles.circleImage} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.resultTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
                  </View>
                  <View style={styles.sourceTag}>
                    <Text style={styles.sourceTagText}>{item.source}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Albums */}
          {filteredAlbums.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Albums</Text>
              {filteredAlbums.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.resultRow}
                  onPress={() => push({ screen: "album", id: item.entityId ?? item.id })}
                  activeOpacity={0.65}
                >
                  <Image source={{ uri: item.image }} style={styles.squareImage} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.resultTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
                  </View>
                  <View style={styles.sourceTag}>
                    <Text style={styles.sourceTagText}>{item.source}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Playlists */}
          {filteredPlaylists.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Playlists</Text>
              {filteredPlaylists.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.resultRow}
                  onPress={() => push({ screen: "playlist", id: item.entityId ?? item.id })}
                  activeOpacity={0.65}
                >
                  <Image source={{ uri: item.image }} style={styles.squareImage} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.resultTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
                  </View>
                  <View style={styles.sourceTag}>
                    <Text style={styles.sourceTagText}>{item.source}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Tracks */}
          {filteredTracks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Tracks</Text>
              {filteredTracks.map((item) => {
                if (!item.track) return null;
                const track = item.track;
                const trackList = filteredTracks
                  .map((r) => r.track)
                  .filter((t): t is NonNullable<typeof t> => Boolean(t));
                return (
                  <TrackRow
                    key={item.id}
                    track={track}
                    isActive={currentTrack?.id === track.id}
                    isPlaying={isPlaying}
                    liked={isLiked(track.id)}
                    onToggleLike={() => toggleLike(track.id)}
                    onPress={() => playTrack(track, trackList)}
                  />
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scopeBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 8,
  },
  scopeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    paddingVertical: 8,
  },
  scopeBtnActive: {
    backgroundColor: colors.accent,
  },
  scopeBtnText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
  },
  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: colors.ink,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 19,
  },
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
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  circleImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  squareImage: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  resultTitle: { fontFamily: fonts.displayBold, fontSize: 13, color: colors.ink },
  resultSubtitle: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 1 },
  sourceTag: {
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sourceTagText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.muted,
    textTransform: "uppercase",
  },
});
