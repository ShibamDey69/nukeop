import type * as MediaLibraryType from "expo-media-library";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Track } from "./data";

const LOCAL_TRACKS_STORAGE_KEY = "nukeop:local-device-tracks";
const FALLBACK_ART = "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=400&q=60";

// "unavailable" = the native module itself couldn't be loaded (plain Expo
// Go, or a build that hasn't picked up expo-media-library yet) — distinct
// from "denied", which means the OS permission prompt was declined.
export type ScanPermissionState = "unknown" | "granted" | "denied" | "unavailable";

function assetToTrack(asset: MediaLibraryType.Asset): Track {
  // On-device files rarely carry clean artist metadata through MediaLibrary,
  // so we fall back gracefully rather than showing "undefined".
  const rawTitle = asset.filename.replace(/\.[^/.]+$/, "");
  return {
    id: `local:${asset.id}`,
    title: rawTitle || "Untitled track",
    artist: "On this device",
    artistId: "local-device",
    albumId: "local-device",
    album: "Local Storage",
    duration: Math.round(asset.duration || 0),
    image: FALLBACK_ART,
    audioUrl: asset.uri,
  };
}

export async function loadCachedLocalTracks(): Promise<Track[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_TRACKS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Track[]) : [];
  } catch {
    return [];
  }
}

async function persistLocalTracks(tracks: Track[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCAL_TRACKS_STORAGE_KEY, JSON.stringify(tracks));
  } catch {
    // best-effort — a failed cache write just means we rescan next time
  }
}

export interface ScanResult {
  tracks: Track[];
  permission: ScanPermissionState;
}

/**
 * Requests media-library permission (if needed) and scans the device for
 * audio files, paging through expo-media-library's results. The final list
 * is cached locally so it's available immediately on next launch without a
 * rescan.
 *
 * The module is imported lazily (only when this function actually runs)
 * rather than at the top of the file. expo-media-library needs a native
 * module that plain Expo Go — and any build that hasn't been freshly
 * compiled since the package was added — simply doesn't have. Importing it
 * eagerly would throw during app startup and take the whole app down before
 * a single screen renders; importing it here means a missing module only
 * disables this one feature, with a message the UI can show.
 *
 * Note: Apple's Photos-library-backed MediaLibrary API doesn't expose a
 * general-purpose music library on iOS the way it does on Android — so on
 * iOS this will typically come back empty even with permission granted.
 */
export async function scanDeviceMusic(): Promise<ScanResult> {
  let MediaLibrary: typeof MediaLibraryType;
  try {
    MediaLibrary = await import("expo-media-library");
  } catch {
    return { tracks: [], permission: "unavailable" };
  }

  let permissionResponse: MediaLibraryType.PermissionResponse;
  try {
    permissionResponse = await MediaLibrary.requestPermissionsAsync();
  } catch {
    // The JS module loaded but the native side isn't there — same
    // end-user situation as a missing module (needs a fresh/dev build).
    return { tracks: [], permission: "unavailable" };
  }

  if (!permissionResponse.granted) {
    return { tracks: [], permission: "denied" };
  }

  const found: MediaLibraryType.Asset[] = [];
  let after: string | undefined;
  let hasNextPage = true;

  while (hasNextPage) {
    const page = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 200,
      after,
    });
    found.push(...page.assets);
    hasNextPage = page.hasNextPage;
    after = page.endCursor;
    // Safety valve — don't loop forever on a device with an enormous library.
    if (found.length > 5000) break;
  }

  const tracks = found.map(assetToTrack);
  await persistLocalTracks(tracks);
  return { tracks, permission: "granted" };
}
