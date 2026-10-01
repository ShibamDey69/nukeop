export interface YouTubeSearchResult {
  id: string; // raw YouTube video id, e.g. "dQw4w9WgXcQ"
  title: string;
  channel: string;
  durationSeconds: number;
  thumbnail: string;
}

export class YouTubeSourceError extends Error {}
