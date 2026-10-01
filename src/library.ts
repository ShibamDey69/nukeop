import { useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStore } from "./storage";
import { logger } from "./logger";
import { LIKED_PLAYLIST_ID } from "./data";
import type { Album, Artist, Playlist, Track } from "./data";

export { LIKED_PLAYLIST_ID };

export interface UserPlaylist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
  updatedAt: number;
}

interface LibraryData {
  /** Newest first. */
  likedIds: string[];
  playlists: UserPlaylist[];
  /** Most recently played first. */
  recents: string[];
  /** trackId -> number of times played. Powers the "Most played" smart playlist. */
  playCounts: Record<string, number>;
  searches: string[];
  seeded: boolean;
}

interface DeviceData {
  tracks: Track[];
  scannedAt: number | null;
}

/** Full Track objects for anything liked/playlisted that *isn't* a scanned device file (currently: YouTube tracks) — needed to resolve them again after an app restart, since they don't live anywhere else. */
interface SavedTracksData {
  tracks: Record<string, Track>;
}

const MAX_RECENTS = 30;
const MAX_SEARCHES = 8;
const MAX_MOST_PLAYED = 25;
const SMART_RECENT_ID = "smart:recent";
const SMART_MOST_PLAYED_ID = "smart:most-played";

// Keys used by the previous version — read once for migration.
const LEGACY_LIKED_KEY = "nukeop:liked-track-ids";
const LEGACY_DEVICE_KEY = "nukeop:local-device-tracks";

export const libraryStore = createStore<LibraryData>("nukeop:library-v2", {
  likedIds: [],
  playlists: [],
  recents: [],
  playCounts: {},
  searches: [],
  seeded: false,
});

export const deviceStore = createStore<DeviceData>("nukeop:device-library-v2", { tracks: [], scannedAt: null });

export const savedTracksStore = createStore<SavedTracksData>("nukeop:saved-tracks-v1", { tracks: {} });

function uid(): string {
  return `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

async function seedAndMigrate() {
  await Promise.all([libraryStore.ready, deviceStore.ready, savedTracksStore.ready]);

  if (!libraryStore.get().seeded) {
    let liked: string[] = [];
    try {
      const raw = await AsyncStorage.getItem(LEGACY_LIKED_KEY);
      if (raw) {
        const ids = JSON.parse(raw);
        if (Array.isArray(ids)) liked = ids.filter((x): x is string => typeof x === "string");
      }
    } catch {
      // ignore
    }
    libraryStore.set({ seeded: true, likedIds: liked, playlists: [] });
    logger.info("Library initialised");
  }

  if (deviceStore.get().tracks.length === 0) {
    try {
      const raw = await AsyncStorage.getItem(LEGACY_DEVICE_KEY);
      if (raw) {
        const tracks = JSON.parse(raw);
        if (Array.isArray(tracks) && tracks.length > 0) {
          deviceStore.set({ tracks: tracks as Track[], scannedAt: Date.now() });
          logger.info(`Migrated ${tracks.length} scanned tracks`);
        }
      }
    } catch {
      // ignore
    }
  }
}
seedAndMigrate();

// ── Track resolution ───────────────────────────────────────────────────────

let cachedDevice: Track[] | null = null;
let cachedSaved: Record<string, Track> | null = null;
let cachedMap: Map<string, Track> = new Map();

function trackMapFor(device: Track[], saved: Record<string, Track>): Map<string, Track> {
  if (cachedDevice === device && cachedSaved === saved) return cachedMap;
  const map = new Map<string, Track>();
  for (const t of device) map.set(t.id, t);
  for (const t of Object.values(saved)) if (!map.has(t.id)) map.set(t.id, t);
  cachedDevice = device;
  cachedSaved = saved;
  cachedMap = map;
  return map;
}

export function getTrackById(id: string): Track | undefined {
  return trackMapFor(deviceStore.get().tracks, savedTracksStore.get().tracks).get(id);
}

function resolve(ids: string[], map: Map<string, Track>): Track[] {
  const out: Track[] = [];
  for (const id of ids) {
    const t = map.get(id);
    if (t) out.push(t);
  }
  return out;
}

/** Persists a track's metadata if it isn't already resolvable by id (i.e. it's not a scanned device file) — so liking/playlisting a YouTube result still resolves after an app restart. Playback re-fetches a fresh stream URL separately; this is only for metadata + a fallback URL. */
function saveTrackIfNeeded(track: Track) {
  if (deviceStore.get().tracks.some((t) => t.id === track.id)) return;
  const saved = savedTracksStore.get().tracks;
  if (saved[track.id]) return;
  savedTracksStore.set({ tracks: { ...saved, [track.id]: track } });
}

// ── Catalogue helpers — everything below is derived live from whatever
// tracks actually exist (scanned device files + anything saved from
// YouTube), never from a fixed list. ─────────────────────────────────────

const LOCAL_ARTIST_ID = "local-device";
const LOCAL_ALBUM_ID = "local-device";

function artistKey(t: Track): string {
  // Local files all share one generic artistId (filename parsing can't produce
  // a stable id), so group those by the parsed artist name instead.
  return t.artistId && t.artistId !== LOCAL_ARTIST_ID ? t.artistId : `name:${t.artist.trim().toLowerCase() || "unknown"}`;
}

/** Builds the Artists list from whatever tracks are actually in the library right now. */
export function deriveArtists(tracks: Track[]): Artist[] {
  const byKey = new Map<string, { name: string; image: string; albumIds: Set<string> }>();
  for (const t of tracks) {
    const key = artistKey(t);
    let entry = byKey.get(key);
    if (!entry) {
      entry = { name: t.artist || "Unknown artist", image: "", albumIds: new Set() };
      byKey.set(key, entry);
    }
    if (!entry.image && t.image) entry.image = t.image;
    entry.albumIds.add(t.albumId || key);
  }
  return Array.from(byKey.entries())
    .map(([id, entry]) => ({ id, name: entry.name, albumCount: entry.albumIds.size, image: entry.image }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Builds the Albums list from whatever tracks are actually in the library right now. */
export function deriveAlbums(tracks: Track[]): Album[] {
  const byId = new Map<string, { title: string; artist: string; artistId: string; image: string }>();
  for (const t of tracks) {
    const id = t.albumId || LOCAL_ALBUM_ID;
    let entry = byId.get(id);
    if (!entry) {
      entry = { title: t.album || "Unknown album", artist: t.artist, artistId: artistKey(t), image: "" };
      byId.set(id, entry);
    }
    if (!entry.image && t.image) entry.image = t.image;
  }
  return Array.from(byId.entries())
    .map(([id, entry]) => ({ id, ...entry }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function tracksForArtist(artistId: string, tracks: Track[]): Track[] {
  return tracks.filter((t) => artistKey(t) === artistId);
}

export function tracksForAlbum(albumId: string, tracks: Track[]): Track[] {
  return tracks.filter((t) => (t.albumId || LOCAL_ALBUM_ID) === albumId);
}

export function albumsForArtist(artistId: string, tracks: Track[]): Album[] {
  return deriveAlbums(tracksForArtist(artistId, tracks));
}

// ── Smart (auto-generated) playlists ────────────────────────────────────
// Real, computed from real listening history — never a fixed/curated list.

function smartPlaylistsFrom(data: LibraryData, map: Map<string, Track>): Playlist[] {
  const out: Playlist[] = [];
  if (data.recents.length > 0) {
    const tracks = resolve(data.recents, map);
    out.push({ id: SMART_RECENT_ID, name: "Recently played", image: tracks[0]?.image ?? "", trackIds: tracks.map((t) => t.id) });
  }
  const counted = Object.entries(data.playCounts)
    .filter(([id]) => map.has(id))
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_MOST_PLAYED)
    .map(([id]) => id);
  if (counted.length > 0) {
    const tracks = resolve(counted, map);
    out.push({ id: SMART_MOST_PLAYED_ID, name: "Most played", image: tracks[0]?.image ?? "", trackIds: tracks.map((t) => t.id) });
  }
  return out;
}

// ── Actions ────────────────────────────────────────────────────────────────

export const library = {
  toggleLike(track: Track): boolean {
    saveTrackIfNeeded(track);
    const liked = libraryStore.get().likedIds;
    const isLiked = liked.includes(track.id);
    libraryStore.set({ likedIds: isLiked ? liked.filter((id) => id !== track.id) : [track.id, ...liked] });
    return !isLiked;
  },

  createPlaylist(name: string, tracks: Track[] = []): UserPlaylist {
    tracks.forEach(saveTrackIfNeeded);
    const now = Date.now();
    const playlist: UserPlaylist = {
      id: uid(),
      name: name.trim() || "New playlist",
      trackIds: Array.from(new Set(tracks.map((t) => t.id))),
      createdAt: now,
      updatedAt: now,
    };
    libraryStore.set((s) => ({ playlists: [playlist, ...s.playlists] }));
    logger.info(`Playlist created: ${playlist.name}`);
    return playlist;
  },

  renamePlaylist(id: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    libraryStore.set((s) => ({
      playlists: s.playlists.map((p) => (p.id === id ? { ...p, name: trimmed, updatedAt: Date.now() } : p)),
    }));
  },

  deletePlaylist(id: string) {
    libraryStore.set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) }));
    logger.info(`Playlist deleted: ${id}`);
  },

  /** Returns how many tracks were actually added (duplicates are skipped). */
  addToPlaylist(id: string, tracks: Track[]): number {
    const playlist = libraryStore.get().playlists.find((p) => p.id === id);
    if (!playlist) return 0;
    const existing = new Set(playlist.trackIds);
    const fresh = Array.from(new Set(tracks.map((t) => t.id))).filter((tid) => !existing.has(tid));
    if (fresh.length === 0) return 0;
    tracks.forEach(saveTrackIfNeeded);
    libraryStore.set((s) => ({
      playlists: s.playlists.map((p) =>
        p.id === id ? { ...p, trackIds: [...p.trackIds, ...fresh], updatedAt: Date.now() } : p
      ),
    }));
    return fresh.length;
  },

  removeFromPlaylist(id: string, trackId: string) {
    libraryStore.set((s) => ({
      playlists: s.playlists.map((p) =>
        p.id === id ? { ...p, trackIds: p.trackIds.filter((t) => t !== trackId), updatedAt: Date.now() } : p
      ),
    }));
  },

  recordPlay(track: Track) {
    saveTrackIfNeeded(track);
    libraryStore.set((s) => ({
      recents: [track.id, ...s.recents.filter((id) => id !== track.id)].slice(0, MAX_RECENTS),
      playCounts: { ...s.playCounts, [track.id]: (s.playCounts[track.id] ?? 0) + 1 },
    }));
  },

  clearRecents() {
    libraryStore.set({ recents: [] });
  },

  clearLiked() {
    libraryStore.set({ likedIds: [] });
  },

  addSearch(query: string) {
    const q = query.trim();
    if (q.length < 2) return;
    libraryStore.set((s) => ({
      searches: [q, ...s.searches.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, MAX_SEARCHES),
    }));
  },

  removeSearch(query: string) {
    libraryStore.set((s) => ({ searches: s.searches.filter((x) => x !== query) }));
  },

  clearSearches() {
    libraryStore.set({ searches: [] });
  },

  /** Wipes all user data: likes, playlists, history, play counts, saved YouTube tracks and scanned files. Nothing is re-seeded — the library is simply empty again. */
  resetAll() {
    libraryStore.reset();
    deviceStore.reset();
    savedTracksStore.reset();
    logger.warn("Library reset — all data cleared");
  },
};

// ── Hooks ──────────────────────────────────────────────────────────────────

export function useLibrary() {
  const data = libraryStore.use();
  const device = deviceStore.use();
  const saved = savedTracksStore.use();

  const map = useMemo(() => trackMapFor(device.tracks, saved.tracks), [device.tracks, saved.tracks]);
  const getTrack = useCallback((id: string) => map.get(id), [map]);

  const likedTracks = useMemo(() => resolve(data.likedIds, map), [data.likedIds, map]);
  const likedSet = useMemo(() => new Set(data.likedIds), [data.likedIds]);
  const isLiked = useCallback((id: string) => likedSet.has(id), [likedSet]);
  const recentTracks = useMemo(() => resolve(data.recents, map), [data.recents, map]);

  const allTracks = useMemo(() => {
    const extra = Object.values(saved.tracks).filter((t) => !device.tracks.some((d) => d.id === t.id));
    return [...device.tracks, ...extra];
  }, [device.tracks, saved.tracks]);

  const smartPlaylists = useMemo(() => smartPlaylistsFrom(data, map), [data, map]);

  return {
    likedIds: data.likedIds,
    likedTracks,
    isLiked,
    playlists: data.playlists,
    smartPlaylists,
    recentTracks,
    searches: data.searches,
    deviceTracks: device.tracks,
    scannedAt: device.scannedAt,
    allTracks,
    getTrack,
    hydrated: data.seeded,
  };
}

export interface ResolvedPlaylist {
  id: string;
  name: string;
  kind: "liked" | "user" | "smart";
  tracks: Track[];
  /** Remote cover for smart playlists; user playlists build a mosaic from their tracks. */
  image?: string;
}

/** Turns a route id into a playlist with its tracks, whichever kind it is. */
export function useResolvedPlaylist(id: string): ResolvedPlaylist | null {
  const lib = useLibrary();
  return useMemo(() => {
    if (id === LIKED_PLAYLIST_ID) {
      return { id, name: "Liked Songs", kind: "liked", tracks: lib.likedTracks };
    }
    const user = lib.playlists.find((p) => p.id === id);
    if (user) {
      const map = trackMapFor(deviceStore.get().tracks, savedTracksStore.get().tracks);
      return { id, name: user.name, kind: "user", tracks: resolve(user.trackIds, map) };
    }
    const smart: Playlist | undefined = lib.smartPlaylists.find((p) => p.id === id);
    if (smart) {
      const map = trackMapFor(deviceStore.get().tracks, savedTracksStore.get().tracks);
      return { id, name: smart.name, kind: "smart", image: smart.image, tracks: resolve(smart.trackIds, map) };
    }
    return null;
  }, [id, lib.likedTracks, lib.playlists, lib.smartPlaylists]);
}
