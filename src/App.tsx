import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { TopBar, BottomNavigation, MiniPlayer, Tab } from "./components";
import HomeScreen, { HomeNav } from "./screens/HomeScreen";
import LibraryScreen from "./screens/LibraryScreen";
import PluginsScreen from "./screens/PluginsScreen";
import PreferencesScreen from "./screens/PreferencesScreen";
import WhatsNewScreen from "./screens/WhatsNewScreen";
import LogsScreen from "./screens/LogsScreen";
import NowPlayingScreen, { NowPlayingTrack } from "./screens/NowPlayingScreen";
import LocalSongsScreen from "./screens/LocalSongsScreen";
import SearchScreen from "./screens/SearchScreen";
import { useTheme } from "./theme";
import { FluidSwitcher } from "./motion";
import { NOW_PLAYING, LocalTrack } from "./data";
import { resolveTrackUri } from "./localLibrary";

type Overlay = "preferences" | "whats-new" | "logs" | "now-playing" | "local-songs" | "search";
type LibraryTab = "artists" | "albums" | "playlists";
type PluginsTab = "store" | "installed";

const DEFAULT_TRACK: NowPlayingTrack = {
  title: NOW_PLAYING.title,
  artist: NOW_PLAYING.artist,
  album: NOW_PLAYING.album,
  duration: NOW_PLAYING.duration,
  currentTime: NOW_PLAYING.currentTime,
  image: NOW_PLAYING.image,
};

export default function App() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  // Overlays behave like a real navigation stack: back pops one at a time
  // instead of exiting the app, and only exits at the true root screen.
  const [overlayStack, setOverlayStack] = useState<Overlay[]>([]);
  const [libraryTab, setLibraryTab] = useState<LibraryTab>("artists");
  const [pluginsTab, setPluginsTab] = useState<PluginsTab>("store");
  const [isPlaying, setIsPlaying] = useState(true);
  const [localTracks, setLocalTracks] = useState<LocalTrack[]>([]);
  const [nowPlaying, setNowPlaying] = useState<NowPlayingTrack>(DEFAULT_TRACK);

  const overlay = overlayStack[overlayStack.length - 1] ?? null;

  const pushOverlay = useCallback((o: Overlay) => setOverlayStack((prev) => [...prev, o]), []);
  const popOverlay = useCallback(() => setOverlayStack((prev) => prev.slice(0, -1)), []);

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    setOverlayStack([]);
  }

  function handleHomeNav(dest: HomeNav) {
    if (dest === "artists") {
      setActiveTab("library");
      setLibraryTab("artists");
      setOverlayStack([]);
    } else if (dest === "albums") {
      setActiveTab("library");
      setLibraryTab("albums");
      setOverlayStack([]);
    } else if (dest === "playlists") {
      setActiveTab("library");
      setLibraryTab("playlists");
      setOverlayStack([]);
    } else if (dest === "plugins") {
      setActiveTab("plugins");
      setPluginsTab("store");
      setOverlayStack([]);
    } else {
      pushOverlay(dest as Overlay);
    }
  }

  function handlePlayLocalTrack(track: LocalTrack) {
    setNowPlaying({
      title: track.title,
      artist: track.artist,
      album: "On this device",
      duration: track.duration || 0,
      currentTime: 0,
    });
    setIsPlaying(true);
    pushOverlay("now-playing");
    // Resolve the actual playable file URI lazily — cheap metadata was all
    // that was needed for the list; the real URI is only fetched once a
    // track is actually opened for playback.
    resolveTrackUri(track.id).catch(() => {});
  }

  // Hardware back (Android): pop one overlay, then fall back to the home
  // tab, and only let the system handle it (exit the app) once we're
  // already at the true root — never a hard exit from a nested screen.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (overlayStack.length > 0) {
        popOverlay();
        return true;
      }
      if (activeTab !== "home") {
        setActiveTab("home");
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [overlayStack.length, activeTab, popOverlay]);

  const isImmersive = overlay === "now-playing" || overlay === "search";
  const screenKey = overlay ?? `${activeTab}:${activeTab === "library" ? libraryTab : activeTab === "plugins" ? pluginsTab : ""}`;
  const direction = overlayStack.length > 0 ? "forward" : "back";

  return (
    <SafeAreaView style={[styles(colors).appShell, { backgroundColor: colors.ground }]} edges={["top", "bottom"]}>
      <StatusBar style={colors.isDark ? "light" : "dark"} />

      {!isImmersive && (
        <TopBar
          onBack={overlay ? popOverlay : undefined}
          onSearch={() => pushOverlay("search")}
        />
      )}

      <View style={{ flex: 1 }}>
        <FluidSwitcher screenKey={screenKey} direction={direction}>
          {overlay === "now-playing" && (
            <NowPlayingScreen
              track={nowPlaying}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying((p) => !p)}
              onBack={popOverlay}
            />
          )}
          {overlay === "search" && <SearchScreen localTracks={localTracks} onClose={popOverlay} />}
          {overlay === "preferences" && <PreferencesScreen />}
          {overlay === "whats-new" && <WhatsNewScreen />}
          {overlay === "logs" && <LogsScreen />}
          {overlay === "local-songs" && (
            <LocalSongsScreen
              tracks={localTracks}
              onTracksScanned={setLocalTracks}
              onPlayTrack={handlePlayLocalTrack}
            />
          )}

          {!overlay && activeTab === "home" && <HomeScreen onNavigate={handleHomeNav} />}
          {!overlay && activeTab === "library" && <LibraryScreen key={libraryTab} initialTab={libraryTab} />}
          {!overlay && activeTab === "plugins" && <PluginsScreen key={pluginsTab} initialTab={pluginsTab} />}
        </FluidSwitcher>
      </View>

      {!isImmersive && (
        <MiniPlayer
          isPlaying={isPlaying}
          title={nowPlaying.title}
          artist={nowPlaying.artist}
          image={nowPlaying.image}
          onPlayPause={() => setIsPlaying((p) => !p)}
          onTap={() => pushOverlay("now-playing")}
        />
      )}

      {!isImmersive && <BottomNavigation active={activeTab} onTabChange={handleTabChange} />}
    </SafeAreaView>
  );
}

function styles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    appShell: {
      flex: 1,
    },
  });
}
