import React, { useEffect, useRef, useState } from "react";
import { Alert, BackHandler, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeTopBar, BottomNavigation, MiniPlayer, Tab } from "./components";
import { ScreenTransition } from "./widgets/ScreenTransition";
import { NowPlayingSheet } from "./widgets/NowPlayingSheet";
import { PlayerProvider, usePlayer } from "./player/PlayerContext";
import { NavigationProvider, useAppNavigation, Route } from "./navigation/NavigationContext";
import { useLibrary } from "./library";
import HomeScreen, { HomeNav } from "./screens/HomeScreen";
import LibraryScreen from "./screens/LibraryScreen";
import PluginsScreen from "./screens/PluginsScreen";
import PreferencesScreen from "./screens/PreferencesScreen";
import WhatsNewScreen from "./screens/WhatsNewScreen";
import LogsScreen from "./screens/LogsScreen";
import NowPlayingScreen from "./screens/NowPlayingScreen";
import SearchScreen from "./screens/SearchScreen";
import QueueScreen from "./screens/QueueScreen";
import LyricsScreen from "./screens/LyricsScreen";
import AboutScreen from "./screens/AboutScreen";
import ArtistDetailScreen from "./screens/ArtistDetailScreen";
import AlbumDetailScreen from "./screens/AlbumDetailScreen";
import PlaylistDetailScreen from "./screens/PlaylistDetailScreen";
import { useTheme } from "./theme";

type LibraryTab = "artists" | "albums" | "playlists" | "storage";
type PluginsTab = "store" | "installed";

function notifyEmptyLibrary() {
  Alert.alert(
    "Nothing to play yet",
    "Scan your device for music in Library → On device, or search for something to play (YouTube, if you've enabled that plugin)."
  );
}

function routeKeyOf(current: Route | null, activeTab: Tab): string {
  if (!current) return `tab:${activeTab}`;
  if ("id" in current) return `${current.screen}:${current.id}`;
  return current.screen;
}

function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [libraryTab, setLibraryTab] = useState<LibraryTab>("artists");
  const [pluginsTab, setPluginsTab] = useState<PluginsTab>("store");

  const { colors, isDark } = useTheme();
  const { stack, current, push, pop, reset } = useAppNavigation();
  const { currentTrack, playQueue } = usePlayer();
  const { allTracks } = useLibrary();

  const [direction, setDirection] = useState<1 | -1>(1);
  const prevStackLen = useRef(stack.length);
  useEffect(() => {
    setDirection(stack.length >= prevStackLen.current ? 1 : -1);
    prevStackLen.current = stack.length;
  }, [stack.length]);

  useEffect(() => {
    const onBackPress = () => {
      if (current) {
        pop();
        return true;
      }
      if (activeTab !== "home") {
        setActiveTab("home");
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [current, pop, activeTab]);

  function handleTabChange(tab: Tab) {
    setDirection(1);
    setActiveTab(tab);
    reset();
  }

  function handleHomeNav(dest: HomeNav) {
    if (dest === "artists" || dest === "albums" || dest === "playlists") {
      setActiveTab("library");
      setLibraryTab(dest);
      reset();
    } else if (dest === "plugins") {
      setActiveTab("plugins");
      setPluginsTab("store");
      reset();
    } else if (dest === "now-playing") {
      if (currentTrack) {
        push({ screen: "now-playing" });
      } else if (allTracks.length > 0) {
        playQueue(allTracks, 0);
        push({ screen: "now-playing" });
      } else {
        notifyEmptyLibrary();
      }
    } else if (dest === "shuffle-all") {
      if (allTracks.length > 0) {
        playQueue(allTracks, 0, { shuffle: true });
        push({ screen: "now-playing" });
      } else {
        notifyEmptyLibrary();
      }
    } else {
      push({ screen: dest });
    }
  }

  function goToArtist(id: string) {
    push({ screen: "artist", id });
  }
  function goToAlbum(id: string) {
    push({ screen: "album", id });
  }
  function goToPlaylist(id: string) {
    push({ screen: "playlist", id });
  }

  const isNowPlaying = current?.screen === "now-playing";
  const isHomeRoot = !current && activeTab === "home";

  return (
    <SafeAreaView style={[styles.appShell, { backgroundColor: colors.bg }]} edges={["top", "bottom"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.bg} />

      {isHomeRoot && <HomeTopBar onSearch={() => push({ screen: "search" })} />}

      <View style={{ flex: 1 }}>
        <ScreenTransition routeKey={routeKeyOf(current, activeTab)} direction={direction}>
          {current?.screen === "search" && <SearchScreen onBack={pop} onGoToArtist={goToArtist} onGoToAlbum={goToAlbum} onGoToPlaylist={goToPlaylist} />}
          {current?.screen === "queue" && <QueueScreen onBack={pop} />}
          {current?.screen === "preferences" && <PreferencesScreen />}
          {current?.screen === "whats-new" && <WhatsNewScreen />}
          {current?.screen === "logs" && <LogsScreen />}
          {current?.screen === "lyrics" && <LyricsScreen onBack={pop} />}
          {current?.screen === "about" && <AboutScreen />}
          {current?.screen === "artist" && <ArtistDetailScreen artistId={current.id} onGoToAlbum={goToAlbum} />}
          {current?.screen === "album" && <AlbumDetailScreen albumId={current.id} onGoToArtist={goToArtist} />}
          {current?.screen === "playlist" && <PlaylistDetailScreen playlistId={current.id} onGoToArtist={goToArtist} onGoToAlbum={goToAlbum} />}

          {!current && activeTab === "home" && <HomeScreen onNavigate={handleHomeNav} />}
          {!current && activeTab === "library" && (
            <LibraryScreen key={libraryTab} initialTab={libraryTab} onGoToArtist={goToArtist} onGoToAlbum={goToAlbum} onGoToPlaylist={goToPlaylist} />
          )}
          {!current && activeTab === "plugins" && <PluginsScreen key={pluginsTab} initialTab={pluginsTab} />}
        </ScreenTransition>
      </View>

      <MiniPlayer onTap={() => push({ screen: "now-playing" })} onQueue={() => push({ screen: "queue" })} />

      <BottomNavigation active={activeTab} onTabChange={handleTabChange} />

      {/* Rendered as a draggable overlay so it can grow up from the mini player
          and be dragged back down to dismiss. Presented via Modal (its own
          native layer), which needs its own SafeAreaView. */}
      <NowPlayingSheet open={isNowPlaying} onDismiss={pop}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top", "bottom"]}>
          <NowPlayingScreen onBack={pop} onQueue={() => push({ screen: "queue" })} onLyrics={() => push({ screen: "lyrics" })} />
        </SafeAreaView>
      </NowPlayingSheet>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <NavigationProvider>
        <AppShell />
      </NavigationProvider>
    </PlayerProvider>
  );
}

const styles = StyleSheet.create({
  appShell: { flex: 1 },
});
