export interface Artist {
  id: string;
  name: string;
  /** Number of distinct albums this artist has in the library right now. */
  albumCount: number;
  /** Remote artwork URL. Usually empty — real sources (on-device files, YouTube) rarely carry artist photos — in which case the UI falls back to generated gradient art. */
  image: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  /** Remote artwork URL. May be empty, in which case the UI falls back to generated gradient art. */
  image: string;
}

/** A playlist as handed to the UI: the user's own, or an auto-generated "smart" one (see library.ts). */
export interface Playlist {
  id: string;
  name: string;
  image: string;
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
  /** Remote artwork URL. May be empty (e.g. files found on the device). */
  image: string;
  audioUrl: string;
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  category: "Themes" | "Lyrics" | "Visualizers" | "Tools";
  iconBg: string;
  iconLabel: string;
  /** false = listed in the store but not built yet ("Coming soon"). */
  available: boolean;
  defaultInstalled: boolean;
  settingsSummary: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  summary: string;
  highlights?: string[];
}

/** Id of the virtual "Liked Songs" playlist (derived from liked tracks). */
export const LIKED_PLAYLIST_ID = "liked";

export const PLUGINS: Plugin[] = [
  {
    id: "lyrics",
    name: "Lyrics",
    version: "v1.0.0",
    description: "Synced and plain lyrics for the track that's playing, fetched from LRCLIB.",
    category: "Lyrics",
    iconBg: "#4A90D9",
    iconLabel: "ly",
    available: true,
    defaultInstalled: true,
    settingsSummary: "Source: lrclib.net · needs an internet connection",
  },
  {
    id: "themes-extra",
    name: "Themes Extra",
    version: "v1.0.0",
    description: "Four more accent colours: teal, red, amber and monochrome.",
    category: "Themes",
    iconBg: "#FF5C93",
    iconLabel: "tx",
    available: true,
    defaultInstalled: false,
    settingsSummary: "Adds extra accent colours in Preferences",
  },
  {
    id: "lastfm",
    name: "Last.fm Scrobbler",
    version: "v0.1.0",
    description: "Scrobble your plays to Last.fm automatically.",
    category: "Tools",
    iconBg: "#D51007",
    iconLabel: "as",
    available: false,
    defaultInstalled: false,
    settingsSummary: "Not available yet",
  },
  {
    id: "visualizer",
    name: "Visualizer",
    version: "v0.1.0",
    description: "Real-time audio visualizer on the Now Playing screen.",
    category: "Visualizers",
    iconBg: "#111111",
    iconLabel: "vz",
    available: false,
    defaultInstalled: false,
    settingsSummary: "Not available yet",
  },
  {
    id: "youtube",
    name: "YouTube Source",
    version: "v0.2.0",
    description: "Search and stream from YouTube. Works out of the box — no server to run. Adds a YouTube tab to Search.",
    category: "Tools",
    iconBg: "#FF0000",
    iconLabel: "yt",
    available: true,
    defaultInstalled: false,
    settingsSummary: "Direct mode works immediately; a self-hosted server is optional (Preferences → YouTube Source)",
  },
  {
    id: "discord",
    name: "Discord Rich Presence",
    version: "v0.1.0",
    description: "Show what you're playing on Discord.",
    category: "Tools",
    iconBg: "#5865F2",
    iconLabel: "dp",
    available: false,
    defaultInstalled: false,
    settingsSummary: "Not available yet",
  },
];

export const APP_VERSION = "1.2.0";

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "v1.2.0",
    date: "Sep 24, 2026",
    summary: "The built-in demo catalogue is gone — nukeop now plays your actual music.",
    highlights: [
      "Removed the placeholder artist/album/track catalogue; Artists, Albums and Playlists are now built live from what's actually in your library",
      "YouTube Source now works directly on-device by default — no companion server required (the old yt-dlp server is still there as an optional, more reliable fallback)",
      "Search results — local and YouTube — now have a one-tap Add to Queue action",
      "An empty queue now surfaces real recommendations (liked songs, recent plays, or your local library) instead of a blank screen",
      "Fixed background playback: the app now declares the native background-audio capability it was missing, so playback survives being backgrounded or the screen locking instead of getting killed after a few minutes",
      "New auto-generated \"Recently played\" and \"Most played\" smart playlists, built from your real listening history",
    ],
  },
  {
    version: "v1.1.0",
    date: "Sep 22, 2026",
    summary: "A cleaner look and a player that does what it says.",
    highlights: [
      "New soft, minimal design with light and dark themes",
      "Real playlists: create, rename, delete, add and remove tracks",
      "Liked Songs now reflects the tracks you actually liked",
      "Background playback with lock-screen controls",
      "Sleep timer, playback speed and a queue that survives restarts",
      "Working lyrics plugin, live logs, and settings that actually apply",
    ],
  },
  { version: "v0.9.0", date: "Aug 20, 2024", summary: "New mobile UI, plugin system and more improvements." },
  { version: "v0.8.5", date: "Jul 12, 2024", summary: "Added YouTube source and lyrics support." },
  { version: "v0.8.0", date: "Jun 1, 2024", summary: "Major performance improvements and library rebuild." },
  { version: "v0.7.2", date: "Apr 18, 2024", summary: "Bug fixes and stability improvements." },
  { version: "v0.7.0", date: "Mar 5, 2024", summary: "Plugin API v2, custom themes support." },
  { version: "v0.6.5", date: "Jan 30, 2024", summary: "Last.fm scrobbler plugin released." },
];
