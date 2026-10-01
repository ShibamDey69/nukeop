export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

export function hsl(h: number, s: number, l: number): string {
  const hh = ((h % 360) + 360) % 360;
  const ss = clamp01(s);
  const ll = clamp01(l);
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ll - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hh < 60) [r, g, b] = [c, x, 0];
  else if (hh < 120) [r, g, b] = [x, c, 0];
  else if (hh < 180) [r, g, b] = [0, c, x];
  else if (hh < 240) [r, g, b] = [0, x, c];
  else if (hh < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** "#rrggbb" + alpha (0..1) -> "rgba(r,g,b,a)". Non-hex input is returned unchanged. */
export function withAlpha(color: string, alpha: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(color);
  if (!m) return color;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/**
 * Deterministic gradient pair for a seed (album id, playlist id…). Used for
 * placeholder artwork and for the optional per-album tinted backgrounds.
 */
export function tintFor(seed: string, isDark: boolean): [string, string] {
  const h = hashString(seed) % 360;
  return isDark
    ? [hsl(h, 0.55, 0.42), hsl(h + 38, 0.6, 0.22)]
    : [hsl(h, 0.7, 0.62), hsl(h + 38, 0.7, 0.5)];
}

/** A single background tint colour for a seed, tuned to sit behind text. */
export function backdropFor(seed: string, isDark: boolean): string {
  const h = hashString(seed) % 360;
  return isDark ? hsl(h, 0.5, 0.3) : hsl(h, 0.75, 0.72);
}
