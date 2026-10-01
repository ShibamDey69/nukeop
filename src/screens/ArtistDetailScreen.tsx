import React, { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { Track } from "../data";
import { Header, EmptyState, PressableScale, Button } from "../ui";
import { Artwork } from "../widgets/Artwork";
import { TrackRow } from "../widgets/TrackRow";
import { TrackActionsSheet } from "../widgets/TrackActionsSheet";
import { ShuffleIcon, PlayIcon } from "../icons";
import { fonts, ThemeContextValue, useTheme, useThemedStyles } from "../theme";
import { usePlayer } from "../player/PlayerContext";
import { useAppNavigation } from "../navigation/NavigationContext";
import { albumsForArtist, deriveArtists, library, tracksForArtist, useLibrary } from "../library";
import { plural } from "../format";

interface ArtistDetailScreenProps {
  artistId: string;
  onGoToAlbum: (id: string) => void;
}

export default function ArtistDetailScreen({ artistId, onGoToAlbum }: ArtistDetailScreenProps) {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);
  const { currentTrack, isPlaying, playQueue, playTrack } = usePlayer();
  const { isLiked, allTracks } = useLibrary();
  const { pop } = useAppNavigation();
  const [menuTrack, setMenuTrack] = useState<Track | null>(null);

  const artist = useMemo(() => deriveArtists(allTracks).find((a) => a.id === artistId), [allTracks, artistId]);

  if (!artist) {
    return (
      <View style={{ flex: 1 }}>
        <Header title="Artist" onBack={pop} />
        <EmptyState title="Artist not found" />
      </View>
    );
  }

  const albums = albumsForArtist(artistId, allTracks);
  const tracks = tracksForArtist(artistId, allTracks);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <Header title="" onBack={pop} />

      <View style={s.hero}>
        <Artwork uri={artist.image} seed={artist.id} circle size={112} style={{ alignSelf: "center" }} />
        <Text style={s.name}>{artist.name}</Text>
        <Text style={s.meta}>
          {plural(albums.length, "album")} · {plural(tracks.length, "track")}
        </Text>

        <View style={s.actionsRow}>
          <Button
            label="Play"
            icon={<PlayIcon size={15} color={colors.onAccent} />}
            onPress={() => playQueue(tracks, 0)}
            disabled={tracks.length === 0}
            style={{ flex: 1 }}
          />
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

      {albums.length > 0 && (
        <>
          <Text style={s.sectionLabel}>Albums</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.albumRow}>
            {albums.map((album) => (
              <PressableScale key={album.id} style={s.albumItem} scaleTo={0.96} onPress={() => onGoToAlbum(album.id)}>
                <Artwork uri={album.image} seed={album.id} size={120} />
                <Text style={s.albumTitle} numberOfLines={1}>
                  {album.title}
                </Text>
              </PressableScale>
            ))}
          </ScrollView>
        </>
      )}

      <Text style={s.sectionLabel}>All tracks</Text>
      {tracks.map((track, i) => (
        <TrackRow
          key={track.id}
          track={track}
          index={i}
          isActive={currentTrack?.id === track.id}
          isPlaying={isPlaying}
          liked={isLiked(track.id)}
          onToggleLike={() => library.toggleLike(track)}
          onPress={() => playTrack(track, tracks)}
          onMore={() => setMenuTrack(track)}
        />
      ))}

      <TrackActionsSheet visible={!!menuTrack} track={menuTrack} onClose={() => setMenuTrack(null)} onGoToAlbum={onGoToAlbum} />
    </ScrollView>
  );
}

const makeStyles = ({ colors }: ThemeContextValue) => ({
  hero: { alignItems: "center" as const, paddingHorizontal: 24, paddingTop: 4, paddingBottom: 22 },
  name: { fontFamily: fonts.display, fontSize: 24, letterSpacing: -0.5, color: colors.ink, marginTop: 14, textAlign: "center" as const },
  meta: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 4 },
  actionsRow: { flexDirection: "row" as const, gap: 10, marginTop: 18, alignSelf: "stretch" as const },
  sectionLabel: { fontFamily: fonts.displaySemi, fontSize: 16, color: colors.ink, paddingHorizontal: 20, marginBottom: 10, marginTop: 6 },
  albumRow: { paddingHorizontal: 20, gap: 14, paddingBottom: 8 },
  albumItem: { width: 120 },
  albumTitle: { fontFamily: fonts.bodySemibold, fontSize: 12.5, color: colors.ink, marginTop: 8 },
  albumYear: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 1 },
});
