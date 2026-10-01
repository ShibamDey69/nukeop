import { Innertube, Log } from "youtubei.js/react-native";
import { errorMessage, logger } from "../logger";
import type { YouTubeSearchResult } from "./youtubeTypes";

const PAGE_SIZE = 12;

const RESOLVE_API_BASE = "https://noobs-api.top/dipto/ytDl3";

let youtube: Innertube | null = null;
let youtubePromise: Promise<Innertube> | null = null;

let activeSearch: any = null;
let activeQuery = "";

let bufferedResults: YouTubeSearchResult[] = [];
let searchFinished = false;

let searchRequest: Promise<YouTubeSearchResult[]> | null = null;
let nextPageRequest: Promise<YouTubeSearchResult[]> | null = null;

async function getClient(): Promise<Innertube> {
  if (youtube) {
    return youtube;
  }

  Log.setLevel(Log.Level.NONE);
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

function getText(value: any): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value.text === "string") {
    return value.text;
  }

  if (typeof value.simpleText === "string") {
    return value.simpleText;
  }

  if (Array.isArray(value.runs)) {
    return value.runs.map((run: any) => run?.text ?? "").join("");
  }

  return "";
}

function getThumbnail(value: any): string {
  if (!Array.isArray(value)) {
    return "";
  }

  if (value.length === 0) {
    return "";
  }

  return value[value.length - 1]?.url ?? "";
}

function parseDuration(value: any): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string" || !value) {
    return 0;
  }

  const parts = value.split(":").map((part) => Number(part));

  if (parts.some(Number.isNaN)) {
    return 0;
  }

  return parts.reduce((total, part) => total * 60 + part, 0);
}

function mapVideo(video: any): YouTubeSearchResult | null {
  if (!video?.id) {
    return null;
  }

  const type = video.type;

  if (type && type !== "Video" && type !== "LockupView") {
    return null;
  }

  const title = getText(video.title);

  if (!title) {
    return null;
  }

  const author =
    getText(video.author?.name) || getText(video.author) || "Unknown";

  const durationValue = video.duration?.text ?? video.duration;

  return {
    id: video.id,
    title,
    channel: author,
    durationSeconds: parseDuration(durationValue),
    thumbnail: getThumbnail(video.thumbnails),
  };
}

function extractVideos(search: any): YouTubeSearchResult[] {
  const output: YouTubeSearchResult[] = [];
  const seen = new Set<string>();

  for (const video of search.videos ?? []) {
    if (output.length >= PAGE_SIZE) {
      break;
    }

    const mapped = mapVideo(video);

    if (!mapped) {
      continue;
    }

    if (seen.has(mapped.id)) {
      continue;
    }

    seen.add(mapped.id);
    output.push(mapped);
  }

  return output;
}

function resetSearchState() {
  activeSearch = null;
  activeQuery = "";
  bufferedResults = [];
  searchFinished = false;
  searchRequest = null;
  nextPageRequest = null;
}

export async function searchDirect(
  query: string
): Promise<YouTubeSearchResult[]> {
  const q = query.trim();

  if (!q) {
    resetSearchState();
    return [];
  }

  if (activeQuery === q && activeSearch) {
    return bufferedResults.splice(0, PAGE_SIZE);
  }

  if (searchRequest) {
    return searchRequest;
  }

  resetSearchState();

  activeQuery = q;

  searchRequest = (async () => {
    try {
      const client = await getClient();

      const search = await client.search(q);

      activeSearch = search;

      const results = extractVideos(search);

      return results;
    } catch (error) {
      resetSearchState();

      logger.warn(
        `YouTube search failed: ${errorMessage(error)}`
      );

      throw error;
    } finally {
      searchRequest = null;
    }
  })();

  return searchRequest;
}

export async function searchNextPage(): Promise<YouTubeSearchResult[]> {
  if (searchFinished) {
    return [];
  }

  if (!activeSearch) {
    return [];
  }

  if (nextPageRequest) {
    return nextPageRequest;
  }

  nextPageRequest = (async () => {
    try {
      if (!activeSearch.has_continuation) {
        searchFinished = true;
        return [];
      }

      const nextSearch = await activeSearch.getContinuation();

      activeSearch = nextSearch;

      const results = extractVideos(nextSearch);

      if (results.length === 0) {
        searchFinished = true;
      }

      return results;
    } catch (error) {
      logger.warn(
        `YouTube next page failed: ${errorMessage(error)}`
      );

      return [];
    } finally {
      nextPageRequest = null;
    }
  })();

  return nextPageRequest;
}

export function hasMoreSearchResults(): boolean {
  return Boolean(
    activeSearch && !searchFinished && activeSearch.has_continuation
  );
}

export function clearSearch(): void {
  resetSearchState();
}

export interface DirectStream {
  url: string;
  itag?: number;
  mimeType?: string;
  bitrate?: number;
  width?: number;
  height?: number;
  quality?: string;
  fps?: number;
  contentLength?: number;
  audioQuality?: string;
  hasAudio?: boolean;
  hasVideo?: boolean;
}

export async function resolveStreamDirect(
  videoId: string
): Promise<DirectStream> {
  try {
    const res = await fetch(
      `${RESOLVE_API_BASE}?link=${encodeURIComponent(videoId)}&format=mp3`
    );

    if (!res.ok) {
      throw new Error(`API responded ${res.status}`);
    }

    const data = await res.json();

    if (!data.success || !data.downloadLink) {
      throw new Error(data.message ?? "API returned no download link");
    }

    return {
      url: data.downloadLink,
      mimeType: "audio/mpeg",
      quality: data.quality ?? "mp3",
      hasAudio: true,
      hasVideo: false,
    };
  } catch (error) {
    logger.warn(
      `Stream resolution failed: ${errorMessage(error)}`
    );

    throw error;
  }
}

export async function resolveAudioStream(
  videoId: string
): Promise<DirectStream> {
  return resolveStreamDirect(videoId);
}

export async function getVideoInfo(videoId: string) {
  try {
    const client = await getClient();

    const info = await client.getBasicInfo(videoId);

    return {
      id: videoId,
      title: info.basic_info?.title ?? "Untitled",
      channel: info.basic_info?.author ?? "Unknown",
      durationSeconds: info.basic_info?.duration ?? 0,
      thumbnail: getThumbnail(info.basic_info?.thumbnail),
    };
  } catch (error) {
    logger.warn(
      `YouTube video info failed: ${errorMessage(error)}`
    );

    throw error;
  }
}

export function extractVideoId(input: string): string | null {
  const value = input.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);

    const hostname = url.hostname.toLowerCase();

    if (hostname === "youtu.be" || hostname === "www.youtu.be") {
      const id = url.pathname.replace(/^\/+/, "").split("/")[0];

      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (
      hostname === "youtube.com" ||
      hostname.endsWith(".youtube.com")
    ) {
      const queryId = url.searchParams.get("v");

      if (queryId && /^[a-zA-Z0-9_-]{11}$/.test(queryId)) {
        return queryId;
      }

      const match = url.pathname.match(
        /\/(?:shorts|embed|live)\/([a-zA-Z0-9_-]{11})/
      );

      if (match?.[1]) {
        return match[1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export async function getVideoFromUrl(url: string) {
  const videoId = extractVideoId(url);

  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  return getVideoInfo(videoId);
}
