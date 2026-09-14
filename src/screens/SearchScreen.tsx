import React, { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from "react-native";
import { SearchBar, SegmentedControl } from "../components";
import { SmartphoneIcon, GlobeIcon, MusicNoteIcon, CloseIcon } from "../icons";
import { useTheme, Palette, fonts } from "../theme";
import { FadeIn, AnimatedPressable } from "../motion";
import { searchLocal, searchGlobal, SearchScope } from "../search";
import { SearchResult, LocalTrack } from "../data";

interface SearchScreenProps {
  localTracks: LocalTrack[];
  onClose: () => void;
}

export default function SearchScreen({ localTracks, onClose }: SearchScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [scope, setScope] = useState<SearchScope>("local");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    if (scope === "local") {
      setLoading(false);
      setResults(searchLocal(query, localTracks));
      return;
    }

    setLoading(true);
    searchGlobal(query).then((r) => {
      if (requestId.current === id) {
        setResults(r);
        setLoading(false);
      }
    });
  }, [query, scope, localTracks]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <SearchBar
            placeholder={scope === "local" ? "Search your library..." : "Search online..."}
            value={query}
            onChange={setQuery}
            autoFocus
          />
        </View>
        <AnimatedPressable onPress={onClose} style={{ padding: 10 }} hitSlop={8}>
          <CloseIcon size={20} color={colors.ink} />
        </AnimatedPressable>
      </View>

      <View style={styles.segmentWrap}>
        <SegmentedControl
          options={[
            { id: "local", label: "This device", Icon: SmartphoneIcon },
            { id: "global", label: "Online", Icon: GlobeIcon },
          ]}
          active={scope}
          onChange={(s) => setScope(s as SearchScope)}
        />
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>Searching online…</Text>
        </View>
      )}

      {!loading && query.trim().length === 0 && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>
            Search {scope === "local" ? "artists, albums, playlists and songs on this device" : "the online catalog (demo data)"}
          </Text>
        </View>
      )}

      {!loading && query.trim().length > 0 && results.length === 0 && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No results for "{query}"</Text>
        </View>
      )}

      <FadeIn visible={!loading} style={{ flex: 1 }}>
        <FlatList
          data={loading ? [] : results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.rowImage} />
              ) : (
                <View style={[styles.rowImage, styles.rowImageFallback]}>
                  <MusicNoteIcon size={18} color={colors.white} />
                </View>
              )}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.rowSubtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
              <Text style={styles.rowKind}>{item.kind}</Text>
            </View>
          )}
        />
      </FadeIn>
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.ground },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    segmentWrap: { paddingHorizontal: 16, paddingBottom: 12 },
    loadingRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
    loadingText: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
    emptyWrap: { paddingHorizontal: 32, paddingTop: 24 },
    emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, textAlign: "center", lineHeight: 20 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 10,
    },
    rowImage: { width: 44, height: 44, borderWidth: 2, borderColor: colors.border },
    rowImageFallback: { backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
    rowTitle: { fontFamily: fonts.displayBold, fontSize: 14, color: colors.ink },
    rowSubtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
    rowKind: {
      fontFamily: fonts.monoSemibold,
      fontSize: 10,
      color: colors.muted,
      textTransform: "uppercase",
    },
  });
}
