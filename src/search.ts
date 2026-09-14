import { ARTISTS, ALBUMS, PLAYLISTS, ONLINE_RESULTS, SearchResult, LocalTrack } from "./data";

export type SearchScope = "local" | "global";

function localCatalog(localTracks: LocalTrack[]): SearchResult[] {
  const artists: SearchResult[] = ARTISTS.map((a) => ({
    id: `artist-${a.id}`,
    kind: "artist",
    title: a.name,
    subtitle: `${a.albumCount} albums`,
    image: a.image,
  }));
  const albums: SearchResult[] = ALBUMS.map((a) => ({
    id: `album-${a.id}`,
    kind: "album",
    title: a.title,
    subtitle: `${a.artist} · ${a.year}`,
    image: a.image,
  }));
  const playlists: SearchResult[] = PLAYLISTS.map((p) => ({
    id: `playlist-${p.id}`,
    kind: "playlist",
    title: p.name,
    subtitle: `${p.trackCount} tracks`,
    image: p.image,
  }));
  const tracks: SearchResult[] = localTracks.map((t) => ({
    id: `local-${t.id}`,
    kind: "track",
    title: t.title,
    subtitle: `${t.artist} · On this device`,
    image: "",
  }));
  return [...tracks, ...artists, ...albums, ...playlists];
}

export function searchLocal(query: string, localTracks: LocalTrack[]): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return localCatalog(localTracks).filter(
    (r) => r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q)
  );
}

// Simulated network round-trip so switching to Global visibly feels like a
// real remote lookup rather than an instant local filter.
export function searchGlobal(query: string): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase();
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!q) {
        resolve([]);
        return;
      }
      resolve(
        ONLINE_RESULTS.filter(
          (r) => r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q)
        )
      );
    }, 550 + Math.random() * 350);
  });
}
