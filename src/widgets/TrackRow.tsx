import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Track } from "../data";
import { EqualizerIcon, HeartIcon, PlayIcon, QueueIcon } from "../icons";
import { useTheme, fonts, ThemeColors } from "../theme";
import { usePlayer } from "../player/PlayerContext";
import { ActionSheet } from "./ActionSheet";

function formatDuration(seconds: number): string {
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
}

export function TrackRow({
  track,
  index,
  isActive = false,
  isPlaying = false,
  liked = false,
  onPress,
  onToggleLike,
  showArt = true,
}: TrackRowProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { playNext, addToQueue } = usePlayer();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        onLongPress={() => setSheetOpen(true)}
        activeOpacity={0.65}
      >
        <View style={styles.leading}>
          {isActive && isPlaying ? (
            <EqualizerIcon size={16} color={colors.accent} />
          ) : index !== undefined ? (
            <Text style={styles.index}>{index + 1}</Text>
          ) : null}
        </View>

        {showArt && <Image source={{ uri: track.image }} style={styles.art} />}

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

        {onToggleLike && (
          <TouchableOpacity onPress={onToggleLike} hitSlop={8} style={{ padding: 4 }}>
            <HeartIcon size={16} color={liked ? colors.accent : colors.muted} filled={liked} />
          </TouchableOpacity>
        )}

        <Text style={styles.duration}>{formatDuration(track.duration)}</Text>
      </TouchableOpacity>

      <ActionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={track.title}
        subtitle={track.artist}
        options={[
          {
            label: "Play now",
            icon: <PlayIcon size={16} color={colors.ink} />,
            onPress,
          },
          {
            label: "Play next",
            icon: <QueueIcon size={16} color={colors.ink} />,
            onPress: () => playNext(track),
          },
          {
            label: "Add to queue",
            icon: <QueueIcon size={16} color={colors.ink} />,
            onPress: () => addToQueue(track),
          },
        ]}
      />
    </>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 16 },
    leading: { width: 20, alignItems: "center" },
    index: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
    art: { width: 40, height: 40, borderWidth: 2, borderColor: colors.ink },
    title: { fontFamily: fonts.displayBold, fontSize: 13, color: colors.ink },
    artist: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 1 },
    duration: { fontFamily: fonts.mono, fontSize: 11, color: colors.muted },
  });
}
