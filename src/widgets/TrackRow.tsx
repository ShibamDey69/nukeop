import React from "react";
import { Text, View, ViewStyle } from "react-native";
import { Track } from "../data";
import { EqualizerIcon, HeartIcon, ListPlusIcon, MoreVertIcon } from "../icons";
import { fonts, ThemeContextValue, useTheme, useThemedStyles } from "../theme";
import { formatDuration } from "../format";
import { Artwork } from "./Artwork";
import { IconButton, PressableScale } from "../ui";

interface TrackRowProps {
  track: Track;
  index?: number;
  isActive?: boolean;
  isPlaying?: boolean;
  liked?: boolean;
  compact?: boolean;
  showArt?: boolean;
  onPress: () => void;
  onToggleLike?: () => void;
  onMore?: () => void;
  /** Shows a dedicated one-tap "Add to queue" button (used in Search, where queueing without opening the full action sheet matters most). */
  onAddToQueue?: () => void;
  style?: ViewStyle;
}

const makeStyles = ({ colors }: ThemeContextValue) => ({
  row: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12, paddingHorizontal: 20, paddingVertical: 9 },
  rowCompact: { paddingVertical: 6 },
  leading: { width: 22, alignItems: "center" as const },
  index: { fontFamily: fonts.mono, fontSize: 12.5, color: colors.faint },
  title: { fontFamily: fonts.bodySemibold, fontSize: 14.5, color: colors.ink },
  artist: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 1 },
  duration: { fontFamily: fonts.mono, fontSize: 11.5, color: colors.faint },
});

export function TrackRow({ track, index, isActive, isPlaying, liked, compact, showArt = true, onPress, onToggleLike, onMore, onAddToQueue, style }: TrackRowProps) {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);

  return (
    <PressableScale
      onPress={onPress}
      onLongPress={onMore}
      scaleTo={0.985}
      style={[s.row, compact && s.rowCompact, style]}
      accessibilityLabel={`${track.title} by ${track.artist}`}
    >
      {index !== undefined && (
        <View style={s.leading}>
          {isActive && isPlaying ? <EqualizerIcon size={15} color={colors.accent} /> : <Text style={s.index}>{index + 1}</Text>}
        </View>
      )}

      {showArt && <Artwork uri={track.image} seed={track.albumId || track.id} size={compact ? 38 : 44} radius={9} />}

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[s.title, isActive && { color: colors.accent }]} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={s.artist} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>

      {onToggleLike && (
        <IconButton
          label={liked ? "Unlike" : "Like"}
          size={30}
          icon={<HeartIcon size={16} color={liked ? colors.accent : colors.faint} filled={liked} />}
          onPress={onToggleLike}
        />
      )}

      <Text style={s.duration}>{formatDuration(track.duration)}</Text>

      {onAddToQueue && (
        <IconButton
          label="Add to queue"
          size={30}
          icon={<ListPlusIcon size={17} color={colors.faint} />}
          onPress={onAddToQueue}
        />
      )}

      {onMore && (
        <IconButton label="More options" size={30} icon={<MoreVertIcon size={17} color={colors.faint} />} onPress={onMore} />
      )}
    </PressableScale>
  );
}
