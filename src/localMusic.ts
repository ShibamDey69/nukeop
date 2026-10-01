import type * as MediaLibraryType from "expo-media-library/legacy";
import { Track } from "./data";
import { deviceStore } from "./library";
import { errorMessage, logger } from "./logger";

// "unavailable" = the native module itself couldn't be loaded (plain Expo Go,
// web, or a build that hasn't picked up expo-media-library) — distinct from
// "denied", which means the OS permission prompt was declined.
export type ScanPermissionState = "granted" | "denied" | "unavailable";

export interface ScanResult {
  tracks: Track[];
  permission: ScanPermissionState;
  errorDetail?: string;
}

/** "03 - Artist - Song_Title.mp3" -> { artist: "Artist", title: "Song Title" } */
export function parseFilename(filename: string): { title: string; artist: string } {
  const base = filename.replace(/\.[^/.]+$/, "").replace(/_/g, " ").trim();
  const cleaned = base.replace(/^\d{1,3}[\s.\-_)]+/, "").trim();
  const parts = cleaned.split(/\s+[-–—]\s+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { artist: parts[0], title: parts.slice(1).join(" - ") };
  }
  return { artist: "Unknown artist", title: cleaned || base || "Untitled track" };
}

function assetToTrack(asset: MediaLibraryType.Asset): Track {
  const { title, artist } = parseFilename(asset.filename);
  return {
    id: `local:${asset.id}`,
    title,
    artist,
    artistId: "local-device",
    albumId: "local-device",
    album: "On this device",
    duration: Math.round(asset.duration || 0),
    image: "",
    audioUrl: asset.uri,
  };
}

let scanning: Promise<ScanResult> | null = null;

/**
 * Requests audio-only media permission (if needed) and pages through the
 * device's audio files. Results are written to the device store, which
 * persists them, so the list is there immediately on the next launch.
 *
 * Concurrent calls share one scan. Every native call is wrapped separately so
 * a failure is reported (in the UI and the Logs screen) exactly where it
 * happened instead of as a generic error.
 *
 * Note: on iOS, MediaLibrary is backed by the Photos library and doesn't
 * expose a general music library, so this typically finds nothing there.
 */
export function scanDeviceMusic(): Promise<ScanResult> {
  if (!scanning) {
    scanning = runScan().finally(() => {
      scanning = null;
    });
  }
  return scanning;
}

async function runScan(): Promise<ScanResult> {
  logger.info("Scanning device for music…");

  let MediaLibrary: typeof MediaLibraryType;
  try {
    MediaLibrary = await import("expo-media-library/legacy");
  } catch (err) {
    logger.error(`expo-media-library failed to load: ${errorMessage(err)}`);
    return { tracks: [], permission: "unavailable", errorDetail: errorMessage(err) };
  }

  let permission: MediaLibraryType.PermissionResponse;
  try {
    // Ask for audio only — the default on Android 13+ also prompts for photos and videos.
    permission = await MediaLibrary.requestPermissionsAsync(false, ["audio"]);
  } catch (err) {
    logger.error(`Media permission request failed: ${errorMessage(err)}`);
    return { tracks: [], permission: "unavailable", errorDetail: errorMessage(err) };
  }

  if (!permission.granted) {
    logger.warn("Media library permission denied");
    return { tracks: [], permission: "denied" };
  }

  const found: MediaLibraryType.Asset[] = [];
  let after: string | undefined;
  let hasNextPage = true;

  try {
    while (hasNextPage) {
      const params: MediaLibraryType.AssetsOptions = {
        mediaType: MediaLibrary.MediaType.audio,
        first: 200,
      };
      // Only include the cursor once we have one — an explicit `after: undefined`
      // trips the native bridge's argument validation on some versions.
      if (after) params.after = after;

      const page = await MediaLibrary.getAssetsAsync(params);
      found.push(...page.assets);
      hasNextPage = page.hasNextPage;
      after = page.endCursor;
      if (found.length > 5000) break; // safety valve on huge libraries
    }
  } catch (err) {
    logger.error(`Reading media library failed: ${errorMessage(err)}`);
    return { tracks: [], permission: "unavailable", errorDetail: errorMessage(err) };
  }

  // Drop very short clips (ringtones, notification sounds). A duration of 0
  // means the platform didn't report one, so those are kept.
  const tracks = found.filter((a) => !a.duration || a.duration >= 20).map(assetToTrack);
  deviceStore.set({ tracks, scannedAt: Date.now() });
  logger.info(`Scan complete: ${tracks.length} tracks found (${found.length - tracks.length} short clips skipped)`);
  return { tracks, permission: "granted" };
}
