import { createStore } from "./storage";

export interface Settings {
  /** Tighter track rows. */
  compactRows: boolean;
  /** Tint Now Playing and detail headers with a per-album colour instead of the accent. */
  dynamicColors: boolean;
  /** Keep audio playing when the app is in the background. */
  backgroundPlayback: boolean;
  /** Restore the last queue (paused) on launch. */
  resumeOnLaunch: boolean;
  /** Re-scan the device for music every time the app starts. */
  rescanOnLaunch: boolean;
  /** "direct" (default) talks to YouTube from the app itself, no server needed. "server" prefers a self-hosted yt-dlp server (falls back to direct if it fails). */
  youtubeSourceMode: "direct" | "server";
  /** Base URL of a self-hosted yt-source-server instance, e.g. http://192.168.1.20:8787. Empty = not configured. */
  youtubeServerUrl: string;
}

export const DEFAULT_SETTINGS: Settings = {
  compactRows: false,
  dynamicColors: true,
  backgroundPlayback: true,
  resumeOnLaunch: true,
  rescanOnLaunch: false,
  youtubeSourceMode: "direct",
  youtubeServerUrl: "",
};

export const settingsStore = createStore<Settings>("nukeop:settings-v1", DEFAULT_SETTINGS);

export function useSettings() {
  const settings = settingsStore.use();
  return { ...settings, set: settingsStore.set };
}
