// Derived catalog + recommendation engine.
//
// Nothing here is hardcoded: artists and albums are derived from tracks that
// actually exist (music scanned on the device, imported tracks), and
// recommendations are computed from real play history and likes.

import { useMemo } from "react";
import type { Album, Artist, Track } from "./data";
import { libraryStore, deviceStore } from "./library";
import { useLibrary } from "./library";

export interface Catalog {
  artists: Artist[];
  albums: Album[];
  artistById: Map<string, Artist>;
  albumById: Map<string, Album>;
}

/** Derive the artist/album catalog from whatever tracks really exist. */
export function buildCatalog(tracks: Track[]): Catalog {
  const albums = new Map<string, Album>();
  const artistAlbums = new Map<string, Set<string>>();
  const artistName = new Map<string, string>();
  const artistImage = new Map<string, string>();

  for (const t of tracks) {
    if (!albums.has(t.albumId)) {
      albums.set(t.albumId, {
        id: t.albumId,
        title: t.album,
        artist: t.artist,
        artistId: t.artistId,
        year: 0,
        genre: "Pop",
        image: t.image,
      });
    }
    if (!artistAlbums.has(t.artistId)) artistAlbums.set(t.artistId, new Set());
    artistAlbums.get(t.artistId)!.add(t.albumId);
    if (!artistName.has(t.artistId)) artistName.set(t.artistId, t.artist);
    if (!artistImage.has(t.artistId) && t.image) artistImage.set(t.artistId, t.image);
  }

  const artists: Artist[] = [...artistAlbums.entries()].map(([id, albumSet]) => ({
    id,
    name: artistName.get(id) ?? "Unknown artist",
    albumCount: albumSet.size,
    image: artistImage.get(id) ?? "",
  }));

  return {
    artists,
    albums: [...albums.values()],
    artistById: new Map(artists.map((a) => [a.id, a])),
    albumById: albums,
  };
}

export function useCatalog(): Catalog {
  const { allTracks } = useLibrary();
  return useMemo(() => buildCatalog(allTracks), [allTracks]);
}

/**
 * Recommendations for an empty queue / radio mode: recent plays first, then
 * liked tracks, then everything else in the library. Returns [] when the
 * library is empty so callers can show a proper empty state.
 */
export function getRecommendations(opts: { exclude?: Set<string>; limit?: number } = {}): Track[] {
  const exclude = opts.exclude ?? new Set<string>();
  const limit = opts.limit ?? 15;
  const { recents, likedIds } = libraryStore.get();
  const all = deviceStore.get().tracks;
  if (all.length === 0) return [];

  const likedSet = new Set(likedIds);
  const recentRank = new Map<string, number>(recents.map((id, i) => [id, recents.length - i]));
  const score = (t: Track) => (recentRank.get(t.id) ?? 0) * 2 + (likedSet.has(t.id) ? 10 : 0) + (t.image ? 1 : 0);

  return all
    .filter((t) => !exclude.has(t.id))
    .map((t) => ({ t, s: score(t) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.t);
}
