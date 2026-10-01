import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AppState, Platform } from "react-native";
import { AudioPlayer, AudioStatus, createAudioPlayer, requestNotificationPermissionsAsync, setAudioModeAsync } from "expo-audio";
import type { Track } from "../data";
import { library } from "../library";
import { errorMessage, logger } from "../logger";
import { readRaw, removeRaw, writeRaw } from "../storage";
import { settingsStore } from "../settings";
import { refreshYouTubeTrack, videoIdFromTrackId } from "../plugins/youtubeSource";

export type RepeatMode = "off" | "all" | "one";
export type SleepTimer = { kind: "time"; endsAt: number } | { kind: "track" };

// ── Progress lives outside React state ────────────────────────────────────
// Position updates arrive several times a second; keeping them out of the
// main context means only the seek bar / mini-player bar re-render for them.

interface Progress {
  positionMillis: number;
  durationMillis: number;
}

let progress: Progress = { positionMillis: 0, durationMillis: 0 };
const progressListeners = new Set<() => void>();

function setProgress(p: Partial<Progress>) {
  const next = { ...progress, ...p };
  if (next.positionMillis === progress.positionMillis && next.durationMillis === progress.durationMillis) return;
  progress = next;
  progressListeners.forEach((l) => l());
}

function subscribeProgress(l: () => void) {
  progressListeners.add(l);
  return () => {
    progressListeners.delete(l);
  };
}

export function getProgress(): Progress {
  return progress;
}

export function usePlayerProgress(): Progress {
  return useSyncExternalStore(subscribeProgress, getProgress, getProgress);
}

// ── Player state ──────────────────────────────────────────────────────────

interface PlayerState {
  queue: Track[];
  index: number;
  isPlaying: boolean;
  isBuffering: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  playbackRate: number;
  sleep: SleepTimer | null;
  playError: { id: number; message: string } | null;
}

interface PlayerContextValue extends PlayerState {
  currentTrack: Track | null;
  upNext: Track[];
  playQueue: (tracks: Track[], startIndex?: number, opts?: { shuffle?: boolean }) => void;
  playTrack: (track: Track, context?: Track[]) => void;
  togglePlayPause: () => void;
  seek: (millis: number) => void;
  next: () => void;
  prev: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (tracks: Track | Track[]) => void;
  playNext: (tracks: Track | Track[]) => void;
  removeFromQueue: (queueIndex: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  jumpToQueueIndex: (queueIndex: number) => void;
  clearUpNext: () => void;
  setPlaybackRate: (rate: number) => void;
  setSleepTimer: (value: number | "track" | null) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

const SESSION_KEY = "nukeop:player-session-v1";
const MAX_SAVED_QUEUE = 300;

interface SavedSession {
  queue: Track[];
  index: number;
  positionMillis: number;
  shuffle: boolean;
  repeatMode: RepeatMode;
  playbackRate: number;
}

const INITIAL_STATE: PlayerState = {
  queue: [],
  index: -1,
  isPlaying: false,
  isBuffering: false,
  shuffle: false,
  repeatMode: "off",
  playbackRate: 1,
  sleep: null,
  playError: null,
};

const PERSISTED_KEYS: (keyof PlayerState)[] = ["queue", "index", "shuffle", "repeatMode", "playbackRate"];

function toArray<T>(v: T | T[]): T[] {
  return Array.isArray(v) ? v : [v];
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [player] = useState<AudioPlayer>(() => createAudioPlayer(null, { updateInterval: 250 }));
  const [state, setState] = useState<PlayerState>(INITIAL_STATE);
  const stateRef = useRef(state);
  const { backgroundPlayback } = settingsStore.use();

  const loadingRef = useRef(false);
  const sourceLoadedRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);
  const restoredSeekRef = useRef(0);
  const playedIdsRef = useRef<Set<string>>(new Set());
  const historyRef = useRef<string[]>([]);
  const failCountRef = useRef(0);
  const errorSeqRef = useRef(0);
  const lastErrorKeyRef = useRef<string | null>(null);
  const loadSeqRef = useRef(0);
  /** loadSeqRef value we've already tried a fresh-YouTube-URL retry for, so a track that fails twice in a row doesn't retry forever. */
  const ytRetriedSeqRef = useRef(-1);
  const endedSeqRef = useRef(-1);
  const lockActiveRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifPermAskedRef = useRef(false);

  // ── state plumbing ───────────────────────────────────────────────────

  const saveSession = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    const s = stateRef.current;
    if (s.queue.length === 0 || s.index < 0) {
      removeRaw(SESSION_KEY);
      return;
    }
    let queue = s.queue;
    let index = s.index;
    if (queue.length > MAX_SAVED_QUEUE) {
      const start = Math.max(0, Math.min(s.index - 20, queue.length - MAX_SAVED_QUEUE));
      queue = queue.slice(start, start + MAX_SAVED_QUEUE);
      index = s.index - start;
    }
    const session: SavedSession = {
      queue,
      index,
      positionMillis: progress.positionMillis,
      shuffle: s.shuffle,
      repeatMode: s.repeatMode,
      playbackRate: s.playbackRate,
    };
    writeRaw(SESSION_KEY, session);
  }, []);

  const saveSessionSoon = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveSession, 800);
  }, [saveSession]);

  const patch = useCallback(
    (p: Partial<PlayerState>) => {
      const cur = stateRef.current;
      const keys = Object.keys(p) as (keyof PlayerState)[];
      const changed = keys.filter((k) => p[k] !== cur[k]);
      if (changed.length === 0) return;
      const next = { ...cur, ...p };
      stateRef.current = next;
      setState(next);
      if (changed.some((k) => PERSISTED_KEYS.includes(k))) saveSessionSoon();
    },
    [saveSessionSoon]
  );

  // ── audio session + lock screen ──────────────────────────────────────

  const syncLockScreen = useCallback(
    (track: Track) => {
      if (!settingsStore.get().backgroundPlayback) return;

      // Android 13+ requires the POST_NOTIFICATIONS runtime permission before the
      // media-session notification (which is what keeps the foreground service —
      // and therefore background playback — alive) is allowed to show. Ask once,
      // lazily, the first time we're about to need it; a denial just means no
      // notification/lock-screen controls, playback itself still starts.
      if (Platform.OS === "android" && !notifPermAskedRef.current) {
        notifPermAskedRef.current = true;
        requestNotificationPermissionsAsync().catch((err) => {
          logger.warn(`Notification permission request failed: ${errorMessage(err)}`);
        });
      }

      try {
        const metadata = {
          title: track.title,
          artist: track.artist,
          albumTitle: track.album,
          artworkUrl: track.image && /^https?:/.test(track.image) ? track.image : undefined,
        };
        if (!lockActiveRef.current) {
          player.setActiveForLockScreen(true, metadata, { showSeekBackward: false, showSeekForward: false });
          lockActiveRef.current = true;
        } else {
          player.updateLockScreenMetadata(metadata);
        }
      } catch (err) {
        logger.warn(`Lock screen controls unavailable: ${errorMessage(err)}`);
      }
    },
    [player]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: backgroundPlayback,
          interruptionMode: "doNotMix",
        });
        if (cancelled) return;
        if (!backgroundPlayback && lockActiveRef.current) {
          player.clearLockScreenControls();
          lockActiveRef.current = false;
        } else if (backgroundPlayback) {
          const s = stateRef.current;
          const track = s.queue[s.index];
          if (track && sourceLoadedRef.current) syncLockScreen(track);
        }
      } catch (err) {
        logger.warn(`Could not configure audio mode: ${errorMessage(err)}`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [player, backgroundPlayback, syncLockScreen]);

  useEffect(() => {
    return () => {
      try {
        player.remove();
      } catch {
        // already released
      }
    };
  }, [player]);

  useEffect(() => {
    player.loop = state.repeatMode === "one";
  }, [player, state.repeatMode]);

  // ── core transport ───────────────────────────────────────────────────

  const startIndex = useCallback(
    (queue: Track[], index: number, opts: { seekMillis?: number } = {}) => {
      const track = queue[index];
      if (!track) return;

      loadSeqRef.current += 1;
      lastErrorKeyRef.current = null;
      loadingRef.current = true;
      sourceLoadedRef.current = true;
      pendingSeekRef.current = opts.seekMillis && opts.seekMillis > 1000 ? opts.seekMillis : null;
      playedIdsRef.current.add(track.id);

      patch({ queue, index, isPlaying: true, isBuffering: true, playError: null });
      setProgress({ positionMillis: opts.seekMillis ?? 0, durationMillis: track.duration * 1000 });

      try {
        player.replace({ uri: track.audioUrl });
        player.play();
        const rate = stateRef.current.playbackRate;
        if (rate !== 1) player.setPlaybackRate(rate);
      } catch (err) {
        logger.error(`Failed to start "${track.title}": ${errorMessage(err)}`);
        loadingRef.current = false;
        patch({ isPlaying: false, isBuffering: false });
      }

      syncLockScreen(track);
      library.recordPlay(track);
      logger.debug(`Playing: ${track.title} — ${track.artist}`);
    },
    [player, patch, syncLockScreen]
  );

  const restartCurrent = useCallback(() => {
    try {
      void player.seekTo(0);
      player.play();
    } catch {
      // ignore
    }
    setProgress({ positionMillis: 0 });
    patch({ isPlaying: true });
  }, [player, patch]);

  /** Index of the track that should follow the current one, or null to stop. */
  const computeNext = useCallback((s: PlayerState, natural: boolean): number | null => {
    const len = s.queue.length;
    if (len === 0) return null;

    if (s.shuffle) {
      if (len === 1) return natural && s.repeatMode !== "all" ? null : 0;
      const played = playedIdsRef.current;
      const currentId = s.queue[s.index]?.id;
      if (currentId) played.add(currentId);
      let candidates = s.queue.map((_, i) => i).filter((i) => !played.has(s.queue[i].id));
      if (candidates.length === 0) {
        if (natural && s.repeatMode !== "all") return null;
        played.clear();
        if (currentId) played.add(currentId);
        candidates = s.queue.map((_, i) => i).filter((i) => i !== s.index);
      }
      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    if (s.index < len - 1) return s.index + 1;
    if (natural && s.repeatMode === "off") return null;
    return 0;
  }, []);

  const goNext = useCallback(
    (natural: boolean) => {
      const s = stateRef.current;
      if (s.queue.length === 0) return;
      const nextIndex = computeNext(s, natural);
      if (nextIndex === null) {
        patch({ isPlaying: false });
        return;
      }
      if (s.shuffle && s.queue[s.index]) historyRef.current.push(s.queue[s.index].id);
      if (nextIndex === s.index) {
        restartCurrent();
        return;
      }
      startIndex(s.queue, nextIndex);
    },
    [computeNext, patch, restartCurrent, startIndex]
  );

  const onEnded = useCallback(() => {
    // Some platforms report "finished" on several consecutive status ticks.
    if (endedSeqRef.current === loadSeqRef.current) return;
    endedSeqRef.current = loadSeqRef.current;

    const s = stateRef.current;
    if (s.sleep?.kind === "track") {
      try {
        player.pause();
      } catch {
        // ignore
      }
      patch({ sleep: null, isPlaying: false });
      logger.info("Sleep timer: stopped at end of track");
      return;
    }
    if (s.repeatMode === "one") {
      restartCurrent();
      return;
    }
    goNext(true);
  }, [goNext, patch, player, restartCurrent]);

  const scheduleSkip = useCallback(
    (s: PlayerState, seq: number, delayMs: number) => {
      failCountRef.current += 1;
      const canSkip = s.queue.length > 1 && failCountRef.current < Math.min(s.queue.length, 4);
      if (canSkip) {
        setTimeout(() => {
          if (loadSeqRef.current === seq) goNext(false);
        }, delayMs);
      }
    },
    [goNext]
  );

  const handleError = useCallback(
    (message: string) => {
      const s = stateRef.current;
      const track = s.queue[s.index];
      const seq = loadSeqRef.current;
      const key = `${seq}:${message}`;
      if (lastErrorKeyRef.current === key) return; // status keeps reporting the same error
      lastErrorKeyRef.current = key;

      logger.error(`Playback error${track ? ` (${track.title})` : ""}: ${message}`);
      loadingRef.current = false;
      errorSeqRef.current += 1;
      patch({
        isPlaying: false,
        isBuffering: false,
        playError: {
          id: errorSeqRef.current,
          message: track ? `Couldn't play “${track.title}”` : "Playback failed",
        },
      });

      // YouTube's direct stream URLs are time-limited — a track that's been
      // sitting in a playlist for a while can fail with a plain expired-URL
      // error. Before giving up on it, try once to fetch a fresh URL for the
      // same video and resume with that, instead of just skipping a track
      // that's actually fine.
      const videoId = track ? videoIdFromTrackId(track.id) : null;
      if (track && videoId && ytRetriedSeqRef.current !== seq) {
        ytRetriedSeqRef.current = seq;
        const st = settingsStore.get();
        logger.info(`Retrying "${track.title}" with a fresh YouTube stream…`);
        refreshYouTubeTrack(track, { mode: st.youtubeSourceMode, serverUrl: st.youtubeServerUrl })
          .then((fresh) => {
            if (loadSeqRef.current !== seq) return; // user already moved on
            loadingRef.current = true;
            pendingSeekRef.current = null;
            const s2 = stateRef.current;
            patch({
              queue: s2.queue.map((t, i) => (i === s2.index ? fresh : t)),
              isPlaying: true,
              isBuffering: true,
              playError: null,
            });
            try {
              player.replace({ uri: fresh.audioUrl });
              player.play();
              logger.info(`Refreshed stream for "${fresh.title}", resuming`);
            } catch (err) {
              logger.error(`Retry failed to start "${fresh.title}": ${errorMessage(err)}`);
              loadingRef.current = false;
              scheduleSkip(s, seq, 300);
            }
          })
          .catch((err) => {
            if (loadSeqRef.current !== seq) return;
            logger.warn(`Couldn't refresh YouTube stream for "${track.title}": ${errorMessage(err)}`);
            scheduleSkip(s, seq, 300);
          });
        return;
      }

      scheduleSkip(s, seq, 700);
    },
    [patch, player, scheduleSkip]
  );

  useEffect(() => {
    const subscription = player.addListener("playbackStatusUpdate", (status: AudioStatus) => {
      if (status.error) handleError(status.error);

      if (status.isLoaded) {
        loadingRef.current = false;
        if (pendingSeekRef.current != null) {
          const ms = pendingSeekRef.current;
          pendingSeekRef.current = null;
          try {
            void player.seekTo(ms / 1000);
          } catch {
            // ignore
          }
        }
        setProgress({
          positionMillis: Math.max(0, (status.currentTime ?? 0) * 1000),
          durationMillis: status.duration > 0 ? status.duration * 1000 : progress.durationMillis,
        });
        if (status.playing) failCountRef.current = 0;
      }

      if (!stateRef.current.playError) {
        patch({
          isPlaying: loadingRef.current ? stateRef.current.isPlaying : !!status.playing,
          isBuffering: loadingRef.current || !!status.isBuffering,
        });
      }

      if (status.didJustFinish) onEnded();
    });
    return () => subscription.remove();
  }, [player, patch, handleError, onEnded]);

  // ── public actions ───────────────────────────────────────────────────

  const playQueue = useCallback(
    (tracks: Track[], startAt = 0, opts?: { shuffle?: boolean }) => {
      if (tracks.length === 0) return;
      playedIdsRef.current = new Set();
      historyRef.current = [];
      failCountRef.current = 0;
      let start = Math.min(Math.max(startAt, 0), tracks.length - 1);
      if (opts?.shuffle) {
        start = Math.floor(Math.random() * tracks.length);
        patch({ shuffle: true });
      }
      startIndex(tracks, start);
    },
    [patch, startIndex]
  );

  const playTrack = useCallback(
    (track: Track, context?: Track[]) => {
      const list = context && context.length > 0 ? context : [track];
      const idx = list.findIndex((t) => t.id === track.id);
      playQueue(list, idx >= 0 ? idx : 0);
    },
    [playQueue]
  );

  const togglePlayPause = useCallback(() => {
    const s = stateRef.current;
    if (!s.queue[s.index]) return;

    // Restored from a previous session, or the last load failed: (re)load first.
    if (!sourceLoadedRef.current || s.playError) {
      startIndex(s.queue, s.index, { seekMillis: sourceLoadedRef.current ? 0 : restoredSeekRef.current });
      return;
    }

    try {
      if (player.playing) {
        player.pause();
        patch({ isPlaying: false });
        saveSession();
      } else {
        if (progress.durationMillis > 0 && progress.positionMillis >= progress.durationMillis - 400) {
          void player.seekTo(0);
        }
        player.play();
        patch({ isPlaying: true });
      }
    } catch (err) {
      logger.error(`Play/pause failed: ${errorMessage(err)}`);
    }
  }, [patch, player, saveSession, startIndex]);

  const seek = useCallback(
    (millis: number) => {
      const target = Math.max(0, millis);
      setProgress({ positionMillis: target });
      if (!sourceLoadedRef.current) {
        restoredSeekRef.current = target;
        return;
      }
      try {
        void player.seekTo(target / 1000);
      } catch {
        // ignore
      }
    },
    [player]
  );

  const next = useCallback(() => goNext(false), [goNext]);

  const prev = useCallback(() => {
    const s = stateRef.current;
    if (s.queue.length === 0) return;
    if (progress.positionMillis > 3000 || !sourceLoadedRef.current) {
      seek(0);
      return;
    }
    if (s.shuffle) {
      const id = historyRef.current.pop();
      const idx = id ? s.queue.findIndex((t) => t.id === id) : -1;
      if (idx >= 0) startIndex(s.queue, idx);
      else seek(0);
      return;
    }
    if (s.index > 0) startIndex(s.queue, s.index - 1);
    else if (s.repeatMode === "all" && s.queue.length > 1) startIndex(s.queue, s.queue.length - 1);
    else seek(0);
  }, [seek, startIndex]);

  const toggleShuffle = useCallback(() => {
    playedIdsRef.current = new Set();
    historyRef.current = [];
    patch({ shuffle: !stateRef.current.shuffle });
  }, [patch]);

  const cycleRepeat = useCallback(() => {
    const order: RepeatMode[] = ["off", "all", "one"];
    const cur = stateRef.current.repeatMode;
    patch({ repeatMode: order[(order.indexOf(cur) + 1) % order.length] });
  }, [patch]);

  const playNext = useCallback(
    (input: Track | Track[]) => {
      const tracks = toArray(input);
      if (tracks.length === 0) return;
      const s = stateRef.current;
      if (s.index < 0 || s.queue.length === 0) {
        playQueue(tracks, 0);
        return;
      }
      const queue = [...s.queue];
      queue.splice(s.index + 1, 0, ...tracks);
      patch({ queue });
    },
    [patch, playQueue]
  );

  const addToQueue = useCallback(
    (input: Track | Track[]) => {
      const tracks = toArray(input);
      if (tracks.length === 0) return;
      const s = stateRef.current;
      if (s.index < 0 || s.queue.length === 0) {
        playQueue(tracks, 0);
        return;
      }
      patch({ queue: [...s.queue, ...tracks] });
    },
    [patch, playQueue]
  );

  const removeFromQueue = useCallback(
    (queueIndex: number) => {
      const s = stateRef.current;
      if (queueIndex <= s.index || queueIndex >= s.queue.length) return; // only upcoming tracks
      patch({ queue: s.queue.filter((_, i) => i !== queueIndex) });
    },
    [patch]
  );

  const reorderQueue = useCallback(
    (fromIndex: number, toIndex: number) => {
      const s = stateRef.current;
      const len = s.queue.length;
      if (fromIndex <= s.index || toIndex <= s.index) return;
      if (fromIndex < 0 || fromIndex >= len || toIndex < 0 || toIndex >= len) return;
      const queue = [...s.queue];
      const [moved] = queue.splice(fromIndex, 1);
      queue.splice(toIndex, 0, moved);
      patch({ queue });
    },
    [patch]
  );

  const jumpToQueueIndex = useCallback(
    (queueIndex: number) => {
      const s = stateRef.current;
      if (queueIndex < 0 || queueIndex >= s.queue.length) return;
      if (s.shuffle && s.queue[s.index]) historyRef.current.push(s.queue[s.index].id);
      startIndex(s.queue, queueIndex);
    },
    [startIndex]
  );

  const clearUpNext = useCallback(() => {
    const s = stateRef.current;
    if (s.index < 0) return;
    patch({ queue: s.queue.slice(0, s.index + 1) });
  }, [patch]);

  const setPlaybackRate = useCallback(
    (rate: number) => {
      try {
        player.setPlaybackRate(rate);
      } catch (err) {
        logger.warn(`Playback speed not supported: ${errorMessage(err)}`);
      }
      patch({ playbackRate: rate });
    },
    [patch, player]
  );

  const setSleepTimer = useCallback(
    (value: number | "track" | null) => {
      if (value === null) patch({ sleep: null });
      else if (value === "track") patch({ sleep: { kind: "track" } });
      else patch({ sleep: { kind: "time", endsAt: Date.now() + value * 60_000 } });
    },
    [patch]
  );

  // ── effects: sleep timer, persistence, restore ───────────────────────

  useEffect(() => {
    const sleep = state.sleep;
    if (sleep?.kind !== "time") return;
    const timer = setTimeout(() => {
      try {
        player.pause();
      } catch {
        // ignore
      }
      patch({ sleep: null, isPlaying: false });
      saveSession();
      logger.info("Sleep timer: paused playback");
    }, Math.max(0, sleep.endsAt - Date.now()));
    return () => clearTimeout(timer);
  }, [state.sleep, player, patch, saveSession]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (stateRef.current.isPlaying) saveSession();
    }, 10_000);
    const sub = AppState.addEventListener("change", (status) => {
      if (status !== "active") saveSession();
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [saveSession]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await settingsStore.ready;
      if (!settingsStore.get().resumeOnLaunch) return;
      const session = await readRaw<SavedSession | null>(SESSION_KEY, null);
      if (cancelled || !session || !Array.isArray(session.queue) || session.queue.length === 0) return;
      if (stateRef.current.queue.length > 0) return; // the user already started something

      const index = Math.min(Math.max(session.index ?? 0, 0), session.queue.length - 1);
      const track = session.queue[index];
      restoredSeekRef.current = session.positionMillis ?? 0;
      patch({
        queue: session.queue,
        index,
        shuffle: !!session.shuffle,
        repeatMode: session.repeatMode ?? "off",
        playbackRate: session.playbackRate ?? 1,
      });
      setProgress({ positionMillis: session.positionMillis ?? 0, durationMillis: track.duration * 1000 });
      logger.info(`Restored last session (${session.queue.length} tracks)`);
    })();
    return () => {
      cancelled = true;
    };
  }, [patch]);

  const currentTrack = state.index >= 0 ? state.queue[state.index] ?? null : null;
  const upNext = useMemo(() => (state.index >= 0 ? state.queue.slice(state.index + 1) : state.queue), [state.queue, state.index]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      ...state,
      currentTrack,
      upNext,
      playQueue,
      playTrack,
      togglePlayPause,
      seek,
      next,
      prev,
      toggleShuffle,
      cycleRepeat,
      addToQueue,
      playNext,
      removeFromQueue,
      reorderQueue,
      jumpToQueueIndex,
      clearUpNext,
      setPlaybackRate,
      setSleepTimer,
    }),
    [
      state,
      currentTrack,
      upNext,
      playQueue,
      playTrack,
      togglePlayPause,
      seek,
      next,
      prev,
      toggleShuffle,
      cycleRepeat,
      addToQueue,
      playNext,
      removeFromQueue,
      reorderQueue,
      jumpToQueueIndex,
      clearUpNext,
      setPlaybackRate,
      setSleepTimer,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
