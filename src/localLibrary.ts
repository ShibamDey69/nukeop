import { requestPermissionsAsync, Query, Asset, AssetField, MediaType } from "expo-media-library";
import { LocalTrack } from "./data";

export type ScanStatus = "idle" | "requesting-permission" | "scanning" | "done" | "denied" | "error";

/**
 * Best-effort "Artist - Title.mp3" filename parsing. Most locally scanned
 * files won't have this pattern — that's fine, we fall back to a sane
 * default so the UI never shows a blank field.
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
 * Scans the device for audio files using expo-media-library's current
 * class-based Query API (not the deprecated root-level function exports —
 * see README). Metadata is pulled via `exeForMetadata()`, which is the
 * cheap bulk read (no per-file URI resolution), so scanning hundreds of
 * tracks stays fast. The playable file `uri` is resolved lazily per-track
 * via `resolveTrackUri()` only when something actually needs to play it.
 */
export async function scanLocalAudio(): Promise<{
  status: ScanStatus;
  tracks: LocalTrack[];
}> {
  const permission = await requestPermissionsAsync(false, ["audio"]);
  if (!permission.granted) {
    return { status: "denied", tracks: [] };
  }

  try {
    const metadata = await new Query()
      .eq(AssetField.MEDIA_TYPE, MediaType.AUDIO)
      .orderBy(AssetField.CREATION_TIME)
      .limit(200)
      .exeForMetadata();

    const tracks: LocalTrack[] = metadata.map((asset) => {
      const { title, artist } = parseFilename(asset.filename ?? "Untitled");
      return {
        id: asset.id,
        // Resolved on demand — see resolveTrackUri() below.
        uri: "",
        filename: asset.filename ?? "Untitled",
        title,
        artist,
        duration: Math.round((asset.duration ?? 0) / 1000),
        // The media store doesn't surface embedded album art directly, so
        // we always fall back to the generated default artwork tile in the UI.
        hasArtwork: false,
      };
    });

    return { status: "done", tracks };
  } catch {
    return { status: "error", tracks: [] };
  }
}

/** Resolves the playable file URI for a scanned track, right before playback. */
export async function resolveTrackUri(assetId: string): Promise<string> {
  const asset = new Asset(assetId);
  return asset.getUri();
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
