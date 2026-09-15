import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import Slider from "@react-native-community/slider";
import { usePlayer } from "../player/PlayerContext";
import { ActionSheet } from "../widgets/ActionSheet";
import { QueueSheet } from "../widgets/QueueSheet";
import {
  ChevronDownIcon,
  MoreVertIcon,
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  ShuffleIcon,
  RepeatIcon,
  HeartIcon,
  ShareIcon,
  PlusCircleIcon,
  QueueIcon,
  MusicNoteIcon,
} from "../icons";
import { colors, fonts, nbShadow } from "../theme";

function formatTime(millis: number): string {
  const totalSeconds = Math.floor(millis / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface NowPlayingScreenProps {
  onBack: () => void;
}

export default function NowPlayingScreen({ onBack }: NowPlayingScreenProps) {
  const {
    currentTrack,
    queue,
    isPlaying,
    positionMillis,
    durationMillis,
    shuffle,
    repeatMode,
    togglePlayPause,
    seek,
    next,
    prev,
    toggleShuffle,
    cycleRepeat,
    toggleLike,
    isLiked,
  } = usePlayer();

  const [dragMillis, setDragMillis] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);

  if (!currentTrack) return null;

  const liked = isLiked(currentTrack.id);
  const shownPosition = dragMillis ?? positionMillis;
  const totalMillis = durationMillis || currentTrack.duration * 1000;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn} hitSlop={10}>
          <ChevronDownIcon size={24} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Now playing</Text>
        <View style={styles.topBarRight}>
          <TouchableOpacity onPress={() => setQueueOpen(true)} style={styles.iconBtn} hitSlop={10}>
            <View style={{ position: "relative" }}>
              <QueueIcon size={22} color={colors.ink} />
              {queue.length > 1 && (
                <View style={styles.queueBadge}>
                  <Text style={styles.queueBadgeText}>{queue.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSheetOpen(true)} style={styles.iconBtn} hitSlop={10}>
            <MoreVertIcon size={20} color={colors.ink} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.artworkWrap}>
        <View style={[styles.artwork, nbShadow]}>
          {currentTrack.image ? (
            <Image source={{ uri: currentTrack.image }} style={styles.artworkImage} />
          ) : (
            <View style={styles.artPlaceholder}>
              <MusicNoteIcon size={64} color={colors.ink} />
            </View>
          )}
        </View>
      </View>

      <View style={styles.trackInfoRow}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.trackTitle} numberOfLines={2}>
            {currentTrack.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>
        <TouchableOpacity onPress={() => toggleLike(currentTrack.id)} style={{ padding: 8 }} hitSlop={4}>
          <HeartIcon size={22} color={liked ? colors.accent : colors.muted} filled={liked} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressWrap}>
        <Slider
          style={{ width: "100%", height: 32 }}
          minimumValue={0}
          maximumValue={Math.max(totalMillis, 1)}
          value={shownPosition}
          onValueChange={setDragMillis}
          onSlidingComplete={(v) => {
            seek(v);
            setDragMillis(null);
          }}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.ink}
          thumbTintColor={colors.accent}
        />
        <View style={styles.progressLabels}>
          <Text style={styles.progressTime}>{formatTime(shownPosition)}</Text>
          <Text style={styles.progressTime}>{formatTime(totalMillis)}</Text>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={toggleShuffle} style={{ padding: 8 }} hitSlop={4}>
          <ShuffleIcon size={20} color={shuffle ? colors.accent : colors.muted} />
        </TouchableOpacity>

        <TouchableOpacity onPress={prev} style={{ padding: 8 }} hitSlop={4}>
          <SkipBackIcon size={24} />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlayPause} style={[styles.playBtn, nbShadow]}>
          {isPlaying ? <PauseIcon size={28} color={colors.white} /> : <PlayIcon size={28} color={colors.white} />}
        </TouchableOpacity>

        <TouchableOpacity onPress={next} style={{ padding: 8 }} hitSlop={4}>
          <SkipForwardIcon size={24} />
        </TouchableOpacity>

        <TouchableOpacity onPress={cycleRepeat} style={{ padding: 8 }} hitSlop={4}>
          <RepeatIcon size={20} color={repeatMode !== "off" ? colors.accent : colors.muted} />
          {repeatMode === "one" && <View style={styles.repeatOneDot} />}
        </TouchableOpacity>
      </View>

      {/* Queue modal sheet */}
      <QueueSheet visible={queueOpen} onClose={() => setQueueOpen(false)} />

      {/* Options sheet */}
      <ActionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={currentTrack.title}
        subtitle={currentTrack.album}
        options={[
          {
            label: "View playback queue",
            icon: <QueueIcon size={18} color={colors.ink} />,
            onPress: () => setQueueOpen(true),
          },
          {
            label: "Add to playlist",
            icon: <PlusCircleIcon size={18} color={colors.ink} />,
            onPress: () => Alert.alert("Added", `"${currentTrack.title}" was added to Liked Songs.`),
          },
          {
            label: "Share track",
            icon: <ShareIcon size={18} color={colors.ink} />,
            onPress: () => Alert.alert("Share", `Share link for "${currentTrack.title}" copied.`),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.ink,
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: { padding: 4 },
  topBarTitle: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.ink, letterSpacing: 0.3 },
  queueBadge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: colors.accent,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  queueBadgeText: {
    fontFamily: fonts.monoSemibold,
    fontSize: 8,
    color: colors.white,
  },
  artworkWrap: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  artwork: { width: "100%", aspectRatio: 1, borderWidth: 2, borderColor: colors.ink, overflow: "hidden" },
  artworkImage: { width: "100%", height: "100%", resizeMode: "cover" },
  artPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  trackInfoRow: { paddingHorizontal: 24, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  trackTitle: { fontFamily: fonts.display, fontSize: 22, lineHeight: 24, letterSpacing: -0.6, color: colors.ink },
  trackArtist: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, marginTop: 4 },
  progressWrap: { paddingHorizontal: 24, paddingTop: 12 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  progressTime: { fontFamily: fonts.mono, fontSize: 11, color: colors.muted },
  controlsRow: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  repeatOneDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
});
