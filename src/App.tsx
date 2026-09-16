import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, StatusBar, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopBar, BottomNavigation, MiniPlayer, Tab } from "./components";
import { ActionSheet } from "./widgets/ActionSheet";
import { ScreenTransition } from "./widgets/ScreenTransition";
import { PlayerProvider, usePlayer } from "./player/PlayerContext";
import { NavigationProvider, useAppNavigation, Route } from "./navigation/NavigationContext";
import { ARTISTS, ALBUMS, PLAYLISTS, TRACKS } from "./data";
import HomeScreen, { HomeNav } from "./screens/HomeScreen";
import LibraryScreen from "./screens/LibraryScreen";
import PluginsScreen from "./screens/PluginsScreen";
import PreferencesScreen from "./screens/PreferencesScreen";
import WhatsNewScreen from "./screens/WhatsNewScreen";
import LogsScreen from "./screens/LogsScreen";
import NowPlayingScreen from "./screens/NowPlayingScreen";
import SearchScreen from "./screens/SearchScreen";
import QueueScreen from "./screens/QueueScreen";
import ArtistDetailScreen from "./screens/ArtistDetailScreen";
import AlbumDetailScreen from "./screens/AlbumDetailScreen";
import PlaylistDetailScreen from "./screens/PlaylistDetailScreen";
import { NowPlayingSheet } from "./widgets/NowPlayingSheet";
import { PreferencesIcon, WhatsNewIcon, LogsIcon } from "./icons";
import { useTheme } from "./theme";

type LibraryTab = "artists" | "albums" | "playlists";
type PluginsTab = "store" | "installed";

function routeTitle(route: Route): string {
  switch (route.screen) {
    case "preferences":
      return "Preferences";
    case "whats-new":
      return "What's New";
    case "logs":
      return "Logs";
    case "queue":
      return "Queue";
    case "artist":
      return ARTISTS.find((a) => a.id === route.id)?.name ?? "Artist";
    case "album":
      return ALBUMS.find((a) => a.id === route.id)?.title ?? "Album";
    case "playlist":
      return PLAYLISTS.find((p) => p.id === route.id)?.name ?? "Playlist";
    default:
      return "nukeop";
  }
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
  const [menuOpen, setMenuOpen] = useState(false);

  const { colors, isDark } = useTheme();
  const { stack, current, push, pop, reset } = useAppNavigation();
  const { currentTrack, playQueue } = usePlayer();

  // Tracks whether the most recent navigation change was a "forward" (push /
  // tab change) or "backward" (pop) move, so the slide transition can enter
  // from the correct side — the same way a native stack navigator would.
  const [direction, setDirection] = useState<1 | -1>(1);
  const prevStackLen = useRef(stack.length);
  useEffect(() => {
    setDirection(stack.length >= prevStackLen.current ? 1 : -1);
    prevStackLen.current = stack.length;
  }, [stack.length]);

  // Android hardware back button: pop the in-app navigation stack instead of
  // exiting the app. Only let the system handle back (i.e. exit / background
  // the app) when there's nowhere left for us to go.
  useEffect(() => {
    const onBackPress = () => {
      if (current) {
        pop();
        return true; // we handled it — don't let the app quit
      }
      if (activeTab !== "home") {
        setActiveTab("home");
        return true;
      }
      return false; // at the root of the app — let the OS handle it (exit/background)
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
    if (dest === "artists") {
      setActiveTab("library");
      setLibraryTab("artists");
      reset();
    } else if (dest === "albums") {
      setActiveTab("library");
      setLibraryTab("albums");
      reset();
    } else if (dest === "playlists") {
      setActiveTab("library");
      setLibraryTab("playlists");
      reset();
    } else if (dest === "plugins") {
      setActiveTab("plugins");
      setPluginsTab("store");
      reset();
    } else if (dest === "now-playing") {
      if (!currentTrack) playQueue(TRACKS, 0);
      push({ screen: "now-playing" });
    } else {
      push({ screen: dest });
    }
  }

  const isNowPlaying = current?.screen === "now-playing";
  const isSearch = current?.screen === "search";
  const isQueue = current?.screen === "queue";
  const showOwnChrome = isNowPlaying || isSearch || isQueue;

  return (
    <SafeAreaView style={[styles.appShell, { backgroundColor: colors.ground }]} edges={["top", "bottom"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.ground} />

      {!showOwnChrome && (
        <TopBar
          title={current ? routeTitle(current) : "nukeop"}
          onBack={current ? pop : undefined}
          onMenu={current ? undefined : () => setMenuOpen(true)}
          onSearch={current ? undefined : () => push({ screen: "search" })}
        />
      )}

      <View style={{ flex: 1 }}>
        <ScreenTransition routeKey={routeKeyOf(current, activeTab)} direction={direction}>
          {current?.screen === "search" && <SearchScreen onBack={pop} />}
          {current?.screen === "queue" && <QueueScreen onBack={pop} />}
          {current?.screen === "preferences" && <PreferencesScreen />}
          {current?.screen === "whats-new" && <WhatsNewScreen />}
          {current?.screen === "logs" && <LogsScreen />}
          {current?.screen === "artist" && <ArtistDetailScreen artistId={current.id} />}
          {current?.screen === "album" && <AlbumDetailScreen albumId={current.id} />}
          {current?.screen === "playlist" && <PlaylistDetailScreen playlistId={current.id} />}

          {!current && activeTab === "home" && <HomeScreen onNavigate={handleHomeNav} />}
          {!current && activeTab === "library" && (
            <LibraryScreen key={libraryTab} initialTab={libraryTab} />
          )}
          {!current && activeTab === "plugins" && (
            <PluginsScreen key={pluginsTab} initialTab={pluginsTab} />
          )}
        </ScreenTransition>
      </View>

      <MiniPlayer onTap={() => push({ screen: "now-playing" })} onQueue={() => push({ screen: "queue" })} />

      <BottomNavigation active={activeTab} onTabChange={handleTabChange} />

      {/* Rendered as a draggable overlay (not part of the normal stack
          transition) so it can grow up from the mini player on open, and be
          dragged back down — revealing the mini player underneath — to
          dismiss, instead of an instant swap. It's presented via a Modal
          (its own native layer), which does NOT automatically inherit the
          outer SafeAreaView's insets — so it needs its own. */}
      <NowPlayingSheet open={isNowPlaying} onDismiss={pop}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.ground }} edges={["top", "bottom"]}>
          <NowPlayingScreen onBack={pop} onQueue={() => push({ screen: "queue" })} />
        </SafeAreaView>
      </NowPlayingSheet>

      <ActionSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Quick actions"
        options={[
          {
            label: "Preferences",
            icon: <PreferencesIcon size={18} color={colors.ink} />,
            onPress: () => push({ screen: "preferences" }),
          },
          {
            label: "What's new",
            icon: <WhatsNewIcon size={18} color={colors.ink} />,
            onPress: () => push({ screen: "whats-new" }),
          },
          {
            label: "Logs",
            icon: <LogsIcon size={18} color={colors.ink} />,
            onPress: () => push({ screen: "logs" }),
          },
        ]}
      />
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
  appShell: {
    flex: 1,
  },
});
