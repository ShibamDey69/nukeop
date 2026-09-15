import { requestPermissionsAsync, getAssetsAsync, getAssetInfoAsync } from "expo-media-library";
import { LocalTrack, DEMO_LOCAL_TRACKS } from "./data";

export type ScanStatus = "idle" | "requesting-permission" | "scanning" | "done" | "denied" | "error";

/**
 * Best-effort "Artist - Title.mp3" filename parsing.
 */
function parseFilename(filename: string): { title: string; artist: string } {
  const withoutExt = filename.replace(/\.[a-zA-Z0-9]+$/, "");
  const parts = withoutExt.split(/\s*-\s*/);
  if (parts.length >= 2) {
    const [artist, ...rest] = parts;
    return { artist: artist.trim() || "Unknown Artist", title: rest.join(" - ").trim() || withoutExt };
  }
  return { title: withoutExt || "Untitled track", artist: "Unknown Artist" };
}

/**
 * Scans the device for local audio files using expo-media-library.
 * If permission is denied or no files exist (e.g. testing in simulator or empty device),
 * graceful fallback to DEMO_LOCAL_TRACKS allows immediate playback testing.
 */
export async function scanLocalAudio(): Promise<{
  status: ScanStatus;
  tracks: LocalTrack[];
}> {
  try {
    const permission = await requestPermissionsAsync(false, ["audio"]);
    if (!permission.granted) {
      return { status: "denied", tracks: DEMO_LOCAL_TRACKS };
    }

    const res = await getAssetsAsync({
      mediaType: ["audio"],
      first: 200,
    });

    if (res.assets && res.assets.length > 0) {
      const tracks: LocalTrack[] = res.assets.map((asset) => {
        const { title, artist } = parseFilename(asset.filename ?? "Untitled");
        return {
          id: asset.id,
          uri: asset.uri,
          filename: asset.filename ?? "Untitled",
          title,
          artist,
          duration: Math.round(asset.duration ?? 0),
          hasArtwork: false,
        };
      });
      return { status: "done", tracks };
    }

    // Fallback to sample local tracks so user can test local audio playback
    return { status: "done", tracks: DEMO_LOCAL_TRACKS };
  } catch (err) {
    console.warn("Local audio scan error, using fallback demo tracks:", err);
    return { status: "done", tracks: DEMO_LOCAL_TRACKS };
  }
}

/** Resolves the playable file URI for a scanned track, right before playback. */
export async function resolveTrackUri(assetId: string, currentUri?: string): Promise<string> {
  if (currentUri && currentUri.length > 0) return currentUri;
  try {
    const info = await getAssetInfoAsync(assetId);
    return info.localUri || info.uri;
  } catch {
    return currentUri || "";
  }
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
