# What changed

This was a full rebuild of the UI and the app's functionality, not a reskin. Everything below is now real — nothing is a static mock.

## v1.2.0 — removing the last of the placeholder content
- **Demo catalogue removed.** `src/data.ts` no longer ships a hardcoded list of artists/albums/tracks (with SoundHelix sample audio and Unsplash artwork). Artists, Albums, "Recently played" and "Most played" are now all derived live, in `src/library.ts`, from tracks that actually exist — on-device scans and anything sourced from YouTube. An empty library now genuinely looks empty (with a prompt to scan or search) instead of showing fabricated songs.
- **YouTube Source works without a companion server.** Investigated running `yt-dlp`/`yt-dlp-wrap` client-side directly — not possible (no Python runtime or subprocess primitive in an RN app sandbox, on either platform). Instead, `src/plugins/youtubeInnertube.ts` talks to YouTube's own Innertube JSON API straight from the app for search (reliable) and best-effort stream resolution (inherently fragile — YouTube increasingly requires a "Proof of Origin" token on its streaming clients that nothing running purely on-device can mint; this is a known, moving-target limitation shared by yt-dlp itself, not something specific to this implementation). The original `yt-source-server` (real `yt-dlp`) is kept as an optional, more reliable fallback — direct mode is now the default and needs no setup.
- **Search: Add to Queue.** Every search result, local or YouTube, now has a one-tap "add to queue" action, not just "play now" buried in a long-press menu.
- **Empty queue shows recommendations.** Previously just an empty-state message. Now: liked songs, then recently played, then whatever's in the library, deduplicated — never fabricated content, and never shown at all if the library is genuinely empty (in which case it still falls back to a prompt).
- **Background playback actually survives backgrounding now.** Root cause: `app.json` never declared the native background-audio capability (`expo-audio`'s `enableBackgroundPlayback` config plugin was missing entirely), so despite the JS-level `setAudioModeAsync`/lock-screen calls already being correct, iOS never got the `UIBackgroundModes: audio` entitlement and Android never got the foreground-service permissions — the OS was killing playback after a few minutes regardless of what the JS code did. Fixed in `app.json`, plus the Android 13+ notification-permission request the media notification (and therefore the foreground service) depends on.
- **YouTube stream URLs refresh automatically.** YouTube's direct audio URLs expire after a few hours. A YouTube track saved to Liked Songs or a playlist now re-resolves a fresh URL automatically if playback fails on a stale one, instead of just failing or getting silently skipped.
- **New smart playlists**: "Recently played" and "Most played", both computed from real listening history (a new persisted play-count map), not curated/fake.

This round of changes was made without network access in the environment it was built in, so **`npm install` + `npx tsc --noEmit` + a real device/simulator run haven't been performed** — only static syntax checking and manual review. Please run those before shipping, same as you would for any change.

## Design
- New soft, minimal design system (`src/theme.tsx`): light/dark (system-aware), 5 base accent colors + 4 more unlockable via the Themes Extra plugin, consistent spacing/radius tokens.
- New type scale: Outfit for display text, DM Sans for body, JetBrains Mono for numbers/logs.
- Rebuilt icon set (`src/icons.tsx`), shared primitives (`src/ui.tsx`): buttons, switches, chips, tab bars, settings rows, search field, empty states.
- Gradient placeholder artwork per track/album/playlist (deterministic per-id colour), animated equalizer bars, bottom sheets, screen transitions.

## Functionality that was previously stubbed and is now real
- **Playlists**: create, rename, delete, add/remove tracks, all persisted (`src/library.ts`).
- **Liked Songs**: real, persisted, reflected everywhere a track appears.
- **Local library scan** (`src/localMusic.ts`): actual `expo-media-library` scan for on-device audio, with permission states, filename → title/artist parsing, and persisted results.
- **Plugins**: install/uninstall/enable state is real and persisted (`src/plugins.ts`); the Lyrics plugin actually fetches from LRCLIB (`src/lyrics.ts`), synced or plain.
- **Preferences**: every toggle does something — theme, accent, background playback + lock-screen controls, resume-on-launch (session persistence), rescan-on-launch, dynamic colors, reset all data.
- **Logs**: a real in-app logger (`src/logger.ts`) that the player, scanner, lyrics, and plugin systems write to — searchable and filterable by level.
- **Player** (`src/player/PlayerContext.tsx`): proper shuffle (no-repeat-until-exhausted + back-history), repeat one/all, playback speed, sleep timer (by time or end-of-track), auto-skip on playback error, session restore across app restarts, lock-screen metadata via `expo-audio`.
- **Queue**: reorderable, removable, tap to jump.
- **Search**: real results across artists/albums/playlists/tracks (including on-device tracks), with persisted recent searches.

## Fixed along the way
- Pre-existing TypeScript errors (font imports, `expo-audio` API usage) that meant the project didn't actually type-check.
- A duplicate-header layout bug introduced partway through the rebuild (caught via screenshot testing).
- A React/web gotcha in the search screen (`""` rendered as a stray text node) and two nested-interactive-element issues in `TrackRow`/`MiniPlayer` (caught via a headless-browser pass — harmless on native, but real console errors and invalid HTML on web).

## Verified
- `npx tsc --noEmit` — clean, 0 errors.
- Full Metro bundle (845 modules) — no resolution errors.
- Manual click-through on web (Chromium) of every screen: Home, Library (all 4 tabs), Plugins (both tabs), Search (empty + results), Preferences, Logs, What's New, Artist/Album/Playlist detail, Now Playing, Queue — no console errors.

## Known limitations
- YouTube playback (not search) is inherently best-effort in direct mode — see the v1.2.0 note above. The self-hosted server fallback is the reliable option if direct resolution fails often for you.
- Local files only get artist/title from filename parsing, no ID3/metadata tag reading — real but coarse; a track's "album" is just "On this device" for every local file, since there's no reliable per-album metadata available from the current scan approach.
- The v1.2.0 changes above weren't run through a live TypeScript check, Metro bundle, or on-device test (no network access in the sandbox they were made in) — only static syntax checking. Please verify with `npx tsc --noEmit` and a real build before shipping.

## Not done
- No automated test suite exists for this project; verification above (pre-v1.2.0) was manual + type-checking + bundling.
- The queue screen reorders via up/down buttons rather than drag-and-drop, to avoid pulling in `react-native-reanimated`/`react-native-gesture-handler` as new native dependencies you'd need to rebuild for. Easy to upgrade later if you want it.
