import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Header, EmptyState, IconButton, Button } from "../ui";
import { PlaylistCover } from "../widgets/Artwork";
import { TrackRow } from "../widgets/TrackRow";
import { TrackActionsSheet } from "../widgets/TrackActionsSheet";
import { ActionSheet } from "../widgets/ActionSheet";
import { PromptSheet } from "../widgets/PromptSheet";
import { AddTracksSheet } from "../widgets/AddTracksSheet";
import { MoreVertIcon, PlayIcon, PencilIcon, PlusIcon, ShuffleIcon, TrashIcon } from "../icons";
import { fonts, ThemeContextValue, useTheme, useThemedStyles } from "../theme";
import { usePlayer } from "../player/PlayerContext";
import { useAppNavigation } from "../navigation/NavigationContext";
import { library, useLibrary, useResolvedPlaylist } from "../library";
import { formatTotalLength, plural } from "../format";
import type { Track } from "../data";

interface PlaylistDetailScreenProps {
  playlistId: string;
  onGoToArtist: (id: string) => void;
  onGoToAlbum: (id: string) => void;
}

export default function PlaylistDetailScreen({ playlistId, onGoToArtist, onGoToAlbum }: PlaylistDetailScreenProps) {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);
  const playlist = useResolvedPlaylist(playlistId);
  const { currentTrack, isPlaying, playQueue, playTrack } = usePlayer();
  const { isLiked } = useLibrary();
  const { pop } = useAppNavigation();

  const [menuTrack, setMenuTrack] = useState<Track | null>(null);
  const [headerMenu, setHeaderMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [addingTracks, setAddingTracks] = useState(false);

  if (!playlist) {
    return (
      <View style={{ flex: 1 }}>
        <Header title="Playlist" onBack={pop} />
        <EmptyState title="Playlist not found" message="It may have been deleted." />
      </View>
    );
  }

  const isEditable = playlist.kind === "user";
  const totalSeconds = playlist.tracks.reduce((sum, t) => sum + t.duration, 0);
  const images = playlist.tracks.slice(0, 4).map((t) => t.image);

  function confirmDelete() {
    Alert.alert("Delete playlist?", `“${playlist!.name}” will be removed. This can't be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => library.deletePlaylist(playlist!.id) },
    ]);
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <Header
        title=""
        onBack={pop}
        right={isEditable ? <IconButton label="Playlist options" icon={<MoreVertIcon size={20} color={colors.ink} />} onPress={() => setHeaderMenu(true)} /> : undefined}
      />

      <View style={s.hero}>
        <PlaylistCover images={images} seed={playlist.id} size={168} radius={20} kind={playlist.kind === "liked" ? "liked" : "playlist"} style={{ alignSelf: "center" }} />
        <Text style={s.title}>{playlist.name}</Text>
        <Text style={s.meta}>
          {plural(playlist.tracks.length, "track")}
          {totalSeconds > 0 ? ` · ${formatTotalLength(totalSeconds)}` : ""}
        </Text>

        <View style={s.actionsRow}>
          <Button label="Play" icon={<PlayIcon size={15} color={colors.onAccent} />} onPress={() => playQueue(playlist.tracks, 0)} disabled={playlist.tracks.length === 0} style={{ flex: 1 }} />
          <Button
            label="Shuffle"
            variant="secondary"
            icon={<ShuffleIcon size={15} color={colors.ink} />}
            onPress={() => playQueue(playlist.tracks, 0, { shuffle: true })}
            disabled={playlist.tracks.length === 0}
            style={{ flex: 1 }}
          />
          {isEditable && <IconButton label="Add tracks" variant="solid" icon={<PlusIcon size={18} color={colors.ink} />} onPress={() => setAddingTracks(true)} />}
        </View>
      </View>

      {playlist.tracks.length === 0 ? (
        <EmptyState
          title="No tracks yet"
          message={isEditable ? "Add tracks from your library to get started." : "This playlist doesn't have any tracks."}
          action={isEditable ? <Button label="Add tracks" icon={<PlusIcon size={15} color={colors.onAccent} />} onPress={() => setAddingTracks(true)} /> : undefined}
        />
      ) : (
        playlist.tracks.map((track, i) => (
          <TrackRow
            key={`${track.id}-${i}`}
            track={track}
            index={i}
            isActive={currentTrack?.id === track.id}
            isPlaying={isPlaying}
            liked={isLiked(track.id)}
            onToggleLike={() => library.toggleLike(track)}
            onPress={() => playTrack(track, playlist.tracks)}
            onMore={() => setMenuTrack(track)}
          />
        ))
      )}

      <TrackActionsSheet
        visible={!!menuTrack}
        track={menuTrack}
        onClose={() => setMenuTrack(null)}
        onGoToArtist={onGoToArtist}
        onGoToAlbum={onGoToAlbum}
        removeFromPlaylistId={isEditable ? playlist.id : undefined}
      />

      {isEditable && (
        <>
          <ActionSheet
            visible={headerMenu}
            onClose={() => setHeaderMenu(false)}
            title={playlist.name}
            options={[
              { label: "Rename playlist", icon: <PencilIcon size={17} color={colors.ink} />, onPress: () => setRenaming(true) },
              { label: "Add tracks", icon: <PlusIcon size={17} color={colors.ink} />, onPress: () => setAddingTracks(true) },
              { label: "Delete playlist", destructive: true, icon: <TrashIcon size={17} color={colors.danger} />, onPress: confirmDelete },
            ]}
          />
          <PromptSheet
            visible={renaming}
            title="Rename playlist"
            initialValue={playlist.name}
            confirmLabel="Save"
            onCancel={() => setRenaming(false)}
            onSubmit={(name) => {
              library.renamePlaylist(playlist.id, name);
              setRenaming(false);
            }}
          />
          <AddTracksSheet
            visible={addingTracks}
            onClose={() => setAddingTracks(false)}
            playlistId={playlist.id}
            existingIds={new Set(playlist.tracks.map((t) => t.id))}
          />
        </>
      )}
    </ScrollView>
  );
}

const makeStyles = ({ colors }: ThemeContextValue) => ({
  hero: { alignItems: "center" as const, paddingHorizontal: 24, paddingTop: 4, paddingBottom: 22 },
  title: { fontFamily: fonts.display, fontSize: 22, letterSpacing: -0.4, color: colors.ink, marginTop: 16, textAlign: "center" as const },
  meta: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 6 },
  actionsRow: { flexDirection: "row" as const, gap: 10, marginTop: 18, alignSelf: "stretch" as const, alignItems: "center" as const },
});
