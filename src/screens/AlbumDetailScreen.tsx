import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import type { Track } from "../data";
import { Header, EmptyState, Button } from "../ui";
import { Artwork } from "../widgets/Artwork";
import { TrackRow } from "../widgets/TrackRow";
import { TrackActionsSheet } from "../widgets/TrackActionsSheet";
import { ShuffleIcon, PlayIcon } from "../icons";
import { fonts, ThemeContextValue, useTheme, useThemedStyles } from "../theme";
import { usePlayer } from "../player/PlayerContext";
import { useAppNavigation } from "../navigation/NavigationContext";
import { deriveAlbums, library, tracksForAlbum, useLibrary } from "../library";
import { formatTotalLength, plural } from "../format";

interface AlbumDetailScreenProps {
  albumId: string;
  onGoToArtist: (id: string) => void;
}

export default function AlbumDetailScreen({ albumId, onGoToArtist }: AlbumDetailScreenProps) {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);
  const { currentTrack, isPlaying, playQueue, playTrack } = usePlayer();
  const { isLiked, allTracks } = useLibrary();
  const { pop } = useAppNavigation();
  const [menuTrack, setMenuTrack] = useState<Track | null>(null);

  const album = useMemo(() => deriveAlbums(allTracks).find((a) => a.id === albumId), [allTracks, albumId]);

  if (!album) {
    return (
      <View style={{ flex: 1 }}>
        <Header title="Album" onBack={pop} />
        <EmptyState title="Album not found" />
      </View>
    );
  }

  const tracks = tracksForAlbum(albumId, allTracks);
  const totalSeconds = tracks.reduce((sum, t) => sum + t.duration, 0);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <Header title="" onBack={pop} />

      <View style={s.hero}>
        <Artwork uri={album.image} seed={album.id} size={168} radius={20} style={{ alignSelf: "center" }} />
        <Text style={s.title}>{album.title}</Text>
        <TouchableOpacity onPress={() => onGoToArtist(album.artistId)} hitSlop={6}>
          <Text style={s.artistLink}>{album.artist}</Text>
        </TouchableOpacity>
        <Text style={s.meta}>
          {plural(tracks.length, "track")} · {formatTotalLength(totalSeconds)}
        </Text>

        <View style={s.actionsRow}>
          <Button label="Play" icon={<PlayIcon size={15} color={colors.onAccent} />} onPress={() => playQueue(tracks, 0)} disabled={tracks.length === 0} style={{ flex: 1 }} />
          <Button
            label="Shuffle"
            variant="secondary"
            icon={<ShuffleIcon size={15} color={colors.ink} />}
            onPress={() => playQueue(tracks, 0, { shuffle: true })}
            disabled={tracks.length === 0}
            style={{ flex: 1 }}
          />
        </View>
      </View>

      {tracks.map((track, i) => (
        <TrackRow
          key={track.id}
          track={track}
          index={i}
          showArt={false}
          isActive={currentTrack?.id === track.id}
          isPlaying={isPlaying}
          liked={isLiked(track.id)}
          onToggleLike={() => library.toggleLike(track)}
          onPress={() => playTrack(track, tracks)}
          onMore={() => setMenuTrack(track)}
        />
      ))}

      <TrackActionsSheet visible={!!menuTrack} track={menuTrack} onClose={() => setMenuTrack(null)} onGoToArtist={onGoToArtist} />
    </ScrollView>
  );
}

const makeStyles = ({ colors }: ThemeContextValue) => ({
  hero: { alignItems: "center" as const, paddingHorizontal: 24, paddingTop: 4, paddingBottom: 22 },
  title: { fontFamily: fonts.display, fontSize: 22, letterSpacing: -0.4, color: colors.ink, marginTop: 16, textAlign: "center" as const },
  artistLink: { fontFamily: fonts.bodySemibold, fontSize: 14.5, color: colors.accent, marginTop: 5 },
  meta: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 6, textAlign: "center" as const },
  actionsRow: { flexDirection: "row" as const, gap: 10, marginTop: 18, alignSelf: "stretch" as const },
});
