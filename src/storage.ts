import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PersistedStore<T> {
  get(): T;
  set(patch: Partial<T> | ((s: T) => Partial<T>)): void;
  reset(): void;
  subscribe(listener: () => void): () => void;
  use(): T;
  /** Resolves once the stored value has been read from disk. */
  ready: Promise<void>;
}

/**
 * A tiny module-level store that is persisted to AsyncStorage.
 *
 * Module-level (rather than React context) so non-React code — the audio
 * player, the scanner, the logger — can read and write it without caring
 * about provider ordering, while components still re-render through
 * `useSyncExternalStore`.
 */
export function createStore<T extends object>(key: string, defaults: T): PersistedStore<T> {
  let state: T = defaults;
  let hydrated = false;
  let pending: Partial<T> = {};
  let timer: ReturnType<typeof setTimeout> | null = null;
  const listeners = new Set<() => void>();

  const emit = () => listeners.forEach((l) => l());

  const flush = () => {
    timer = null;
    AsyncStorage.setItem(key, JSON.stringify(state)).catch(() => {});
  };
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, 250);
  };

  const ready = (async () => {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          state = { ...defaults, ...parsed };
        }
      }
    } catch {
      // corrupt or missing — fall back to defaults
    }
    // Anything written before hydration finished wins over what was on disk.
    state = { ...state, ...pending };
    pending = {};
    hydrated = true;
    emit();
  })();

  const get = () => state;
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    get,
    set(patch) {
      const resolved = typeof patch === "function" ? patch(state) : patch;
      state = { ...state, ...resolved };
      if (!hydrated) pending = { ...pending, ...resolved };
      emit();
      schedule();
    },
    reset() {
      state = defaults;
      pending = {};
      emit();
      schedule();
    },
    subscribe,
    use: () => useSyncExternalStore(subscribe, get, get),
    ready,
  };
}

export async function readRaw<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeRaw(key: string, value: unknown): void {
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
}

export function removeRaw(key: string): void {
  AsyncStorage.removeItem(key).catch(() => {});
}
