# nukeop (React Native / Expo)

A neobrutalist music player UI built with Expo (SDK 57 / React Native 0.86 /
React 19.2), running on iOS, Android, and web from one codebase.

## What's in this pass

- **Fluid transitions everywhere.** `src/motion.tsx` provides three reusable
  primitives built on the built-in `Animated` API (no extra native
  dependency): `FluidSwitcher` (cross-fade + slide between screens/tabs/
  modals), `FadeSlideIn` (staggered entrance for lists and card grids), and
  `AnimatedPressable` (a springy scale-down on every tap). Every screen,
  card, list row, and button uses one of these instead of appearing/
  disappearing instantly.
- **Dead hamburger icon removed.** The old menu icon in the top bar opened
  nothing (`onMenu={() => {}}`). It's gone; the top bar now only shows a
  back arrow (when there's somewhere to go back to) and the search icon,
  which now actually opens something.
- **Back no longer exits the app.** `src/App.tsx` keeps a real navigation
  stack (`overlayStack`) and listens for the Android hardware back button
  via `BackHandler`: back pops one screen at a time, falls back to the Home
  tab, and only lets the system exit the app once you're already at the
  true root.
- **Local song scanning.** `src/localLibrary.ts` uses `expo-media-library`
  to scan the device for audio files. Each track shows whatever metadata is
  available (best-effort `Artist - Title` filename parsing, otherwise the
  filename and "Unknown Artist"), and a generated default icon/artwork tile
  stands in for anything with no real artwork. Reachable from the new
  "Local songs" card on Home. Tapping a track plays it in the existing
  Now Playing screen.
- **Switchable themes.** `src/theme.tsx` is now a `ThemeProvider` +
  `useTheme()` context (persisted with `@react-native-async-storage/async-storage`)
  instead of a static color object, so picking a theme in Preferences
  actually re-colors the whole app, not just the Preferences screen. Six
  palettes ship out of the box (Pink is the default): Pink, Grape, Sky,
  Mint, Sunset, and a dark palette, Midnight.
- **Local + Global search, same visual style.** The search icon opens a
  dedicated search screen (`src/screens/SearchScreen.tsx`) with a segmented
  "This device" / "Online" toggle. Local search is instant and searches
  your already-loaded artists/albums/playlists plus any scanned local
  songs. Global search runs against a small fake "online" catalog
  (`ONLINE_RESULTS` in `src/data.ts`) with a simulated network delay, so it
  reads like a real remote lookup — swap `searchGlobal()` in `src/search.ts`
  for a real API call whenever you wire one up.
- **More responsive layout.** Grid screens (Artists/Albums) pick up extra
  columns on wider screens/tablets via `useResponsiveColumns()` in
  `src/components.tsx`, and touch targets/hit areas were kept generous
  throughout.

## Project layout

```
App.tsx                     entry point — loads fonts, wraps app in ThemeProvider
src/
  App.tsx                   navigation stack (tabs + overlay stack) + BackHandler
  theme.tsx                 ThemeProvider/useTheme(), palettes, font names, shadow tokens
  motion.tsx                FluidSwitcher / FadeSlideIn / AnimatedPressable / FadeIn
  components.tsx             shared UI: TopBar, BottomNavigation, MiniPlayer, SearchBar,
                             SegmentedControl, Toggle, DefaultArt, etc.
  icons.tsx                  react-native-svg icon set
  data.ts                    demo data (artists/albums/playlists/plugins/logs) +
                             fake online search catalog + LocalTrack/SearchResult types
  localLibrary.ts            expo-media-library device scan + metadata fallback
  search.ts                  local (instant) vs global (simulated-delay) search logic
  screens/
    HomeScreen.tsx
    LibraryScreen.tsx
    PluginsScreen.tsx
    PreferencesScreen.tsx     theme picker lives here
    WhatsNewScreen.tsx
    LogsScreen.tsx
    NowPlayingScreen.tsx
    LocalSongsScreen.tsx      new — scan & play local device songs
    SearchScreen.tsx          new — Local/Global search toggle
```

## Setup

```bash
npm install
```

That's it — `package.json` (and the committed `package-lock.json`) already
pin the exact dependency versions verified against Expo SDK 57 (every
version below was confirmed with `expo-doctor`'s own compatibility check,
not guessed). You do **not** need to run `npx expo install` afterward.

```bash
npx expo start          # run in Expo Go
npx expo prebuild        # regenerate native android/ and ios/ projects
```

Native `android/` and `ios/` folders were intentionally **not** included in
this zip (the originals were generated against much older package
versions and would silently mismatch the updated ones). Run
`npx expo prebuild` once after installing to generate fresh native
projects for the current dependency set.

### Permissions

Local song scanning requires media/audio library permission, declared in
`app.json`:
- **iOS**: `NSAppleMusicUsageDescription` in `infoPlist`
- **Android**: `READ_MEDIA_AUDIO` / `READ_EXTERNAL_STORAGE`, plus the
  `expo-media-library` config plugin

The permission prompt fires the first time you tap "Scan for local songs"
on the Local Songs screen.

## Notes / follow-ups

- `expo-media-library` on SDK 57 ships a redesigned, non-deprecated
  class-based API (`Query`, `Asset`, `AssetField`, `MediaType`). This
  project uses that current API throughout `src/localLibrary.ts` — bulk
  metadata is fetched cheaply via `Query().exeForMetadata()`, and a
  track's playable file URI is resolved lazily via `Asset.getUri()` only
  once something actually needs to play it. The older root-level function
  exports (`getAssetsAsync`, etc.) are deprecated stubs that throw at
  runtime in this SDK version and are deliberately not used anywhere here.
- Global search is fake/demo data by design (per the brief — "online for
  now fake data"). `searchGlobal()` in `src/search.ts` is the one function
  to swap for a real backend later; the UI won't need to change.
- Every dependency version in `package.json` was verified two ways before
  packaging: `expo-doctor`'s "packages match Expo SDK" check (0 mismatches)
  and an actual Metro bundle export for Android, iOS, and web (all three
  succeed with 0 errors) — including the exact JS-bundling step that a
  release Gradle build runs (`createBundleReleaseJsAndAssets`). The
  previous zip was missing `babel-preset-expo` as an explicit
  dependency, which is what caused that task to fail; it's now pinned
  along with everything else Babel/Metro needs to resolve on a clean
  `npm install`.
- Everything was also type-checked end-to-end with `tsc --noEmit` in the
  project's own strict `tsconfig.json` — 0 errors.
