// YouTube Source plugin — public API used by the UI (SearchScreen,
// PreferencesScreen, PlayerContext).
//
// Two ways this can resolve a video into something playable:
//   - "direct" (default): talks to YouTube's own API straight from the
//     app (`youtubeInnertube.ts`). No server, no setup. Search always
//     works this way; stream playback is best-effort (see that file's
//     header comment for why).
//   - "server" (optional/advanced): talks to a self-hosted companion
//     server that runs the real yt-dlp (`youtubeServer.ts`). More
//     reliable for playback, needs the user to run something.
//
// `resolveYouTubeTrack` tries direct first and, if a server URL is
// configured, transparently falls back to it on failure — so setting up
// the server is a strict upgrade in reliability, never a requirement.

import type { Track } from "../data";
import { logger } from "../logger";
import { resolveStreamDirect, searchDirect } from "./youtubeInnertube";
import { pingYouTubeServer, resolveStreamViaServer, searchViaServer } from "./youtubeServer";
import { YouTubeSourceError, type YouTubeSearchResult } from "./youtubeTypes";

export type { YouTubeSearchResult } from "./youtubeTypes";
export { YouTubeSourceError } from "./youtubeTypes";
export { pingYouTubeServer } from "./youtubeServer";

export interface YouTubeSourceSettings {
  mode: "direct" | "server";
  serverUrl: string;
}

const YT_ID_PREFIX = "yt:";

export function isYouTubeTrackId(id: string): boolean {
  return id.startsWith(YT_ID_PREFIX);
}

export function videoIdFromTrackId(id: string): string | null {
  return id.startsWith(YT_ID_PREFIX) ? id.slice(YT_ID_PREFIX.length) : null;
}

function trackFromResult(result: YouTubeSearchResult, audioUrl: string): Track {
  return {
    id: `${YT_ID_PREFIX}${result.id}`,
    title: result.title,
    artist: result.channel,
    artistId: `yt-channel:${result.channel}`,
    albumId: "yt-source",
    album: "YouTube",
    duration: result.durationSeconds,
    image: result.thumbnail,
    audioUrl,
  };
}

/** Search YouTube. Always direct/server-less — search doesn't need the optional server. */
export async function searchYouTube(query: string, settings: YouTubeSourceSettings, limit = 20): Promise<YouTubeSearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  if (settings.mode === "server" && settings.serverUrl.trim()) {
    try {
      return await searchViaServer(q, settings.serverUrl, limit);
    } catch (e) {
      logger.warn(`YouTube search via server failed, trying direct: ${e instanceof Error ? e.message : String(e)}`);
      // fall through to direct
    }
  }

  try {
    return await searchDirect(q, limit);
  } catch (e) {
    if (settings.serverUrl.trim() && settings.mode !== "server") {
      // Direct failed but a server is configured as a fallback — try it.
      try {
        return await searchViaServer(q, settings.serverUrl, limit);
      } catch {
        // fall through to the direct error below, which is the more useful one
      }
    }
    throw new YouTubeSourceError(e instanceof Error ? e.message : "YouTube search failed.");
  }
}

/**
 * Resolves a search result to a direct, playable audio stream and wraps
 * it as a normal library `Track`. Tries direct resolution first; falls
 * back to the self-hosted server if one is configured and direct fails.
 */
export async function resolveYouTubeTrack(result: YouTubeSearchResult, settings: YouTubeSourceSettings): Promise<Track> {
  const hasServer = settings.serverUrl.trim().length > 0;

  if (settings.mode === "server" && hasServer) {
    try {
      const url = await resolveStreamViaServer(result.id, settings.serverUrl);
      return trackFromResult(result, url);
    } catch (e) {
      logger.warn(`Stream resolve via server failed, trying direct: ${e instanceof Error ? e.message : String(e)}`);
      // fall through to direct as a last resort
    }
  }

  try {
    const stream = await resolveStreamDirect(result.id);
    return trackFromResult(result, stream.url);
  } catch (directErr) {
    if (hasServer) {
      try {
        const url = await resolveStreamViaServer(result.id, settings.serverUrl);
        return trackFromResult(result, url);
      } catch (serverErr) {
        throw new YouTubeSourceError(
          `Couldn't play this video directly, and the self-hosted server also failed: ${serverErr instanceof Error ? serverErr.message : String(serverErr)}`
        );
      }
    }
    throw new YouTubeSourceError(
      `Couldn't get a playable stream for this video (${directErr instanceof Error ? directErr.message : String(directErr)}). ` +
        `For more reliable YouTube playback, set up the self-hosted server in Preferences → YouTube Source → Advanced.`
    );
  }
}

/**
 * Re-resolves a fresh stream URL for a `Track` that was originally
 * sourced from YouTube (id starts with "yt:"). YouTube's direct stream
 * URLs are time-limited (a handful of hours), so anything saved to a
 * playlist or Liked Songs needs a fresh one fetched right before it
 * actually plays rather than reusing whatever URL was resolved when it
 * was added. Keeps every other field (title/artist/artwork/duration) —
 * only `audioUrl` changes.
 */
export async function refreshYouTubeTrack(track: Track, settings: YouTubeSourceSettings): Promise<Track> {
  const videoId = videoIdFromTrackId(track.id);
  if (!videoId) return track; // not a YouTube track — nothing to do

  const result: YouTubeSearchResult = {
    id: videoId,
    title: track.title,
    channel: track.artist,
    durationSeconds: track.duration,
    thumbnail: track.image,
  };
  const fresh = await resolveYouTubeTrack(result, settings);
  return { ...track, audioUrl: fresh.audioUrl };
}
