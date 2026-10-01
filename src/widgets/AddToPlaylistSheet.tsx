import React, { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { Track } from "../data";
import { library, useLibrary } from "../library";
import { CheckIcon, PlaylistIcon, PlusIcon } from "../icons";
import { fonts, radius, stroke, ThemeContextValue, useTheme, useThemedStyles } from "../theme";
import { PressableScale } from "../ui";
import { plural } from "../format";
import { ActionSheet } from "./ActionSheet";
import { logger } from "../logger";

interface AddToPlaylistSheetProps {
  visible: boolean;
  onClose: () => void;
  tracks: Track[];
}

const makeStyles = ({ colors }: ThemeContextValue) => ({
  row: { flexDirection: "row" as const, alignItems: "center" as const, gap: 14, paddingHorizontal: 22, paddingVertical: 13 },
  iconWrap: { width: 40, height: 40, borderRadius: radius.sm, borderWidth: stroke.thin, borderColor: colors.outline, backgroundColor: colors.surfaceAlt, alignItems: "center" as const, justifyContent: "center" as const },
  name: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.ink },
  count: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.muted, marginTop: 1 },
  check: { width: 22, height: 22, borderRadius: radius.sm, borderWidth: stroke.thin, borderColor: colors.outline, alignItems: "center" as const, justifyContent: "center" as const },
  checkOn: { backgroundColor: colors.accent, borderColor: colors.outline },
  createRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10, paddingHorizontal: 22, paddingVertical: 12 },
  input: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink, borderBottomWidth: stroke.thin, borderBottomColor: colors.outline, paddingVertical: 6 },
  list: { maxHeight: 320 },
});

export function AddToPlaylistSheet({ visible, onClose, tracks }: AddToPlaylistSheetProps) {
  const s = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const { playlists } = useLibrary();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const trackIds = tracks.map((t) => t.id);

  function containsAll(playlistId: string): boolean {
    const p = playlists.find((pl) => pl.id === playlistId);
    if (!p) return false;
    return trackIds.every((id) => p.trackIds.includes(id));
  }

  function toggle(playlistId: string) {
    if (containsAll(playlistId)) {
      trackIds.forEach((id) => library.removeFromPlaylist(playlistId, id));
    } else {
      const added = library.addToPlaylist(playlistId, tracks);
      if (added > 0) logger.info(`Added ${plural(added, "track")} to playlist`);
    }
  }

  function submitCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const p = library.createPlaylist(trimmed, tracks);
    setName("");
    setCreating(false);
    onClose();
    Alert.alert("Playlist created", `Added ${plural(tracks.length, "track")} to “${p.name}”.`);
  }

  return (
    <ActionSheet
      visible={visible}
      onClose={() => {
        setCreating(false);
        setName("");
        onClose();
      }}
      title="Add to playlist"
      subtitle={tracks.length > 1 ? plural(tracks.length, "track") : tracks[0]?.title}
    >
      <View style={s.list}>
        <PressableScale onPress={() => setCreating((c) => !c)} style={s.createRow} scaleTo={0.98}>
          <View style={s.iconWrap}>
            <PlusIcon size={18} color={colors.ink} />
          </View>
          <Text style={s.name}>New playlist</Text>
        </PressableScale>

        {creating && (
          <View style={{ paddingHorizontal: 22, paddingBottom: 8, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TextInput
              style={s.input}
              placeholder="Playlist name"
              placeholderTextColor={colors.faint}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={submitCreate}
            />
            <PressableScale onPress={submitCreate} disabled={!name.trim()} style={{ opacity: name.trim() ? 1 : 0.4 }}>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 14, color: colors.accent }}>Add</Text>
            </PressableScale>
          </View>
        )}

        {playlists.map((p) => {
          const on = containsAll(p.id);
          return (
            <PressableScale key={p.id} onPress={() => toggle(p.id)} style={s.row} scaleTo={0.98}>
              <View style={s.iconWrap}>
                <PlaylistIcon size={18} color={colors.ink} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.name} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={s.count}>{plural(p.trackIds.length, "track")}</Text>
              </View>
              <View style={[s.check, on && s.checkOn]}>{on ? <CheckIcon size={13} color={colors.onAccent} strokeWidth={3} /> : null}</View>
            </PressableScale>
          );
        })}

        {playlists.length === 0 && !creating && (
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.muted, textAlign: "center", paddingVertical: 20 }}>
            No playlists yet — create one above.
          </Text>
        )}
      </View>
    </ActionSheet>
  );
}
