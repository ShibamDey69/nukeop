import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Slider from "@react-native-community/slider";
import { usePlayer, usePlayerProgress } from "../player/PlayerContext";
import { ActionSheet, ActionSheetOption } from "../widgets/ActionSheet";
import { TrackActionsSheet } from "../widgets/TrackActionsSheet";
import { Artwork } from "../widgets/Artwork";
import { Gradient } from "../widgets/Gradient";
import {
  ChevronDownIcon,
  MoreVertIcon,
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  ShuffleIcon,
  RepeatIcon,
  RepeatOneIcon,
  HeartIcon,
  ListPlusIcon,
  QueueIcon,
  ClockIcon,
  GaugeIcon,
  LyricsIcon,
  CheckIcon,
} from "../icons";
import { fonts, radius, stroke, ThemeContextValue, useTheme, useThemedStyles } from "../theme";
import { formatMillis } from "../format";
import { library, useLibrary } from "../library";
import { useSettings } from "../settings";
import { tintFor } from "../color";
import { IconButton } from "../ui";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const SLEEP_OPTIONS: { label: string; value: number | "track" | null }[] = [
  { label: "Off", value: null },
  { label: "End of track", value: "track" },
  { label: "10 minutes", value: 10 },
  { label: "20 minutes", value: 20 },
  { label: "45 minutes", value: 45 },
  { label: "1 hour", value: 60 },
];

interface NowPlayingScreenProps {
  onBack: () => void;
  onQueue?: () => void;
  onLyrics?: () => void;
}

export default function NowPlayingScreen({ onBack, onQueue, onLyrics }: NowPlayingScreenProps) {
  const { colors, isDark } = useTheme();
  const s = useThemedStyles(makeStyles);
  const { dynamicColors } = useSettings();
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    shuffle,
    repeatMode,
    playbackRate,
    sleep,
    upNext,
    togglePlayPause,
    seek,
    next,
    prev,
    toggleShuffle,
    cycleRepeat,
    setPlaybackRate,
    setSleepTimer,
  } = usePlayer();
  const { positionMillis, durationMillis } = usePlayerProgress();
  const { isLiked } = useLibrary();

  const [dragMillis, setDragMillis] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [speedSheet, setSpeedSheet] = useState(false);
  const [sleepSheet, setSleepSheet] = useState(false);
  const [trackActions, setTrackActions] = useState(false);

  if (!currentTrack) return null;

  const liked = isLiked(currentTrack.id);
  const shownPosition = dragMillis ?? positionMillis;
  const totalMillis = durationMillis || currentTrack.duration * 1000;
  const [tintA, tintB] = tintFor(currentTrack.albumId || currentTrack.id, isDark);

  const repeatColor = repeatMode !== "off" ? colors.accent : colors.faint;

  const menuOptions: ActionSheetOption[] = [
    { label: "Track options", icon: <ListPlusIcon size={17} color={colors.ink} />, onPress: () => setTrackActions(true) },
    {
      label: `Playback speed · ${playbackRate}×`,
      icon: <GaugeIcon size={17} color={colors.ink} />,
      onPress: () => setSpeedSheet(true),
    },
    {
      label: sleep ? `Sleep timer · ${sleep.kind === "track" ? "end of track" : "on"}` : "Sleep timer",
      icon: <ClockIcon size={17} color={colors.ink} />,
      onPress: () => setSleepSheet(true),
    },
  ];

  return (
    <View style={s.container}>
      {dynamicColors && (
        <Gradient
          stops={[{ color: tintA, opacity: 0.35 }, { color: colors.bg, opacity: 0 }]}
          direction="vertical"
          style={{ position: "absolute", left: 0, right: 0, top: 0, height: 420 }}
          pointerEvents="none"
        />
      )}

      <View style={s.topBar}>
        <IconButton label="Close" icon={<ChevronDownIcon size={24} color={colors.ink} />} onPress={onBack} />
        <Text style={s.topBarTitle}>Now playing</Text>
        <IconButton label="More options" icon={<MoreVertIcon size={20} color={colors.ink} />} onPress={() => setMenuOpen(true)} />
      </View>

      <View style={s.artworkWrap}>
        <Artwork uri={currentTrack.image} seed={currentTrack.albumId || currentTrack.id} radius={22} />
      </View>

      <View style={s.trackInfoRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.trackTitle} numberOfLines={2}>
            {currentTrack.title}
          </Text>
          <Text style={s.trackArtist}>{currentTrack.artist}</Text>
        </View>
        <IconButton label={liked ? "Unlike" : "Like"} icon={<HeartIcon size={22} color={liked ? colors.accent : colors.faint} filled={liked} />} onPress={() => library.toggleLike(currentTrack)} />
      </View>

      <View style={s.progressWrap}>
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
          maximumTrackTintColor={colors.surfaceHigh}
          thumbTintColor={colors.accent}
        />
        <View style={s.progressLabels}>
          <Text style={s.progressTime}>{formatMillis(shownPosition)}</Text>
          <Text style={s.progressTime}>{isBuffering ? "buffering…" : formatMillis(totalMillis)}</Text>
        </View>
      </View>

      <View style={s.controlsRow}>
        <IconButton label="Shuffle" icon={<ShuffleIcon size={20} color={shuffle ? colors.accent : colors.faint} />} onPress={toggleShuffle} />
        <IconButton label="Previous" size={44} icon={<SkipBackIcon size={24} color={colors.ink} />} onPress={prev} />
        <IconButton
          label={isPlaying ? "Pause" : "Play"}
          size={68}
          variant="accent"
          icon={isPlaying ? <PauseIcon size={26} color={colors.onAccent} /> : <PlayIcon size={26} color={colors.onAccent} />}
          onPress={togglePlayPause}
        />
        <IconButton label="Next" size={44} icon={<SkipForwardIcon size={24} color={colors.ink} />} onPress={next} />
        <IconButton
          label="Repeat"
          icon={repeatMode === "one" ? <RepeatOneIcon size={20} color={repeatColor} /> : <RepeatIcon size={20} color={repeatColor} />}
          onPress={cycleRepeat}
        />
      </View>

      <View style={s.utilRow}>
        <TouchableOpacity onPress={onLyrics} style={s.utilBtn} activeOpacity={0.7}>
          <LyricsIcon size={15} color={colors.ink} />
          <Text style={s.utilLabel}>Lyrics</Text>
        </TouchableOpacity>
        {onQueue && (
          <TouchableOpacity onPress={onQueue} style={s.utilBtnFlex} activeOpacity={0.7}>
            <QueueIcon size={15} color={colors.ink} />
            <Text style={s.utilLabel} numberOfLines={1}>
              {upNext.length > 0 ? `Up next: ${upNext[0].title}` : "Queue is empty"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ActionSheet visible={menuOpen} onClose={() => setMenuOpen(false)} title={currentTrack.title} subtitle={currentTrack.album} options={menuOptions} />

      <ActionSheet
        visible={speedSheet}
        onClose={() => setSpeedSheet(false)}
        title="Playback speed"
        options={SPEEDS.map((sp) => ({
          label: `${sp}×${sp === 1 ? " (normal)" : ""}`,
          icon: sp === playbackRate ? <CheckIcon size={16} color={colors.accent} /> : undefined,
          onPress: () => setPlaybackRate(sp),
        }))}
      />

      <ActionSheet
        visible={sleepSheet}
        onClose={() => setSleepSheet(false)}
        title="Sleep timer"
        subtitle={sleep?.kind === "time" ? `Pauses at ${new Date(sleep.endsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : undefined}
        options={SLEEP_OPTIONS.map((opt) => ({
          label: opt.label,
          icon: (opt.value === null && !sleep) || (opt.value === "track" && sleep?.kind === "track") ? <CheckIcon size={16} color={colors.accent} /> : undefined,
          onPress: () => setSleepTimer(opt.value),
        }))}
      />

      <TrackActionsSheet visible={trackActions} track={currentTrack} onClose={() => setTrackActions(false)} />
    </View>
  );
}

const makeStyles = ({ colors, shadows }: ThemeContextValue) => ({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, paddingHorizontal: 12, height: 54 },
  topBarTitle: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.muted, letterSpacing: 0.4, textTransform: "uppercase" as const },
  artworkWrap: { paddingHorizontal: 28, paddingTop: 12, paddingBottom: 20 },
  trackInfoRow: { paddingHorizontal: 26, flexDirection: "row" as const, alignItems: "flex-start" as const, justifyContent: "space-between" as const },
  trackTitle: { fontFamily: fonts.display, fontSize: 22, lineHeight: 25, letterSpacing: -0.5, color: colors.ink },
  trackArtist: { fontFamily: fonts.bodyMedium, fontSize: 14.5, color: colors.muted, marginTop: 4 },
  progressWrap: { paddingHorizontal: 22, paddingTop: 14 },
  progressLabels: { flexDirection: "row" as const, justifyContent: "space-between" as const, marginTop: 2, paddingHorizontal: 4 },
  progressTime: { fontFamily: fonts.mono, fontSize: 11, color: colors.muted },
  controlsRow: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 6, flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const },
  utilRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10, marginHorizontal: 26, marginTop: 14, marginBottom: 18 },
  utilBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: stroke.base,
    borderColor: colors.outline,
    backgroundColor: colors.surfaceAlt,
    ...shadows.sm,
  },
  utilBtnFlex: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: stroke.base,
    borderColor: colors.outline,
    backgroundColor: colors.surfaceAlt,
    ...shadows.sm,
  },
  utilLabel: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: colors.ink, flexShrink: 1 },
});
