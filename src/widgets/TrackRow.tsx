import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Track } from "../data";
import { EqualizerIcon, HeartIcon, MoreVertIcon, QueueIcon, PlusCircleIcon, MusicNoteIcon } from "../icons";
import { ActionSheet } from "./ActionSheet";
import { usePlayer } from "../player/PlayerContext";
import { useAppNavigation } from "../navigation/NavigationContext";
import { colors, fonts } from "../theme";

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface TrackRowProps {
  track: Track;
  index?: number;
  isActive?: boolean;
  isPlaying?: boolean;
  liked?: boolean;
  onPress: () => void;
  onToggleLike?: () => void;
  showArt?: boolean;
  showMore?: boolean;
}

export function TrackRow({
  track,
  index,
  isActive = false,
  isPlaying = false,
  liked,
  onPress,
  onToggleLike,
  showArt = true,
  showMore = true,
}: TrackRowProps) {
  const { playNext, addToQueue, toggleLike, isLiked } = usePlayer();
  const { push } = useAppNavigation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isItemLiked = liked !== undefined ? liked : isLiked(track.id);

  function handleToggleLike() {
    if (onToggleLike) {
      onToggleLike();
    } else {
      toggleLike(track.id);
    }
  }

  return (
    <>
      <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.65}>
        <View style={styles.leading}>
          {isActive && isPlaying ? (
            <EqualizerIcon size={16} color={colors.accent} />
          ) : index !== undefined ? (
            <Text style={styles.index}>{index + 1}</Text>
          ) : null}
        </View>

        {showArt && (
          track.image ? (
            <Image source={{ uri: track.image }} style={styles.art} />
          ) : (
            <View style={styles.artPlaceholder}>
              <MusicNoteIcon size={18} color={colors.ink} />
            </View>
          )
        )}

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={[styles.title, isActive && { color: colors.accent }]}
            numberOfLines={1}
          >
            {track.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {track.artist}
          </Text>
        </View>

        <TouchableOpacity onPress={handleToggleLike} hitSlop={8} style={{ padding: 4 }}>
          <HeartIcon
            size={16}
            color={isItemLiked ? colors.accent : colors.muted}
            filled={isItemLiked}
          />
        </TouchableOpacity>

        <Text style={styles.duration}>{formatDuration(track.duration)}</Text>

        {showMore && (
          <TouchableOpacity
            onPress={() => setSheetOpen(true)}
            hitSlop={8}
            style={{ padding: 4, marginLeft: 2 }}
          >
            <MoreVertIcon size={18} color={colors.muted} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <ActionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={track.title}
        subtitle={`${track.artist} · ${track.album}`}
        options={[
          {
            label: "Play next in queue",
            icon: <QueueIcon size={18} color={colors.ink} />,
            onPress: () => {
              playNext(track);
              Alert.alert("Queue", `"${track.title}" will play next.`);
            },
          },
          {
            label: "Add to end of queue",
            icon: <PlusCircleIcon size={18} color={colors.ink} />,
            onPress: () => {
              addToQueue(track);
              Alert.alert("Queue", `"${track.title}" added to queue.`);
            },
          },
          {
            label: isItemLiked ? "Remove from Liked Songs" : "Save to Liked Songs",
            icon: (
              <HeartIcon
                size={18}
                color={isItemLiked ? colors.accent : colors.ink}
                filled={isItemLiked}
              />
            ),
            onPress: handleToggleLike,
          },
          ...(track.artistId && !track.isLocal
            ? [
                {
                  label: `Go to ${track.artist}`,
                  onPress: () => push({ screen: "artist", id: track.artistId }),
                },
              ]
            : []),
          ...(track.albumId && !track.isLocal
            ? [
                {
                  label: `Go to ${track.album}`,
                  onPress: () => push({ screen: "album", id: track.albumId }),
                },
              ]
            : []),
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  leading: { width: 20, alignItems: "center" },
  index: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
  art: { width: 40, height: 40, borderWidth: 2, borderColor: colors.ink },
  artPlaceholder: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontFamily: fonts.displayBold, fontSize: 13, color: colors.ink },
  artist: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 1 },
  duration: { fontFamily: fonts.mono, fontSize: 11, color: colors.muted },
});
