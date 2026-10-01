// Optional, advanced half of the YouTube Source plugin: talks over HTTP
// to a self-hosted companion server (`yt-source-server/` at the repo
// root) that runs the real `yt-dlp` binary.
//
// This is no longer required for the plugin to work — direct, in-app
// resolution (`youtubeInnertube.ts`) covers search and playback without
// any server. This file exists for people who want the extra
// reliability of real, actively-maintained yt-dlp: YouTube tightens its
// anti-bot requirements over time, and unlike the bundled direct client,
// a real yt-dlp install gets updated by its maintainers to keep working
// through those changes (including generating the "Proof of Origin"
// tokens some clients now require, which nothing running purely in a
// mobile app sandbox can do).
//
// Configured in Preferences → YouTube Source → Advanced, and stored in
// `settingsStore` as `youtubeServerUrl`.

import { errorMessage, logger } from "../logger";
import { YouTubeSourceError, type YouTubeSearchResult } from "./youtubeTypes";

export function normalizeServerUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");
  if (!trimmed) throw new YouTubeSourceError("No self-hosted server URL is set. Add one in Preferences → YouTube Source.");
  return trimmed;
}

async function getJson<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (e) {
    throw new YouTubeSourceError(`Couldn't reach the YouTube server: ${errorMessage(e)}`);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new YouTubeSourceError(`YouTube server returned ${res.status}${body ? `: ${body.slice(0, 200)}` : ""}`);
  }
  return res.json() as Promise<T>;
}

/** Search YouTube via the companion server (which shells out to `yt-dlp "ytsearchN:<query>"`). */
export async function searchViaServer(query: string, baseUrl: string, limit = 20): Promise<YouTubeSearchResult[]> {
  const base = normalizeServerUrl(baseUrl);
  const q = query.trim();
  if (!q) return [];
  logger.info(`YouTube Source (server): searching "${q}"`);
  const data = await getJson<{ results: YouTubeSearchResult[] }>(`${base}/search?q=${encodeURIComponent(q)}&limit=${limit}`);
  return data.results ?? [];
}

/** Ask the server to resolve a video id to a direct, playable audio stream URL. */
export async function resolveStreamViaServer(videoId: string, baseUrl: string): Promise<string> {
  const base = normalizeServerUrl(baseUrl);
  logger.info(`YouTube Source (server): resolving stream for ${videoId}`);
  const data = await getJson<{ url: string }>(`${base}/stream?id=${encodeURIComponent(videoId)}`);
  if (!data.url) throw new YouTubeSourceError("Server didn't return a stream URL.");
  return data.url;
}

/** True if the server responds at all — used for a quick "Connected" check in Preferences. */
export async function pingYouTubeServer(baseUrl: string): Promise<boolean> {
  try {
    const base = normalizeServerUrl(baseUrl);
    const res = await fetch(`${base}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
