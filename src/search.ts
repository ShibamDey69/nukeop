import { ARTISTS, ALBUMS, PLAYLISTS, TRACKS, ONLINE_RESULTS, SearchResult, LocalTrack } from "./data";

export type SearchScope = "local" | "global";

function localCatalog(localTracks: LocalTrack[]): SearchResult[] {
  const playlists: SearchResult[] = PLAYLISTS.map((p) => ({
    id: `playlist-${p.id}`,
    entityId: p.id,
    kind: "playlist",
    title: p.name,
    subtitle: `${p.trackIds.length} tracks`,
    image: p.image,
    source: "local",
  }));

  const deviceTracks: SearchResult[] = localTracks.map((t) => ({
    id: `local-${t.id}`,
    entityId: t.id.startsWith("local-") ? t.id : `local-${t.id}`,
    kind: "track",
    title: t.title,
    subtitle: `${t.artist} · On this device`,
    image: "",
    source: "local",
    track: {
      id: t.id.startsWith("local-") ? t.id : `local-${t.id}`,
      title: t.title,
      artist: t.artist,
      artistId: "local-artist",
      albumId: "local-album",
      album: "On this device",
      duration: t.duration,
      image: "",
      audioUrl: t.uri,
      isLocal: true,
    },
  }));

  const libraryTracks: SearchResult[] = TRACKS.map((t) => ({
    id: `track-${t.id}`,
    entityId: t.id,
    kind: "track",
    title: t.title,
    subtitle: `${t.artist} · ${t.album}`,
    image: t.image,
    source: "local",
    track: t,
  }));

  const artists: SearchResult[] = ARTISTS.map((a) => ({
    id: `artist-${a.id}`,
    entityId: a.id,
    kind: "artist",
    title: a.name,
    subtitle: `${a.albumCount} albums`,
    image: a.image,
    source: "local",
  }));

  const albums: SearchResult[] = ALBUMS.map((al) => ({
    id: `album-${al.id}`,
    entityId: al.id,
    kind: "album",
    title: al.title,
    subtitle: `${al.artist} · ${al.year}`,
    image: al.image,
    source: "local",
  }));

  return [...deviceTracks, ...libraryTracks, ...artists, ...albums, ...playlists];
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
    }, 400 + Math.random() * 250);
  });
}

export interface GroupedResults {
  tracks: SearchResult[];
  artists: SearchResult[];
  albums: SearchResult[];
  playlists: SearchResult[];
}

export function groupSearchResults(results: SearchResult[]): GroupedResults {
  return {
    tracks: results.filter((r) => r.kind === "track"),
    artists: results.filter((r) => r.kind === "artist"),
    albums: results.filter((r) => r.kind === "album"),
    playlists: results.filter((r) => r.kind === "playlist"),
  };
}

