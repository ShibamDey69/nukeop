export interface Artist {
  id: string;
  name: string;
  albumCount: number;
  image: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre: "Rock" | "Pop" | "Hip-Hop" | "Indie" | "R&B" | "Electronic";
  image: string;
}

export interface Playlist {
  id: string;
  name: string;
  trackCount: number;
  image: string;
  visibility: "my" | "public" | "liked";
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  category: "Themes" | "Lyrics" | "Visualizers" | "Tools";
  iconBg: string;
  iconLabel: string;
  installed: boolean;
  enabled: boolean;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  summary: string;
}

export interface LogEntry {
  time: string;
  level: "INFO" | "DEBUG" | "WARN" | "ERROR";
  message: string;
}

// A single, generic result shape shared by local and "global" (fake online)
// search so both lists render with the exact same row style.
export interface SearchResult {
  id: string;
  kind: "artist" | "album" | "playlist" | "track";
  title: string;
  subtitle: string;
  image: string;
}

// Local track scanned off the device (or its placeholder before a scan has
// run). Metadata is best-effort: whatever the file system/media library
// gives us, with sane fallbacks otherwise.
export interface LocalTrack {
  id: string;
  uri: string;
  filename: string;
  title: string;
  artist: string;
  duration: number; // seconds, 0 if unknown
  hasArtwork: boolean;
}

export const ARTISTS: Artist[] = [
  {
    id: "1",
    name: "Radiohead",
    albumCount: 9,
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "2",
    name: "Daft Punk",
    albumCount: 4,
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "3",
    name: "Lana Del Rey",
    albumCount: 9,
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "4",
    name: "Kendrick Lamar",
    albumCount: 15,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "5",
    name: "Tyler, The Creator",
    albumCount: 8,
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c294458a?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "6",
    name: "Mitski",
    albumCount: 32,
    image:
      "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "7",
    name: "NewJeans",
    albumCount: 6,
    image:
      "https://images.unsplash.com/photo-1517230878791-4d28214057c2?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "8",
    name: "Frank Ocean",
    albumCount: 6,
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "9",
    name: "Arctic Monkeys",
    albumCount: 9,
    image:
      "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200&h=200&fit=crop&auto=format",
  },
];

export const ALBUMS: Album[] = [
  {
    id: "1",
    title: "OK Computer",
    artist: "Radiohead",
    year: 1997,
    genre: "Rock",
    image:
      "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5b?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "2",
    title: "Blonde",
    artist: "Frank Ocean",
    year: 2016,
    genre: "R&B",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "3",
    title: "IGOR",
    artist: "Tyler, The Creator",
    year: 2019,
    genre: "Hip-Hop",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "4",
    title: "Melodrama",
    artist: "Lorde",
    year: 2017,
    genre: "Pop",
    image:
      "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "5",
    title: "The Slow Rush",
    artist: "Tame Impala",
    year: 2020,
    genre: "Indie",
    image:
      "https://images.unsplash.com/photo-1513002749449-8562db9ae67a?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "6",
    title: "Rumours",
    artist: "Fleetwood Mac",
    year: 1977,
    genre: "Rock",
    image:
      "https://images.unsplash.com/photo-1466477234737-8a3b3faed8c3?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "7",
    title: "AM",
    artist: "Arctic Monkeys",
    year: 2013,
    genre: "Rock",
    image:
      "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "8",
    title: "Currents",
    artist: "Tame Impala",
    year: 2015,
    genre: "Indie",
    image:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "9",
    title: "Reputation",
    artist: "Taylor Swift",
    year: 2017,
    genre: "Pop",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop&auto=format",
  },
];

export const PLAYLISTS: Playlist[] = [
  {
    id: "1",
    name: "Liked Songs",
    trackCount: 243,
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&h=120&fit=crop&auto=format",
    visibility: "liked",
  },
  {
    id: "2",
    name: "Chill Vibes",
    trackCount: 128,
    image:
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=120&h=120&fit=crop&auto=format",
    visibility: "my",
  },
  {
    id: "3",
    name: "Coding",
    trackCount: 87,
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=120&h=120&fit=crop&auto=format",
    visibility: "my",
  },
  {
    id: "4",
    name: "Workout",
    trackCount: 64,
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=120&h=120&fit=crop&auto=format",
    visibility: "my",
  },
  {
    id: "5",
    name: "Rainy Days",
    trackCount: 52,
    image:
      "https://images.unsplash.com/photo-1541761776-b59bf9f258e7?w=120&h=120&fit=crop&auto=format",
    visibility: "public",
  },
  {
    id: "6",
    name: "Anime OST",
    trackCount: 186,
    image:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=120&h=120&fit=crop&auto=format",
    visibility: "public",
  },
  {
    id: "7",
    name: "Sunday Morning",
    trackCount: 41,
    image:
      "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=120&h=120&fit=crop&auto=format",
    visibility: "my",
  },
  {
    id: "8",
    name: "Late Night Drive",
    trackCount: 33,
    image:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=120&h=120&fit=crop&auto=format",
    visibility: "public",
  },
];

export const PLUGINS: Plugin[] = [
  {
    id: "1",
    name: "Last.fm Scrobbler",
    version: "v1.2.0",
    description: "Scrobble your plays to Last.fm automatically",
    category: "Tools",
    iconBg: "#D51007",
    iconLabel: "as",
    installed: true,
    enabled: true,
  },
  {
    id: "2",
    name: "Lyrics Fetcher",
    version: "v2.1.0",
    description: "Fetch lyrics from multiple sources",
    category: "Lyrics",
    iconBg: "#4A90D9",
    iconLabel: "lf",
    installed: true,
    enabled: true,
  },
  {
    id: "3",
    name: "Discord Rich Presence",
    version: "v1.0.3",
    description: "Show what you're playing on Discord",
    category: "Tools",
    iconBg: "#5865F2",
    iconLabel: "dp",
    installed: true,
    enabled: false,
  },
  {
    id: "4",
    name: "YouTube Source",
    version: "v1.5.1",
    description: "Stream music directly from YouTube",
    category: "Tools",
    iconBg: "#FF0000",
    iconLabel: "yt",
    installed: false,
    enabled: false,
  },
  {
    id: "5",
    name: "Visualizer",
    version: "v1.3.0",
    description: "Real-time audio visualizer overlay",
    category: "Visualizers",
    iconBg: "#111111",
    iconLabel: "vz",
    installed: true,
    enabled: true,
  },
  {
    id: "6",
    name: "Themes Extra",
    version: "v1.0.2",
    description: "Extended theme pack with 20+ themes",
    category: "Themes",
    iconBg: "#FF5C93",
    iconLabel: "tx",
    installed: false,
    enabled: false,
  },
];

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "v0.9.0",
    date: "Aug 20, 2024",
    summary: "New mobile UI, plugin system and more improvements.",
  },
  {
    version: "v0.8.5",
    date: "Jul 12, 2024",
    summary: "Added YouTube source and lyrics support.",
  },
  {
    version: "v0.8.0",
    date: "Jun 1, 2024",
    summary: "Major performance improvements and library rebuild.",
  },
  {
    version: "v0.7.2",
    date: "Apr 18, 2024",
    summary: "Bug fixes and stability improvements.",
  },
  {
    version: "v0.7.0",
    date: "Mar 5, 2024",
    summary: "Plugin API v2, custom themes support.",
  },
  {
    version: "v0.6.5",
    date: "Jan 30, 2024",
    summary: "Last.fm scrobbler plugin released.",
  },
];

export const LOGS: LogEntry[] = [
  { time: "20:41:23", level: "INFO", message: "Application started" },
  { time: "20:41:24", level: "INFO", message: "Loaded 5 plugins" },
  { time: "20:41:25", level: "DEBUG", message: "Scanning music library..." },
  { time: "20:41:26", level: "INFO", message: "Found 1243 tracks" },
  { time: "20:41:28", level: "WARN", message: "YouTube plugin is disabled" },
  { time: "20:41:32", level: "INFO", message: "Last.fm scrobbler connected" },
  { time: "20:41:35", level: "DEBUG", message: "Checking for updates..." },
  { time: "20:41:37", level: "INFO", message: "Application ready" },
  {
    time: "20:41:42",
    level: "ERROR",
    message: "Failed to connect to Discord RPC",
  },
  { time: "20:41:45", level: "DEBUG", message: "Discord retry in 30s" },
  {
    time: "20:41:50",
    level: "INFO",
    message: "Playing: Sunflower — Post Malone",
  },
  { time: "20:41:51", level: "INFO", message: "Scrobbling to Last.fm" },
  {
    time: "20:41:55",
    level: "DEBUG",
    message: "Buffer preload complete (3.2MB)",
  },
  {
    time: "20:42:01",
    level: "WARN",
    message: "Low memory warning: 256MB remaining",
  },
];

// ─── Fake "online" catalog for Global search ──────────────────────────────
// This stands in for a real streaming/search API. It's intentionally
// disjoint from the local library above so switching Local ⇄ Global visibly
// changes the result set, and lookups are wrapped in a small artificial
// delay (see search.ts) so the UI reads as a real network round-trip.
export const ONLINE_RESULTS: SearchResult[] = [
  {
    id: "on-1",
    kind: "track",
    title: "Nights",
    subtitle: "Frank Ocean · Blonde",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "on-2",
    kind: "artist",
    title: "Billie Eilish",
    subtitle: "Artist · 42.1M listeners",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "on-3",
    kind: "album",
    title: "Discovery",
    subtitle: "Daft Punk · 2001",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "on-4",
    kind: "playlist",
    title: "Global Top 50",
    subtitle: "Editorial playlist · 50 tracks",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "on-5",
    kind: "track",
    title: "Redbone",
    subtitle: "Childish Gambino · Awaken, My Love!",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "on-6",
    kind: "artist",
    title: "Men I Trust",
    subtitle: "Artist · 3.4M listeners",
    image:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "on-7",
    kind: "album",
    title: "In Rainbows",
    subtitle: "Radiohead · 2007",
    image:
      "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5b?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "on-8",
    kind: "track",
    title: "Silk Chiffon",
    subtitle: "MUNA feat. Phoebe Bridgers",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop&auto=format",
  },
];

export const NOW_PLAYING = {
  title: "Sunflower",
  artist: "Post Malone",
  album: "Spider-Man: Into the Spider-Verse",
  duration: 182,
  currentTime: 84,
  image:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&auto=format",
};
