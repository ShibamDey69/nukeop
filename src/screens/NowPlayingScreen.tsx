import React, { useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
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
  MusicNoteIcon,
} from "../icons";
import { useTheme, Palette, fonts } from "../theme";
import { AnimatedPressable, FadeSlideIn } from "../motion";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export interface NowPlayingTrack {
  title: string;
  artist: string;
  album: string;
  duration: number;
  currentTime: number;
  image?: string;
}

interface NowPlayingScreenProps {
  track: NowPlayingTrack;
  isPlaying: boolean;
  onPlayPause: () => void;
  onBack: () => void;
}

export default function NowPlayingScreen({ track, isPlaying, onPlayPause, onBack }: NowPlayingScreenProps) {
  const { colors, nbShadow } = useTheme();
  const styles = createStyles(colors);
  const [progress, setProgress] = useState(track.currentTime);
  const [liked, setLiked] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <AnimatedPressable onPress={onBack} style={styles.iconBtn} hitSlop={8}>
          <ChevronDownIcon size={24} color={colors.ink} />
        </AnimatedPressable>
        <Text style={styles.topBarTitle}>Now playing</Text>
        <AnimatedPressable style={styles.iconBtn} hitSlop={8}>
          <MoreVertIcon size={20} color={colors.ink} />
        </AnimatedPressable>
      </View>

      {/* Artwork */}
      <FadeSlideIn style={styles.artworkWrap} distance={20}>
        <View style={[styles.artwork, nbShadow]}>
          {track.image ? (
            <Image source={{ uri: track.image }} style={styles.artworkImage} />
          ) : (
            <View style={[styles.artworkImage, styles.artworkFallback]}>
              <MusicNoteIcon size={72} color={colors.white} />
            </View>
          )}
        </View>
      </FadeSlideIn>

      {/* Track info */}
      <View style={styles.trackInfoRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {track.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {track.artist}
          </Text>
        </View>
        <AnimatedPressable onPress={() => setLiked(!liked)} style={{ padding: 8 }} scaleTo={0.85}>
          <HeartIcon size={22} color={liked ? colors.accent : colors.muted} filled={liked} />
        </AnimatedPressable>
      </View>

      {/* Progress */}
      <View style={styles.progressWrap}>
        <Slider
          style={{ width: "100%", height: 32 }}
          minimumValue={0}
          maximumValue={track.duration || 1}
          value={Math.min(progress, track.duration || 1)}
          onValueChange={setProgress}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.accent}
        />
        <View style={styles.progressLabels}>
          <Text style={styles.progressTime}>{formatTime(progress)}</Text>
          <Text style={styles.progressTime}>{formatTime(track.duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsRow}>
        <AnimatedPressable onPress={() => setShuffle(!shuffle)} style={{ padding: 8 }} scaleTo={0.85}>
          <ShuffleIcon size={20} color={shuffle ? colors.accent : colors.muted} />
        </AnimatedPressable>

        <AnimatedPressable style={{ padding: 8 }} scaleTo={0.85}>
          <SkipBackIcon size={24} color={colors.ink} />
        </AnimatedPressable>

        <AnimatedPressable onPress={onPlayPause} style={[styles.playBtn, nbShadow]} scaleTo={0.9}>
          {isPlaying ? <PauseIcon size={28} color={colors.white} /> : <PlayIcon size={28} color={colors.white} />}
        </AnimatedPressable>

        <AnimatedPressable style={{ padding: 8 }} scaleTo={0.85}>
          <SkipForwardIcon size={24} color={colors.ink} />
        </AnimatedPressable>

        <AnimatedPressable onPress={() => setRepeat(!repeat)} style={{ padding: 8 }} scaleTo={0.85}>
          <RepeatIcon size={20} color={repeat ? colors.accent : colors.muted} />
        </AnimatedPressable>
      </View>
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.ground },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
    },
    iconBtn: { padding: 4 },
    topBarTitle: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.ink, letterSpacing: 0.3 },
    artworkWrap: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
    artwork: { width: "100%", aspectRatio: 1, borderWidth: 2, borderColor: colors.border, overflow: "hidden" },
    artworkImage: { width: "100%", height: "100%", resizeMode: "cover" },
    artworkFallback: { backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
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
      borderColor: colors.border,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
