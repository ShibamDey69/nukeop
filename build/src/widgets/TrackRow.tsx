import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Track } from "../data";
import { EqualizerIcon, HeartIcon } from "../icons";
import { colors, fonts } from "../theme";

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
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.65}>
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
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 16 },
  leading: { width: 20, alignItems: "center" },
  index: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
  art: { width: 40, height: 40, borderWidth: 2, borderColor: colors.ink },
  title: { fontFamily: fonts.displayBold, fontSize: 13, color: colors.ink },
  artist: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 1 },
  duration: { fontFamily: fonts.mono, fontSize: 11, color: colors.muted },
});
