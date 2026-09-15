import React, { useState } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopBar, BottomNavigation, MiniPlayer, Tab } from "./components";
import { ActionSheet } from "./widgets/ActionSheet";
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
import ArtistDetailScreen from "./screens/ArtistDetailScreen";
import AlbumDetailScreen from "./screens/AlbumDetailScreen";
import PlaylistDetailScreen from "./screens/PlaylistDetailScreen";
import { PreferencesIcon, WhatsNewIcon, LogsIcon } from "./icons";
import { colors } from "./theme";

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

function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [libraryTab, setLibraryTab] = useState<LibraryTab>("artists");
  const [pluginsTab, setPluginsTab] = useState<PluginsTab>("store");
  const [menuOpen, setMenuOpen] = useState(false);

  const { current, push, pop, reset } = useAppNavigation();
  const { currentTrack, playQueue } = usePlayer();

  function handleTabChange(tab: Tab) {
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
  const showOwnChrome = isNowPlaying || isSearch;

  return (
    <SafeAreaView style={styles.appShell} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.ground} />

      {!showOwnChrome && (
        <TopBar
          title={current ? routeTitle(current) : "nukeop"}
          onBack={current ? pop : undefined}
          onMenu={current ? undefined : () => setMenuOpen(true)}
          onSearch={current ? undefined : () => push({ screen: "search" })}
        />
      )}

      <View style={{ flex: 1 }}>
        {current?.screen === "now-playing" && <NowPlayingScreen onBack={pop} />}
        {current?.screen === "search" && <SearchScreen onBack={pop} />}
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
      </View>

      {!isNowPlaying && <MiniPlayer onTap={() => push({ screen: "now-playing" })} />}

      {!isNowPlaying && <BottomNavigation active={activeTab} onTabChange={handleTabChange} />}

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
    backgroundColor: colors.ground,
  },
});
