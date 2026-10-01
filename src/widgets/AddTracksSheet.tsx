import React, { useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import type { Track } from "../data";
import { CheckIcon, SearchIcon } from "../icons";
import { fonts, radius, stroke, ThemeContextValue, useTheme, useThemedStyles } from "../theme";
import { library, useLibrary } from "../library";
import { Artwork } from "./Artwork";
import { PressableScale } from "../ui";
import { ActionSheet } from "./ActionSheet";

interface AddTracksSheetProps {
  visible: boolean;
  onClose: () => void;
  playlistId: string;
  /** Track ids already in the playlist, for the check state. */
  existingIds: Set<string>;
}

const makeStyles = ({ colors }: ThemeContextValue) => ({
  searchWrap: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10, marginHorizontal: 20, marginBottom: 10, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, borderWidth: stroke.base, borderColor: colors.outline, paddingHorizontal: 14, height: 44 },
  input: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14.5, color: colors.ink, padding: 0 },
  row: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12, paddingHorizontal: 20, paddingVertical: 9 },
  title: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.ink },
  subtitle: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.muted, marginTop: 1 },
  check: { width: 22, height: 22, borderRadius: radius.sm, borderWidth: stroke.thin, borderColor: colors.outline, alignItems: "center" as const, justifyContent: "center" as const },
  checkOn: { backgroundColor: colors.accent, borderColor: colors.outline },
  list: { maxHeight: 420 },
  empty: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted, textAlign: "center" as const, paddingVertical: 24 },
});

export function AddTracksSheet({ visible, onClose, playlistId, existingIds }: AddTracksSheetProps) {
  const s = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const { allTracks } = useLibrary();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q ? allTracks.filter((t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)) : allTracks;
    return pool.slice(0, 120);
  }, [allTracks, query]);

  function toggle(track: Track) {
    if (existingIds.has(track.id)) library.removeFromPlaylist(playlistId, track.id);
    else library.addToPlaylist(playlistId, [track]);
  }

  return (
    <ActionSheet visible={visible} onClose={onClose} title="Add tracks">
      <View style={s.searchWrap}>
        <SearchIcon size={16} color={colors.muted} />
        <TextInput style={s.input} placeholder="Search your library" placeholderTextColor={colors.faint} value={query} onChangeText={setQuery} autoCorrect={false} />
      </View>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        style={s.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={s.empty}>No tracks found.</Text>}
        renderItem={({ item }) => {
          const on = existingIds.has(item.id);
          return (
            <PressableScale onPress={() => toggle(item)} style={s.row} scaleTo={0.98}>
              <Artwork uri={item.image} seed={item.albumId || item.id} size={40} radius={9} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={s.subtitle} numberOfLines={1}>
                  {item.artist}
                </Text>
              </View>
              <View style={[s.check, on && s.checkOn]}>{on ? <CheckIcon size={13} color={colors.onAccent} strokeWidth={3} /> : null}</View>
            </PressableScale>
          );
        }}
      />
    </ActionSheet>
  );
}
