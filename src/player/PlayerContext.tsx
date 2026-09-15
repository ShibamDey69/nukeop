import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { Platform } from "react-native";
import { AudioPlayer, AudioStatus, createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { Track } from "../data";
import { resolveTrackUri } from "../localLibrary";

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

export interface PlayerContextValue extends PlayerState {
  currentTrack: Track | null;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  playTrack: (track: Track, context?: Track[]) => void;
  playNext: (track: Track) => void;
  togglePlayPause: () => void;
  seek: (millis: number) => void;
  next: () => void;
  prev: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleLike: (trackId: string) => void;
  isLiked: (trackId: string) => boolean;
  jumpToIndex: (index: number) => void;
  removeFromQueue: (index: number) => void;
  moveQueueItem: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  addToQueue: (track: Track) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

function pickNextIndex(len: number, current: number, shuffle: boolean): number {
  if (len <= 1) return current >= 0 ? current : 0;
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

  const lastTrackIdRef = useRef<string | null>(null);

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
        if (typeof (player as any).remove === "function") {
          (player as any).remove();
        } else if (typeof (player as any).release === "function") {
          (player as any).release();
        }
      } catch {}
    };
  }, [player]);

  useEffect(() => {
    const subscription = player.addListener("playbackStatusUpdate", (status: AudioStatus) => {
      if (!status) return;

      const rawPos = status.currentTime ?? 0;
      const rawDur = status.duration ?? 0;
      const posMillis = Platform.OS === "web" ? rawPos : rawPos * 1000;
      const durMillis = Platform.OS === "web" ? rawDur : rawDur * 1000;

      setState((s) => ({
        ...s,
        isBuffering: status.playbackState === "loading" || status.playbackState === "buffering",
        isPlaying: typeof status.playing === "boolean" ? status.playing : s.isPlaying,
        positionMillis: Math.max(0, posMillis),
        durationMillis: durMillis > 0 ? durMillis : s.durationMillis,
      }));

      if (status.didJustFinish) {
        const cur = stateRef.current;
        if (cur.repeatMode === "one") {
          try {
            player.seekTo(0);
            player.play();
          } catch {}
          return;
        }
        const isLast = cur.index >= cur.queue.length - 1;
        if (isLast && cur.repeatMode === "off" && !cur.shuffle) {
          setState((s) => ({ ...s, isPlaying: false, positionMillis: 0 }));
          return;
        }
        const nextIndex = pickNextIndex(cur.queue.length, cur.index, cur.shuffle);
        lastTrackIdRef.current = null;
        setState((s) => ({ ...s, index: nextIndex, isPlaying: true, positionMillis: 0 }));
      }
    });
    return () => subscription.remove();
  }, [player]);

  useEffect(() => {
    try {
      player.loop = state.repeatMode === "one";
    } catch {}
  }, [player, state.repeatMode]);

  // Load and play track when current index / track changes
  useEffect(() => {
    const track = state.queue[state.index];
    if (!track) {
      lastTrackIdRef.current = null;
      return;
    }
    if (track.id === lastTrackIdRef.current) {
      return;
    }
    lastTrackIdRef.current = track.id;

    let isMounted = true;
    (async () => {
      try {
        setState((s) => ({
          ...s,
          isBuffering: true,
          positionMillis: 0,
          durationMillis: track.duration ? track.duration * 1000 : 0,
        }));
        const uri = track.isLocal
          ? await resolveTrackUri(track.id.replace(/^local-/, ""), track.audioUrl)
          : track.audioUrl;
        if (!isMounted) return;
        player.replace({ uri });
        player.play();
        setState((s) => ({ ...s, isBuffering: false, isPlaying: true }));
      } catch (err) {
        console.warn("nukeop: failed to load track", err);
        if (isMounted) {
          setState((s) => ({ ...s, isBuffering: false, isPlaying: false }));
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [player, state.index, state.queue]);

  // Progress ticker for smooth UI updates across environments
  useEffect(() => {
    if (!state.isPlaying) return;
    const interval = setInterval(() => {
      setState((s) => {
        if (!s.isPlaying || s.isBuffering || s.index === -1) return s;
        const total =
          s.durationMillis > 0
            ? s.durationMillis
            : s.queue[s.index]?.duration
            ? s.queue[s.index].duration * 1000
            : 0;

        if (total > 0 && s.positionMillis >= total) {
          if (s.repeatMode === "one") {
            try {
              player.seekTo(0);
            } catch {}
            return { ...s, positionMillis: 0 };
          }
          const isLast = s.index >= s.queue.length - 1;
          if (isLast && s.repeatMode === "off" && !s.shuffle) {
            return { ...s, isPlaying: false, positionMillis: 0 };
          }
          const nextIndex = pickNextIndex(s.queue.length, s.index, s.shuffle);
          lastTrackIdRef.current = null;
          return { ...s, index: nextIndex, positionMillis: 0, isPlaying: true };
        }
        return { ...s, positionMillis: s.positionMillis + 500 };
      });
    }, 500);
    return () => clearInterval(interval);
  }, [state.isPlaying, player]);

  const playQueue = useCallback((tracks: Track[], startIndex = 0) => {
    if (tracks.length === 0) return;
    lastTrackIdRef.current = null;
    setState((s) => ({
      ...s,
      queue: tracks,
      index: Math.min(startIndex, tracks.length - 1),
      isPlaying: true,
      positionMillis: 0,
    }));
  }, []);

  const playTrack = useCallback((track: Track, context?: Track[]) => {
    const list = context && context.length > 0 ? context : [track];
    const idx = list.findIndex((t) => t.id === track.id);
    const targetIdx = idx >= 0 ? idx : 0;

    lastTrackIdRef.current = null;
    setState((s) => ({
      ...s,
      queue: list,
      index: targetIdx,
      isPlaying: true,
      positionMillis: 0,
    }));
  }, []);

  const playNext = useCallback((track: Track) => {
    setState((s) => {
      if (s.queue.length === 0) {
        lastTrackIdRef.current = null;
        return { ...s, queue: [track], index: 0, isPlaying: true, positionMillis: 0 };
      }
      const insertAt = s.index + 1;
      const newQueue = [...s.queue.slice(0, insertAt), track, ...s.queue.slice(insertAt)];
      return { ...s, queue: newQueue };
    });
  }, []);

  const togglePlayPause = useCallback(() => {
    try {
      const cur = stateRef.current;
      if (cur.isPlaying) {
        player.pause();
        setState((s) => ({ ...s, isPlaying: false }));
      } else {
        if (cur.index === -1 && cur.queue.length > 0) {
          lastTrackIdRef.current = null;
          setState((s) => ({ ...s, index: 0, isPlaying: true, positionMillis: 0 }));
        } else {
          player.play();
          setState((s) => ({ ...s, isPlaying: true }));
        }
      }
    } catch (err) {
      console.warn("nukeop: togglePlayPause error", err);
    }
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
      lastTrackIdRef.current = null;
      return {
        ...s,
        index: pickNextIndex(s.queue.length, s.index, s.shuffle),
        isPlaying: true,
        positionMillis: 0,
      };
    });
  }, []);

  const prev = useCallback(() => {
    setState((s) => {
      if (s.queue.length === 0) return s;
      if (s.positionMillis > 4000) {
        try {
          player.seekTo(0);
        } catch {}
        return { ...s, positionMillis: 0 };
      }
      const prevIndex = s.shuffle
        ? pickNextIndex(s.queue.length, s.index, true)
        : (s.index - 1 + s.queue.length) % s.queue.length;
      lastTrackIdRef.current = null;
      return { ...s, index: prevIndex, isPlaying: true, positionMillis: 0 };
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

  const isLiked = useCallback(
    (trackId: string) => state.likedIds.includes(trackId),
    [state.likedIds]
  );

  const jumpToIndex = useCallback((index: number) => {
    setState((s) => {
      if (index < 0 || index >= s.queue.length) return s;
      lastTrackIdRef.current = null;
      return { ...s, index, isPlaying: true, positionMillis: 0 };
    });
  }, []);

  const removeFromQueue = useCallback((removeIdx: number) => {
    setState((s) => {
      if (removeIdx < 0 || removeIdx >= s.queue.length) return s;
      const newQueue = s.queue.filter((_, i) => i !== removeIdx);
      let newIndex = s.index;
      if (removeIdx < s.index) {
        newIndex = Math.max(0, s.index - 1);
      } else if (removeIdx === s.index) {
        newIndex = Math.min(s.index, newQueue.length - 1);
        lastTrackIdRef.current = null;
      }
      return {
        ...s,
        queue: newQueue,
        index: newIndex,
        isPlaying: newQueue.length > 0 ? s.isPlaying : false,
      };
    });
  }, []);

  const moveQueueItem = useCallback((fromIndex: number, toIndex: number) => {
    setState((s) => {
      if (
        fromIndex < 0 ||
        fromIndex >= s.queue.length ||
        toIndex < 0 ||
        toIndex >= s.queue.length ||
        fromIndex === toIndex
      ) {
        return s;
      }
      const newQueue = [...s.queue];
      const [moved] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, moved);
      let newIndex = s.index;
      if (s.index === fromIndex) {
        newIndex = toIndex;
      } else if (fromIndex < s.index && toIndex >= s.index) {
        newIndex = s.index - 1;
      } else if (fromIndex > s.index && toIndex <= s.index) {
        newIndex = s.index + 1;
      }
      return { ...s, queue: newQueue, index: newIndex };
    });
  }, []);

  const clearQueue = useCallback(() => {
    setState((s) => {
      if (s.index < 0 || !s.queue[s.index]) {
        return { ...s, queue: [], index: -1, isPlaying: false, positionMillis: 0 };
      }
      return { ...s, queue: [s.queue[s.index]], index: 0 };
    });
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setState((s) => {
      const newQueue = [...s.queue, track];
      const newIndex = s.index === -1 ? 0 : s.index;
      return { ...s, queue: newQueue, index: newIndex };
    });
  }, []);

  const currentTrack = state.index >= 0 ? state.queue[state.index] ?? null : null;

  const value: PlayerContextValue = {
    ...state,
    currentTrack,
    playQueue,
    playTrack,
    playNext,
    togglePlayPause,
    seek,
    next,
    prev,
    toggleShuffle,
    cycleRepeat,
    toggleLike,
    isLiked,
    jumpToIndex,
    removeFromQueue,
    moveQueueItem,
    clearQueue,
    addToQueue,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
