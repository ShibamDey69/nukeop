# nukeop (React Native / Expo)

A React Native port of the "nukeop" music player UI (originally a Figma Make
web/React app), rebuilt with Expo so it runs on iOS, Android, and web from a
single codebase.

## What changed from the web version

- Tailwind classes → `StyleSheet` objects (`src/theme.ts` holds the shared
  color palette, font names, and the neobrutalist border/shadow tokens).
- Inline `<svg>` icons → `react-native-svg` components (`src/icons.tsx`).
- `<div>` / `<button>` / `<input>` → `View` / `TouchableOpacity` / `TextInput`.
- Scrollable grids/lists → `FlatList` (with `numColumns` for the artist/album
  grids) instead of CSS grid.
- The HTML `<input type="range">` progress bar → `@react-native-community/slider`.
- Google Fonts (Outfit, DM Sans, JetBrains Mono) are loaded at runtime via
  `@expo-google-fonts/*` packages instead of a CSS `@import`.
- Screen navigation is unchanged in spirit: `src/App.tsx` still holds the
  same tab + modal state machine as the original `App.tsx`, just rendering
  RN screens instead of DOM.
- `src/data.ts` is copied over unmodified — it's plain TypeScript data and
  needed no changes.

## Project layout

```
App.tsx                 entry point — loads fonts, then renders src/App
src/
  App.tsx               tab/modal state machine (was App.tsx)
  theme.ts              colors, font names, shadow/border tokens
  data.ts               mock data (artists, albums, playlists, plugins, logs…)
  icons.tsx             react-native-svg icon set
  components.tsx        TopBar, BottomNavigation, MiniPlayer, SearchBar,
                         FilterChip, SubTabBar, SectionHeader, Toggle, ChipRow
  screens/
    HomeScreen.tsx
    LibraryScreen.tsx
    PluginsScreen.tsx
    PreferencesScreen.tsx
    WhatsNewScreen.tsx
    LogsScreen.tsx
    NowPlayingScreen.tsx
```

## Running it in dev mode

This zip does not include `node_modules` (no network access when it was
generated). To run the app:

```bash
npm install
npx expo start
```

Then press `a` for Android (emulator or a connected device), `i` for the
iOS simulator, or `w` for web — or scan the QR code with the Expo Go app
on your phone.

## Building an installable Android APK

The easiest way to get a real `.apk` you can side-load, without installing
Android Studio or the Android SDK yourself, is Expo's free cloud build
service, EAS Build. This repo already has an `eas.json` with a `preview`
profile configured to output an APK (the default Expo Android build type
is an `.aab`, which the Play Store wants but you can't install directly).

1. Create a free Expo account at https://expo.dev if you don't have one.
2. Install the EAS CLI and log in:
   ```bash
   npm install -g eas-cli
   eas login
   ```
3. From the project folder, link it to your Expo account (first time only):
   ```bash
   eas init
   ```
4. Kick off the APK build:
   ```bash
   eas build --platform android --profile preview
   ```
   This uploads the project and builds it on Expo's servers — you don't
   need Android Studio, a JDK, or the Android SDK locally. It takes a few
   minutes; when it's done the CLI prints a download link for the `.apk`
   (also visible in your build history at https://expo.dev).
5. Download the APK and install it on a device (`adb install app.apk`,
   or just open the download link on the phone itself and allow installs
   from unknown sources).

### Fully local alternative (no Expo account)

If you'd rather build locally with your own Android SDK/Gradle instead of
using EAS:

```bash
npm install
npx expo prebuild -p android   # generates a native android/ folder
cd android
./gradlew assembleRelease      # or assembleDebug for a debug APK
```

The output APK will be under
`android/app/build/outputs/apk/release/app-release.apk` (unsigned — you'll
need to sign it before it'll install on most devices) or the `debug`
equivalent, which installs as-is.

If you'd rather use a specific package manager's lockfile behavior, `yarn`
or `pnpm install` both work the same way as `npm install` above.

## Troubleshooting

- **App stuck on the splash screen forever** — this was caused by the root
  `App.tsx` only ever calling `SplashScreen.hideAsync()` once font-loading
  *succeeded*. If font loading throws instead (missing asset, bad network on
  first Metro fetch, etc.), `hideAsync()` never ran and the splash screen
  stayed up indefinitely. Fixed: font-loading is now treated as "settled"
  whether it succeeds or fails (a font error just falls back to the system
  font instead of crashing), and there's a hard 2.5s timeout that forces the
  splash to hide no matter what. The app can no longer hang here.
- **Build demands a splash "image"** — earlier versions of this project's
  `app.json` used the (now mostly cosmetic) top-level `splash` key with no
  `image`. It's been replaced with the proper `expo-splash-screen` config
  plugin, pointing at real bundled assets in `assets/` (`icon.png`,
  `splash.png`, `adaptive-icon.png`, `favicon.png`) — generated to match the
  app's own neobrutalist pink/black look, so there's nothing left to supply.
- **`Error: The required package 'expo-asset'/'expo-font' cannot be found`**
  during bundling — both are now listed in `package.json` (Metro's asset
  pipeline needs `expo-asset`, and every `@expo-google-fonts/*` package
  needs `expo-font` internally, even though nothing in this project's own
  code imports either directly). If a similar error shows up for a
  different package after you add something new by hand, run
  `npx expo install <package>` instead of `npm install <package>` going
  forward — it resolves the exact version compatible with your installed
  SDK automatically, and often pulls in the correct peer dependencies too.
- **`EAS build fails with "Expected concurrency to be a number..."`** — set
  `EAS_SKIP_AUTO_FINGERPRINT=1` as an environment variable before running
  `eas build`, or update `eas-cli` to the latest version.
- To see the *real* error behind a generic `eas build` failure, either open
  the build's log link on https://expo.dev and expand the failing phase, or
  reproduce it locally/instantly with `npx expo export --platform android`.

## Notes

- Artist/album/playlist artwork still points at the original Unsplash URLs
  from the mock data — swap in your own asset pipeline for production use.
- `react-native-svg` and `@react-native-community/slider` both need native
  modules; if you're using Expo Go this is already handled, but a bare RN
  CLI project would need `pod install` after adding them.
