import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";
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

  const soundRef = useRef<Audio.Sound | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
        });
      } catch (err) {
        console.warn("nukeop: failed to set audio mode", err);
      }
    })();
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const onStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) setState((s) => ({ ...s, isBuffering: false }));
      return;
    }
    setState((s) => ({
      ...s,
      isBuffering: status.isBuffering,
      isPlaying: status.isPlaying,
      positionMillis: status.positionMillis ?? 0,
      durationMillis: status.durationMillis ?? s.durationMillis,
    }));
    if (status.didJustFinish) {
      const cur = stateRef.current;
      if (cur.repeatMode === "one") {
        soundRef.current?.replayAsync().catch(() => {});
        return;
      }
      const isLast = cur.index === cur.queue.length - 1;
      if (isLast && cur.repeatMode === "off" && !cur.shuffle) {
        setState((s) => ({ ...s, isPlaying: false }));
        return;
      }
      const nextIndex = pickNextIndex(cur.queue.length, cur.index, cur.shuffle);
      setState((s) => ({ ...s, index: nextIndex }));
    }
  }, []);

  const loadAndPlay = useCallback(
    async (track: Track, autoPlay: boolean) => {
      setState((s) => ({ ...s, isBuffering: true, positionMillis: 0, durationMillis: 0 }));
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.audioUrl },
        { shouldPlay: autoPlay },
        onStatusUpdate
      );
      soundRef.current = sound;
    },
    [onStatusUpdate]
  );

  useEffect(() => {
    const track = state.queue[state.index];
    if (!track) return;
    loadAndPlay(track, true).catch(() => {
      setState((s) => ({ ...s, isBuffering: false, isPlaying: false }));
    });
  }, [state.index, state.queue]);

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
    const sound = soundRef.current;
    if (!sound) return;
    if (stateRef.current.isPlaying) {
      sound.pauseAsync().catch(() => {});
    } else {
      sound.playAsync().catch(() => {});
    }
  }, []);

  const seek = useCallback((millis: number) => {
    soundRef.current?.setPositionAsync(millis).catch(() => {});
    setState((s) => ({ ...s, positionMillis: millis }));
  }, []);

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
        soundRef.current?.setPositionAsync(0).catch(() => {});
        return s;
      }
      const prevIndex = s.shuffle
        ? pickNextIndex(s.queue.length, s.index, true)
        : (s.index - 1 + s.queue.length) % s.queue.length;
      return { ...s, index: prevIndex };
    });
  }, []);

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
