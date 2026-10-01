import React, { useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Header, EmptyState } from "../ui";
import { MusicLoadingIndicator } from "../widgets/MusicLoadingIndicator";
import { usePlayer, usePlayerProgress } from "../player/PlayerContext";
import { fetchLyrics, getYouTubeTrackId, Lyrics } from "../plugins/lyrics";
import { usePluginEnabled } from "../plugins";
import { fonts, ThemeContextValue, useTheme, useThemedStyles } from "../theme";
import { LyricsIcon } from "../icons";
import { errorMessage } from "../logger";

interface LyricsScreenProps {
  onBack: () => void;
}

export default function LyricsScreen({ onBack }: LyricsScreenProps) {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);
  const { currentTrack } = usePlayer();
  const { positionMillis } = usePlayerProgress();
  const lyricsEnabled = usePluginEnabled("lyrics");

  const [state, setState] = useState<{ status: "loading" | "ready" | "error"; lyrics?: Lyrics; error?: string }>({ status: "loading" });
  const scrollRef = useRef<ScrollView>(null);
  const lineYRef = useRef<number[]>([]);
  const lastScrolledIndex = useRef(-1);

  useEffect(() => {
    if (!currentTrack) return;
    let cancelled = false;
    setState({ status: "loading" });
    fetchLyrics(currentTrack)
      .then((lyrics) => {
        if (!cancelled) setState({ status: "ready", lyrics: lyrics ?? undefined });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", error: errorMessage(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [currentTrack?.id]);

  const activeIndex =
    state.lyrics?.synced && state.lyrics.lines.length > 0
      ? findActiveLine(state.lyrics.lines, positionMillis / 1000)
      : -1;

  useEffect(() => {
    if (activeIndex < 0 || activeIndex === lastScrolledIndex.current) return;
    lastScrolledIndex.current = activeIndex;
    const y = lineYRef.current[activeIndex];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - 140), animated: true });
  }, [activeIndex]);

  if (!currentTrack) return null;

  const isYouTubeTrack = getYouTubeTrackId(currentTrack) !== null;

  return (
    <View style={{ flex: 1 }}>
      <Header title="Lyrics" onBack={onBack} />
      <View style={s.trackInfo}>
        <Text style={s.trackTitle} numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text style={s.trackArtist} numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>

      {!lyricsEnabled ? (
        <EmptyState
          icon={<LyricsIcon size={22} color={colors.accent} />}
          title="Lyrics plugin is off"
          message="Turn on the Lyrics plugin from the Plugins tab to see lyrics here."
        />
      ) : state.status === "loading" ? (
        <MusicLoadingIndicator label="Looking up lyrics…" />
      ) : state.status === "error" ? (
        <EmptyState title="Couldn't load lyrics" message={state.error ?? "The lyrics service didn't respond. Check your connection and try again."} />
      ) : state.lyrics?.instrumental ? (
        <EmptyState icon={<LyricsIcon size={22} color={colors.accent} />} title="Instrumental" message="This track has no lyrics." />
      ) : !state.lyrics || state.lyrics.lines.length === 0 ? (
        <EmptyState
          title="No lyrics found"
          message={
            isYouTubeTrack
              ? "YouTube Music doesn't have lyrics for this track."
              : "Lyrics are only available for YouTube tracks."
          }
        />
      ) : (
        <ScrollView ref={scrollRef} contentContainerStyle={s.lyricsBody} showsVerticalScrollIndicator={false}>
          {state.lyrics.lines.map((line, i) => (
            <Text
              key={i}
              onLayout={(e) => {
                lineYRef.current[i] = e.nativeEvent.layout.y;
              }}
              style={[
                s.line,
                state.lyrics!.synced && { color: i === activeIndex ? colors.ink : colors.faint, fontFamily: i === activeIndex ? fonts.displaySemi : fonts.body },
              ]}
            >
              {line.text || "♪"}
            </Text>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function findActiveLine(lines: { time: number | null }[], positionSeconds: number): number {
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].time;
    if (t != null && t <= positionSeconds + 0.15) idx = i;
    else break;
  }
  return idx;
}

const makeStyles = ({ colors }: ThemeContextValue) => ({
  trackInfo: { paddingHorizontal: 20, paddingBottom: 14 },
  trackTitle: { fontFamily: fonts.displaySemi, fontSize: 18, color: colors.ink },
  trackArtist: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 2 },
  lyricsBody: { paddingHorizontal: 24, paddingBottom: 120, paddingTop: 8, gap: 16 },
  line: { fontFamily: fonts.bodyMedium, fontSize: 19, lineHeight: 27, color: colors.ink },
});
