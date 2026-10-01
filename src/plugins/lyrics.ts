import type { Track } from "../data";
import { errorMessage, logger } from "../logger";
import { Innertube, Log } from "youtubei.js/react-native";

export interface LyricLine {
  /** Start time in seconds, or null for unsynced lyrics. */
  time: number | null;
  text: string;
}

export interface Lyrics {
  synced: boolean;
  lines: LyricLine[];
  instrumental: boolean;
}

const cache = new Map<string, Lyrics | null>();

let youtube: Innertube | null = null;
let youtubePromise: Promise<Innertube> | null = null;

async function getClient(): Promise<Innertube> {
  if (youtube) return youtube;
  Log.setLevel(Log.Level.ERROR);
  if (!youtubePromise) {
    youtubePromise = Innertube.create({
      generate_session_locally: true,
      player_client: ["TV_EMBEDDED", "WEB_EMBEDDED_PLAYER", "TV"],
    });
  }

  try {
    youtube = await youtubePromise;
    return youtube;
  } finally {
    youtubePromise = null;
  }
}

export function getYouTubeTrackId(track: Track): string | null {
  const raw = (track.id ?? "").toString().trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;

  const prefixed = /^(?:yt|youtube)[-_:]([a-zA-Z0-9_-]{11})$/i.exec(raw);
  if (prefixed) return prefixed[1];

  return null;
}

function extractText(value: any): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value.text === "string") return value.text;
  if (typeof value.simpleText === "string") return value.simpleText;
  if (typeof value.content === "string") return value.content;
  if (Array.isArray(value.runs)) {
    return value.runs.map((run: any) => run?.text ?? "").join("");
  }
  if (Array.isArray(value)) {
    return value.map(extractText).join("\n");
  }
  if (typeof value.toString === "function") {
    const str = value.toString();
    if (str && str !== "[object Object]") return str;
  }
  return "";
}

const TIME_TAG_RE = /\[(\d{1,3}):(\d{2}(?:[.:]\d{1,3})?)\]/;

function parseYouTubeLyrics(raw: any): Lyrics | null {
  if (raw == null) return null;

  let text: string;

  if (typeof raw === "string") {
    text = raw;
  } else if (raw.description != null) {
    // youtubei.js returns a MusicDescriptionShelf whose `description`
    // is a Text node, not a plain string.
    text = extractText(raw.description);
  } else {
    text = extractText(raw);
  }

  text = text.trim();

  if (!text) return null;

  if (/^instrumental$/i.test(text)) {
    return { synced: false, lines: [], instrumental: true };
  }

  // Some tracks come back with LRC-style timestamps — keep them synced
  // so the Lyrics screen can highlight the active line.
  if (TIME_TAG_RE.test(text)) {
    const syncedLines = parseLrc(text);
    if (syncedLines.length > 0) {
      return { synced: true, lines: syncedLines, instrumental: false };
    }
  }

  const lines = text
    .split(/\r?\n/)
    .map((line) => ({ time: null, text: line.trim() }))
    .filter((line) => line.text.length > 0);

  if (lines.length === 0) return null;

  return { synced: false, lines, instrumental: false };
}

async function fetchYouTubeLyrics(track: Track): Promise<Lyrics | null> {
  const videoId = getYouTubeTrackId(track);

  logger.info(`[lyrics] fetch start id=${track.id} videoId=${videoId} title="${track.title}"`);

  if (!videoId) return null;

  try {
    const client = await getClient();

    // youtubei.js exposes lyrics on the Music client:
    //   innertube.music.getLyrics(videoId) -> MusicDescriptionShelf
    // (client.getLyrics does not exist in v18 — that was the bug:
    // the video id never reached the lyrics endpoint.)
    const music = (client as any).music;
    const getLyrics = music?.getLyrics;

    logger.info(`[lyrics] client ready, music.getLyrics=${typeof getLyrics}`);

    if (typeof getLyrics !== "function") {
      logger.debug("Innertube music.getLyrics not available in this version");
      return null;
    }

    const response = await getLyrics.call(music, videoId);

    return parseYouTubeLyrics(response);
  } catch (error) {
    logger.warn(
      `YouTube lyrics lookup failed for "${track.title}": ${errorMessage(error)}`
    );
    return null;
  }
}

export function parseLrc(lrc: string): LyricLine[] {
  const TIME_TAG = /\[(\d{1,3}):(\d{2}(?:[.:]\d{1,3})?)\]/g;
  const lines: LyricLine[] = [];
  for (const raw of lrc.split(/\r?\n/)) {
    const tags = Array.from(raw.matchAll(TIME_TAG));
    if (tags.length === 0) continue;
    const text = raw.replace(TIME_TAG, "").trim();
    for (const tag of tags) {
      const minutes = parseInt(tag[1], 10);
      const seconds = parseFloat(tag[2].replace(":", "."));
      lines.push({ time: minutes * 60 + seconds, text });
    }
  }
  return lines.sort((a, b) => (a.time ?? 0) - (b.time ?? 0));
}

/**
 * Lyrics lookup via YouTube Music (Innertube). Only works for tracks whose
 * id is a YouTube video id; everything else resolves to null. Resolves to
 * null when no lyrics are found; rejects on unexpected network errors.
 */
export async function fetchLyrics(track: Track): Promise<Lyrics | null> {
  if (cache.has(track.id)) return cache.get(track.id) ?? null;

  const result = await fetchYouTubeLyrics(track);

  logger.info(`[lyrics] youtube result: ${result ? result.lines.length + " lines" : "null"}`);

  cache.set(track.id, result);
  logger.debug(result ? `Lyrics found for "${track.title}"` : `No lyrics for "${track.title}"`);
  return result;
}
