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
  artistId: string;
  year: number;
  genre: "Rock" | "Pop" | "Hip-Hop" | "Indie" | "R&B" | "Electronic";
  image: string;
}

export interface Playlist {
  id: string;
  name: string;
  image: string;
  visibility: "my" | "public" | "liked";
  trackIds: string[];
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  albumId: string;
  album: string;
  duration: number;
  image: string;
  audioUrl: string;
  isLocal?: boolean;
}

export interface LocalTrack {
  id: string;
  filename: string;
  title: string;
  artist: string;
  duration: number;
  uri: string;
  hasArtwork?: boolean;
}

export interface SearchResult {
  id: string;
  entityId?: string;
  kind: "track" | "artist" | "album" | "playlist";
  title: string;
  subtitle: string;
  image: string;
  source: "local" | "global";
  track?: Track;
}

export function localTrackToTrack(local: LocalTrack): Track {
  return {
    id: local.id.startsWith("local-") ? local.id : `local-${local.id}`,
    title: local.title,
    artist: local.artist,
    artistId: "local-artist",
    albumId: "local-album",
    album: "Device Storage",
    duration: local.duration,
    image: "",
    audioUrl: local.uri,
    isLocal: true,
  };
}

export function demoStreamUrl(n: number | string): string {
  const num =
    typeof n === "number"
      ? ((Math.abs(n) - 1) % 16) + 1
      : (Math.abs(n.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 16) + 1;
  return `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${num}.mp3`;
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
  settingsSummary: string;
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

export const ARTISTS: Artist[] = [
  { id: "1", name: "Radiohead", albumCount: 9, image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&auto=format" },
  { id: "2", name: "Daft Punk", albumCount: 4, image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=200&fit=crop&auto=format" },
  { id: "3", name: "Lana Del Rey", albumCount: 9, image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&auto=format" },
  { id: "4", name: "Kendrick Lamar", albumCount: 15, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format" },
  { id: "5", name: "Tyler, The Creator", albumCount: 8, image: "https://images.unsplash.com/photo-1501386761578-eac5c294458a?w=200&h=200&fit=crop&auto=format" },
  { id: "6", name: "Mitski", albumCount: 32, image: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=200&h=200&fit=crop&auto=format" },
  { id: "7", name: "NewJeans", albumCount: 6, image: "https://images.unsplash.com/photo-1517230878791-4d28214057c2?w=200&h=200&fit=crop&auto=format" },
  { id: "8", name: "Frank Ocean", albumCount: 6, image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop&auto=format" },
  { id: "9", name: "Arctic Monkeys", albumCount: 9, image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200&h=200&fit=crop&auto=format" },
  { id: "10", name: "Lorde", albumCount: 3, image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&auto=format" },
  { id: "11", name: "Tame Impala", albumCount: 5, image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop&auto=format" },
  { id: "12", name: "Fleetwood Mac", albumCount: 18, image: "https://images.unsplash.com/photo-1454922915609-78549ad709bb?w=200&h=200&fit=crop&auto=format" },
];

export const ALBUMS: Album[] = [
  { id: "1", title: "OK Computer", artist: "Radiohead", artistId: "1", year: 1997, genre: "Rock", image: "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5b?w=200&h=200&fit=crop&auto=format" },
  { id: "2", title: "Blonde", artist: "Frank Ocean", artistId: "8", year: 2016, genre: "R&B", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop&auto=format" },
  { id: "3", title: "IGOR", artist: "Tyler, The Creator", artistId: "5", year: 2019, genre: "Hip-Hop", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=200&fit=crop&auto=format" },
  { id: "4", title: "Melodrama", artist: "Lorde", artistId: "10", year: 2017, genre: "Pop", image: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=200&h=200&fit=crop&auto=format" },
  { id: "5", title: "The Slow Rush", artist: "Tame Impala", artistId: "11", year: 2020, genre: "Indie", image: "https://images.unsplash.com/photo-1513002749449-8562db9ae67a?w=200&h=200&fit=crop&auto=format" },
  { id: "6", title: "Rumours", artist: "Fleetwood Mac", artistId: "12", year: 1977, genre: "Rock", image: "https://images.unsplash.com/photo-1466477234737-8a3b3faed8c3?w=200&h=200&fit=crop&auto=format" },
  { id: "7", title: "AM", artist: "Arctic Monkeys", artistId: "9", year: 2013, genre: "Rock", image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=200&h=200&fit=crop&auto=format" },
  { id: "8", title: "Currents", artist: "Tame Impala", artistId: "11", year: 2015, genre: "Indie", image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200&h=200&fit=crop&auto=format" },
];

const soundhelix = (n: number) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

export const TRACKS: Track[] = [
  { id: "t1", title: "Airbag", artist: "Radiohead", artistId: "1", albumId: "1", album: "OK Computer", duration: 284, image: "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5b?w=200&h=200&fit=crop&auto=format", audioUrl: soundhelix(1) },
  { id: "t2", title: "Paranoid Android", artist: "Radiohead", artistId: "1", albumId: "1", album: "OK Computer", duration: 386, image: "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5b?w=200&h=200&fit=crop&auto=format", audioUrl: soundhelix(2) },
  { id: "t3", title: "Subterranean Homesick Alien", artist: "Radiohead", artistId: "1", albumId: "1", album: "OK Computer", duration: 267, image: "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5b?w=200&h=200&fit=crop&auto=format", audioUrl: soundhelix(3) },
  { id: "t4", title: "Nikes", artist: "Frank Ocean", artistId: "8", albumId: "2", album: "Blonde", duration: 313, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop&auto=format", audioUrl: soundhelix(4) },
  { id: "t5", title: "Ivy", artist: "Frank Ocean", artistId: "8", albumId: "2", album: "Blonde", duration: 249, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop&auto=format", audioUrl: soundhelix(5) },
  { id: "t6", title: "Self Control", artist: "Frank Ocean", artistId: "8", albumId: "2", album: "Blonde", duration: 249, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop&auto=format", audioUrl: soundhelix(6) },
  { id: "t7", title: "EARFQUAKE", artist: "Tyler, The Creator", artistId: "5", albumId: "3", album: "IGOR", duration: 191, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=200&fit=crop&auto=format", audioUrl: soundhelix(7) },
  { id: "t8", title: "NEW MAGIC WAND", artist: "Tyler, The Creator", artistId: "5", albumId: "3", album: "IGOR", duration: 226, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=200&fit=crop&auto=format", audioUrl: soundhelix(8) },
  { id: "t9", title: "Green Light", artist: "Lorde", artistId: "10", albumId: "4", album: "Melodrama", duration: 234, image: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=200&h=200&fit=crop&auto=format", audioUrl: soundhelix(9) },
  { id: "t10", title: "Liability", artist: "Lorde", artistId: "10", albumId: "4", album: "Melodrama", duration: 189, image: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=200&h=200&fit=crop&auto=format", audioUrl: soundhelix(10) },
  { id: "t11", title: "One More Year", artist: "Tame Impala", artistId: "11", albumId: "5", album: "The Slow Rush", duration: 262, image: "https://images.unsplash.com/photo-1513002749449-8562db9ae67a?w=200&h=200&fit=crop&auto=format", audioUrl: soundhelix(11) },
  { id: "t12", title: "Borderline", artist: "Tame Impala", artistId: "11", albumId: "5", album: "The Slow Rush", duration: 271, image: "https://images.unsplash.com/photo-1513002749449-8562db9ae67a?w=200&h=200&fit=crop&auto=format", audioUrl: soundhelix(12) },
  { id: "t13", title: "Dreams", artist: "Fleetwood Mac", artistId: "12", albumId: "6", album: "Rumours", duration: 257, image: "https://images.unsplash.com/photo-1466477234737-8a3b3faed8c3?w=200&h=200&fit=crop&auto=format", audioUrl: soundhelix(13) },
  { id: "t14", title: "Go Your Own Way", artist: "Fleetwood Mac", artistId: "12", albumId: "6", album: "Rumours", duration: 219, image: "https://images.unsplash.com/photo-1466477234737-8a3b3faed8c3?w=200&h=200&fit=crop&auto=format", audioUrl: soundhelix(14) },
  { id: "t15", title: "Do I Wanna Know?", artist: "Arctic Monkeys", artistId: "9", albumId: "7", album: "AM", duration: 272, image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=200&h=200&fit=crop&auto=format", audioUrl: soundhelix(15) },
  { id: "t16", title: "The Less I Know the Better", artist: "Tame Impala", artistId: "11", albumId: "8", album: "Currents", duration: 216, image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200&h=200&fit=crop&auto=format", audioUrl: soundhelix(16) },
];

export const PLAYLISTS: Playlist[] = [
  { id: "1", name: "Liked Songs", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&h=120&fit=crop&auto=format", visibility: "liked", trackIds: ["t2", "t4", "t7", "t9", "t13", "t16"] },
  { id: "2", name: "Chill Vibes", image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=120&h=120&fit=crop&auto=format", visibility: "my", trackIds: ["t5", "t10", "t11", "t16", "t3"] },
  { id: "3", name: "Coding", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=120&h=120&fit=crop&auto=format", visibility: "my", trackIds: ["t1", "t3", "t11", "t12"] },
  { id: "4", name: "Workout", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=120&h=120&fit=crop&auto=format", visibility: "my", trackIds: ["t2", "t8", "t14", "t15"] },
  { id: "5", name: "Rainy Days", image: "https://images.unsplash.com/photo-1541761776-b59bf9f258e7?w=120&h=120&fit=crop&auto=format", visibility: "public", trackIds: ["t5", "t9", "t10", "t13"] },
  { id: "6", name: "Anime OST", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=120&h=120&fit=crop&auto=format", visibility: "public", trackIds: ["t7", "t8", "t6"] },
  { id: "7", name: "Sunday Morning", image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=120&h=120&fit=crop&auto=format", visibility: "my", trackIds: ["t4", "t6", "t16"] },
  { id: "8", name: "Late Night Drive", image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=120&h=120&fit=crop&auto=format", visibility: "public", trackIds: ["t14", "t15", "t2", "t12"] },
];

export const PLUGINS: Plugin[] = [
  { id: "1", name: "Last.fm Scrobbler", version: "v1.2.0", description: "Scrobble your plays to Last.fm automatically", category: "Tools", iconBg: "#D51007", iconLabel: "as", installed: true, enabled: true, settingsSummary: "Scrobbles after 50% playback" },
  { id: "2", name: "Lyrics Fetcher", version: "v2.1.0", description: "Fetch lyrics from multiple sources", category: "Lyrics", iconBg: "#4A90D9", iconLabel: "lf", installed: true, enabled: true, settingsSummary: "Source priority: Genius, Musixmatch" },
  { id: "3", name: "Discord Rich Presence", version: "v1.0.3", description: "Show what you're playing on Discord", category: "Tools", iconBg: "#5865F2", iconLabel: "dp", installed: true, enabled: false, settingsSummary: "Shows album art and track name" },
  { id: "4", name: "YouTube Source", version: "v1.5.1", description: "Stream music directly from YouTube", category: "Tools", iconBg: "#FF0000", iconLabel: "yt", installed: false, enabled: false, settingsSummary: "Requires account sign-in" },
  { id: "5", name: "Visualizer", version: "v1.3.0", description: "Real-time audio visualizer overlay", category: "Visualizers", iconBg: "#111111", iconLabel: "vz", installed: true, enabled: true, settingsSummary: "Style: Bars, Sensitivity: 70%" },
  { id: "6", name: "Themes Extra", version: "v1.0.2", description: "Extended theme pack with 20+ themes", category: "Themes", iconBg: "#FF5C93", iconLabel: "tx", installed: false, enabled: false, settingsSummary: "Not installed" },
];

export const CHANGELOG: ChangelogEntry[] = [
  { version: "v0.9.0", date: "Aug 20, 2024", summary: "New mobile UI, plugin system and more improvements." },
  { version: "v0.8.5", date: "Jul 12, 2024", summary: "Added YouTube source and lyrics support." },
  { version: "v0.8.0", date: "Jun 1, 2024", summary: "Major performance improvements and library rebuild." },
  { version: "v0.7.2", date: "Apr 18, 2024", summary: "Bug fixes and stability improvements." },
  { version: "v0.7.0", date: "Mar 5, 2024", summary: "Plugin API v2, custom themes support." },
  { version: "v0.6.5", date: "Jan 30, 2024", summary: "Last.fm scrobbler plugin released." },
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
  { time: "20:41:42", level: "ERROR", message: "Failed to connect to Discord RPC" },
  { time: "20:41:45", level: "DEBUG", message: "Discord retry in 30s" },
  { time: "20:41:50", level: "INFO", message: "Playing: Sunflower — Post Malone" },
  { time: "20:41:51", level: "INFO", message: "Scrobbling to Last.fm" },
  { time: "20:41:55", level: "DEBUG", message: "Buffer preload complete (3.2MB)" },
  { time: "20:42:01", level: "WARN", message: "Low memory warning: 256MB remaining" },
];

export const DEMO_LOCAL_TRACKS: LocalTrack[] = [
  {
    id: "local-1",
    filename: "M83 - Midnight City.mp3",
    title: "Midnight City",
    artist: "M83",
    duration: 243,
    uri: demoStreamUrl(1),
  },
  {
    id: "local-2",
    filename: "HOME - Resonance.flac",
    title: "Resonance",
    artist: "HOME",
    duration: 212,
    uri: demoStreamUrl(2),
  },
  {
    id: "local-3",
    filename: "Tycho - Awake.mp3",
    title: "Awake",
    artist: "Tycho",
    duration: 283,
    uri: demoStreamUrl(3),
  },
  {
    id: "local-4",
    filename: "Kavinsky - Nightcall.wav",
    title: "Nightcall",
    artist: "Kavinsky",
    duration: 259,
    uri: demoStreamUrl(4),
  },
  {
    id: "local-5",
    filename: "MGMT - Electric Feel.mp3",
    title: "Electric Feel",
    artist: "MGMT",
    duration: 229,
    uri: demoStreamUrl(5),
  },
  {
    id: "local-6",
    filename: "The xx - Intro.mp3",
    title: "Intro",
    artist: "The xx",
    duration: 128,
    uri: demoStreamUrl(6),
  },
];

export const ONLINE_TRACKS: Track[] = [
  {
    id: "on-1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    artistId: "global-art-1",
    albumId: "global-alb-1",
    album: "After Hours",
    duration: 200,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop&auto=format",
    audioUrl: demoStreamUrl(7),
  },
  {
    id: "on-2",
    title: "Starboy",
    artist: "The Weeknd ft. Daft Punk",
    artistId: "global-art-1",
    albumId: "global-alb-1",
    album: "Starboy",
    duration: 230,
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=200&fit=crop&auto=format",
    audioUrl: demoStreamUrl(8),
  },
  {
    id: "on-3",
    title: "Levitating",
    artist: "Dua Lipa",
    artistId: "global-art-2",
    albumId: "global-alb-2",
    album: "Future Nostalgia",
    duration: 203,
    image: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=200&h=200&fit=crop&auto=format",
    audioUrl: demoStreamUrl(9),
  },
  {
    id: "on-4",
    title: "As It Was",
    artist: "Harry Styles",
    artistId: "global-art-4",
    albumId: "global-alb-4",
    album: "Harry's House",
    duration: 167,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format",
    audioUrl: demoStreamUrl(10),
  },
  {
    id: "on-5",
    title: "Heat Waves",
    artist: "Glass Animals",
    artistId: "global-art-5",
    albumId: "global-alb-1",
    album: "Dreamland",
    duration: 238,
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop&auto=format",
    audioUrl: demoStreamUrl(11),
  },
  {
    id: "on-6",
    title: "Bad Guy",
    artist: "Billie Eilish",
    artistId: "global-art-3",
    albumId: "global-alb-3",
    album: "When We All Fall Asleep",
    duration: 194,
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&auto=format",
    audioUrl: demoStreamUrl(12),
  },
  {
    id: "on-7",
    title: "Stay",
    artist: "The Kid LAROI & Justin Bieber",
    artistId: "global-art-6",
    albumId: "global-alb-2",
    album: "F*CK LOVE 3",
    duration: 141,
    image: "https://images.unsplash.com/photo-1501386761578-eac5c294458a?w=200&h=200&fit=crop&auto=format",
    audioUrl: demoStreamUrl(13),
  },
  {
    id: "on-8",
    title: "Save Your Tears",
    artist: "The Weeknd",
    artistId: "global-art-1",
    albumId: "global-alb-1",
    album: "After Hours",
    duration: 215,
    image: "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5b?w=200&h=200&fit=crop&auto=format",
    audioUrl: demoStreamUrl(14),
  },
];

export const GLOBAL_ARTISTS: Artist[] = [
  {
    id: "global-art-1",
    name: "The Weeknd",
    albumCount: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "global-art-2",
    name: "Dua Lipa",
    albumCount: 3,
    image: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "global-art-3",
    name: "Billie Eilish",
    albumCount: 3,
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "global-art-4",
    name: "Harry Styles",
    albumCount: 3,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "global-art-5",
    name: "Glass Animals",
    albumCount: 4,
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "global-art-6",
    name: "The Kid LAROI",
    albumCount: 2,
    image: "https://images.unsplash.com/photo-1501386761578-eac5c294458a?w=200&h=200&fit=crop&auto=format",
  },
];

export const GLOBAL_ALBUMS: Album[] = [
  {
    id: "global-alb-1",
    title: "After Hours",
    artist: "The Weeknd",
    artistId: "global-art-1",
    year: 2020,
    genre: "R&B",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "global-alb-2",
    title: "Future Nostalgia",
    artist: "Dua Lipa",
    artistId: "global-art-2",
    year: 2020,
    genre: "Pop",
    image: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "global-alb-3",
    title: "When We All Fall Asleep",
    artist: "Billie Eilish",
    artistId: "global-art-3",
    year: 2019,
    genre: "Pop",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&auto=format",
  },
  {
    id: "global-alb-4",
    title: "Harry's House",
    artist: "Harry Styles",
    artistId: "global-art-4",
    year: 2022,
    genre: "Pop",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format",
  },
];

export const GLOBAL_PLAYLISTS: Playlist[] = [
  {
    id: "global-pl-1",
    name: "Today's Top Hits",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=200&fit=crop&auto=format",
    visibility: "public",
    trackIds: ["on-1", "on-3", "on-4", "on-7", "on-8"],
  },
  {
    id: "global-pl-2",
    name: "Global Viral 50",
    image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&h=200&fit=crop&auto=format",
    visibility: "public",
    trackIds: ["on-2", "on-5", "on-6", "on-1", "on-3"],
  },
];

export const ONLINE_RESULTS: SearchResult[] = [
  ...ONLINE_TRACKS.map((t) => ({
    id: `global-track-${t.id}`,
    entityId: t.id,
    kind: "track" as const,
    title: t.title,
    subtitle: `${t.artist} · ${t.album}`,
    image: t.image,
    source: "global" as const,
    track: t,
  })),
  ...GLOBAL_ARTISTS.map((a) => ({
    id: a.id,
    entityId: a.id,
    kind: "artist" as const,
    title: a.name,
    subtitle: `Global Artist · ${a.albumCount} Albums`,
    image: a.image,
    source: "global" as const,
  })),
  ...GLOBAL_ALBUMS.map((al) => ({
    id: al.id,
    entityId: al.id,
    kind: "album" as const,
    title: al.title,
    subtitle: `${al.artist} · ${al.year} · ${al.genre}`,
    image: al.image,
    source: "global" as const,
  })),
  ...GLOBAL_PLAYLISTS.map((p) => ({
    id: p.id,
    entityId: p.id,
    kind: "playlist" as const,
    title: p.name,
    subtitle: `Global Playlist · ${p.trackIds.length} tracks`,
    image: p.image,
    source: "global" as const,
  })),
];

export function getAllArtists(): Artist[] {
  return [...ARTISTS, ...GLOBAL_ARTISTS];
}

export function getAllAlbums(): Album[] {
  return [...ALBUMS, ...GLOBAL_ALBUMS];
}

export function getAllPlaylists(): Playlist[] {
  return [...PLAYLISTS, ...GLOBAL_PLAYLISTS];
}

export function getAllTracks(): Track[] {
  return [...TRACKS, ...ONLINE_TRACKS];
}

export function findArtist(id: string): Artist | undefined {
  return getAllArtists().find((a) => a.id === id);
}

export function findAlbum(id: string): Album | undefined {
  return getAllAlbums().find((a) => a.id === id);
}

export function findPlaylist(id: string): Playlist | undefined {
  return getAllPlaylists().find((p) => p.id === id);
}

export function findTrack(id: string): Track | undefined {
  return getAllTracks().find((t) => t.id === id);
}

