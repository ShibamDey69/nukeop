import React, { useState } from "react";
import { Share } from "react-native";
import { Track } from "../data";
import { library, useLibrary } from "../library";
import { usePlayer } from "../player/PlayerContext";
import { useTheme } from "../theme";
import { ActionSheet, ActionSheetOption } from "./ActionSheet";
import { AddToPlaylistSheet } from "./AddToPlaylistSheet";
import { HeartIcon, ListPlusIcon, PlayIcon, QueueIcon, ShareIcon, TrashIcon, UserIcon, AlbumsIcon } from "../icons";
import { logger } from "../logger";

interface TrackActionsSheetProps {
  visible: boolean;
  onClose: () => void;
  track: Track | null;
  onGoToArtist?: (artistId: string) => void;
  onGoToAlbum?: (albumId: string) => void;
  /** When set, shows "Remove from this playlist". */
  removeFromPlaylistId?: string;
}

export function TrackActionsSheet({ visible, onClose, track, onGoToArtist, onGoToAlbum, removeFromPlaylistId }: TrackActionsSheetProps) {
  const { colors } = useTheme();
  const { playNext, addToQueue, playTrack } = usePlayer();
  const { isLiked } = useLibrary();
  const [addSheet, setAddSheet] = useState(false);

  if (!track) return <ActionSheet visible={false} onClose={onClose} />;

  const liked = isLiked(track.id);
  const isLocal = track.artistId === "local-device";

  const options: ActionSheetOption[] = [
    { label: "Play now", icon: <PlayIcon size={17} color={colors.ink} />, onPress: () => playTrack(track) },
    { label: "Play next", icon: <QueueIcon size={17} color={colors.ink} />, onPress: () => playNext(track) },
    { label: "Add to queue", icon: <QueueIcon size={17} color={colors.ink} />, onPress: () => addToQueue(track) },
    {
      label: liked ? "Unlike" : "Like",
      icon: <HeartIcon size={17} color={liked ? colors.accent : colors.ink} filled={liked} />,
      onPress: () => library.toggleLike(track),
    },
    { label: "Add to playlist", icon: <ListPlusIcon size={17} color={colors.ink} />, onPress: () => setAddSheet(true) },
  ];

  if (!isLocal && onGoToArtist) {
    options.push({ label: "Go to artist", icon: <UserIcon size={17} color={colors.ink} />, onPress: () => onGoToArtist(track.artistId) });
  }
  if (!isLocal && onGoToAlbum) {
    options.push({ label: "Go to album", icon: <AlbumsIcon size={17} color={colors.ink} />, onPress: () => onGoToAlbum(track.albumId) });
  }

  options.push({
    label: "Share",
    icon: <ShareIcon size={17} color={colors.ink} />,
    onPress: () => {
      Share.share({ message: `${track.title} — ${track.artist}` }).catch((err) => {
        logger.warn(`Share failed: ${err instanceof Error ? err.message : String(err)}`);
      });
    },
  });

  if (removeFromPlaylistId) {
    options.push({
      label: "Remove from this playlist",
      destructive: true,
      icon: <TrashIcon size={17} color={colors.danger} />,
      onPress: () => {
        library.removeFromPlaylist(removeFromPlaylistId, track.id);
        logger.info(`Removed "${track.title}" from playlist`);
      },
    });
  }

  return (
    <>
      <ActionSheet visible={visible && !addSheet} onClose={onClose} title={track.title} subtitle={track.artist} options={options} />
      <AddToPlaylistSheet
        visible={addSheet}
        onClose={() => {
          setAddSheet(false);
          onClose();
        }}
        tracks={[track]}
      />
    </>
  );
}
