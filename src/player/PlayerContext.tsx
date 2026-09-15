import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { AudioPlayer, AudioStatus, createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { Track } from "../data";

export type RepeatMode = "off" | "all" | "one";

interface PlayerState {
  queue: Track[];
  index: number;
  isPlaying: boolean;
  isBuffering: boolean;
  positionMillis: number;
  durationMillis: number;
  shuffle: boolean;
  repeatMode: RepeatMode;
  likedIds: string[];
}

interface PlayerContextValue extends PlayerState {
  currentTrack: Track | null;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  playTrack: (track: Track, context?: Track[]) => void;
  togglePlayPause: () => void;
  seek: (millis: number) => void;
  next: () => void;
  prev: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleLike: (trackId: string) => void;
  isLiked: (trackId: string) => boolean;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

function pickNextIndex(len: number, current: number, shuffle: boolean): number {
  if (len <= 1) return current;
  if (!shuffle) return (current + 1) % len;
  let next = Math.floor(Math.random() * len);
  if (next === current) next = (next + 1) % len;
  return next;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [player] = useState<AudioPlayer>(() => createAudioPlayer(null, 500));

  const [state, setState] = useState<PlayerState>({
    queue: [],
    index: -1,
    isPlaying: false,
    isBuffering: false,
    positionMillis: 0,
    durationMillis: 0,
    shuffle: false,
    repeatMode: "off",
    likedIds: [],
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    (async () => {
      try {
        await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false });
      } catch (err) {
        console.warn("nukeop: failed to set audio mode", err);
      }
    })();
    return () => {
      try {
        player.release();
      } catch {}
    };
  }, [player]);

  useEffect(() => {
    const subscription = player.addListener("playbackStatusUpdate", (status: AudioStatus) => {
      if (!status.isLoaded) return;

      setState((s) => ({
        ...s,
        isBuffering: status.playbackState === "loading" || status.playbackState === "buffering",
        isPlaying: !!status.playing,
        positionMillis: Math.max(0, (status.currentTime ?? 0) * 1000),
        durationMillis: Math.max(0, (status.duration ?? 0) * 1000),
      }));

      if (status.didJustFinish) {
        const cur = stateRef.current;
        if (cur.repeatMode === "one") return;
        const isLast = cur.index === cur.queue.length - 1;
        if (isLast && cur.repeatMode === "off" && !cur.shuffle) {
          setState((s) => ({ ...s, isPlaying: false }));
          return;
        }
        const nextIndex = pickNextIndex(cur.queue.length, cur.index, cur.shuffle);
        setState((s) => ({ ...s, index: nextIndex }));
      }
    });
    return () => subscription.remove();
  }, [player]);

  useEffect(() => {
    player.loop = state.repeatMode === "one";
  }, [player, state.repeatMode]);

  useEffect(() => {
    const track = state.queue[state.index];
    if (!track) return;
    (async () => {
      try {
        setState((s) => ({ ...s, isBuffering: true, positionMillis: 0, durationMillis: 0 }));
        await player.replace({ uri: track.audioUrl });
        player.play();
      } catch (err) {
        console.warn("nukeop: failed to load track", err);
        setState((s) => ({ ...s, isBuffering: false, isPlaying: false }));
      }
    })();
  }, [player, state.index, state.queue]);

  const playQueue = useCallback((tracks: Track[], startIndex = 0) => {
    if (tracks.length === 0) return;
    setState((s) => ({ ...s, queue: tracks, index: startIndex, isPlaying: true }));
  }, []);

  const playTrack = useCallback((track: Track, context?: Track[]) => {
    const list = context && context.length > 0 ? context : [track];
    const idx = list.findIndex((t) => t.id === track.id);
    setState((s) => ({ ...s, queue: list, index: idx >= 0 ? idx : 0, isPlaying: true }));
  }, []);

  const togglePlayPause = useCallback(() => {
    try {
      if (stateRef.current.isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    } catch {}
  }, [player]);

  const seek = useCallback(
    (millis: number) => {
      try {
        player.seekTo(millis / 1000);
      } catch {}
      setState((s) => ({ ...s, positionMillis: millis }));
    },
    [player]
  );

  const next = useCallback(() => {
    setState((s) => {
      if (s.queue.length === 0) return s;
      return { ...s, index: pickNextIndex(s.queue.length, s.index, s.shuffle) };
    });
  }, []);

  const prev = useCallback(() => {
    setState((s) => {
      if (s.queue.length === 0) return s;
      if (s.positionMillis > 4000) {
        try {
          player.seekTo(0);
        } catch {}
        return s;
      }
      const prevIndex = s.shuffle
        ? pickNextIndex(s.queue.length, s.index, true)
        : (s.index - 1 + s.queue.length) % s.queue.length;
      return { ...s, index: prevIndex };
    });
  }, [player]);

  const toggleShuffle = useCallback(() => setState((s) => ({ ...s, shuffle: !s.shuffle })), []);

  const cycleRepeat = useCallback(() => {
    setState((s) => {
      const order: RepeatMode[] = ["off", "all", "one"];
      const nextMode = order[(order.indexOf(s.repeatMode) + 1) % order.length];
      return { ...s, repeatMode: nextMode };
    });
  }, []);

  const toggleLike = useCallback((trackId: string) => {
    setState((s) => ({
      ...s,
      likedIds: s.likedIds.includes(trackId)
        ? s.likedIds.filter((id) => id !== trackId)
        : [...s.likedIds, trackId],
    }));
  }, []);

  const isLiked = useCallback((trackId: string) => state.likedIds.includes(trackId), [state.likedIds]);

  const currentTrack = state.index >= 0 ? state.queue[state.index] ?? null : null;

  const value: PlayerContextValue = {
    ...state,
    currentTrack,
    playQueue,
    playTrack,
    togglePlayPause,
    seek,
    next,
    prev,
    toggleShuffle,
    cycleRepeat,
    toggleLike,
    isLiked,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
