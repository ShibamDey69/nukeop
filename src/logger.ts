import { useSyncExternalStore } from "react";

export type LogLevel = "INFO" | "DEBUG" | "WARN" | "ERROR";

export interface LogEntry {
  id: number;
  ts: number;
  level: LogLevel;
  message: string;
}

const MAX_ENTRIES = 400;

let nextId = 1;
let snapshot: readonly LogEntry[] = [];
const listeners = new Set<() => void>();

function push(level: LogLevel, message: string) {
  const entry: LogEntry = { id: nextId++, ts: Date.now(), level, message };
  const next = snapshot.length >= MAX_ENTRIES ? snapshot.slice(snapshot.length - MAX_ENTRIES + 1) : snapshot.slice();
  next.push(entry);
  snapshot = next;
  listeners.forEach((l) => l());
  if (__DEV__) {
    const line = `[nukeop] ${level} ${message}`;
    if (level === "ERROR") console.error(line);
    else if (level === "WARN") console.warn(line);
    else console.log(line);
  }
}

function pad(n: number, width = 2) {
  return String(n).padStart(width, "0");
}

export function formatLogTime(ts: number): string {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export const logger = {
  info: (message: string) => push("INFO", message),
  debug: (message: string) => push("DEBUG", message),
  warn: (message: string) => push("WARN", message),
  error: (message: string) => push("ERROR", message),
  clear() {
    snapshot = [];
    listeners.forEach((l) => l());
  },
  getSnapshot: () => snapshot,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  asText(entries: readonly LogEntry[] = snapshot): string {
    return entries.map((e) => `${formatLogTime(e.ts)} ${e.level.padEnd(5)} ${e.message}`).join("\n");
  },
};

export function useLogs(): readonly LogEntry[] {
  return useSyncExternalStore(logger.subscribe, logger.getSnapshot, logger.getSnapshot);
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}
