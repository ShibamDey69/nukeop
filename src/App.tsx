import React from 'react';
import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { ThemeProvider, useTheme } from './theme';
import { NavigationProvider, useAppNavigation } from './navigation/NavigationContext';
import { PlayerProvider, usePlayer } from './player/PlayerContext';
import { HomeIcon, SearchIcon, LibraryIcon, PlayIcon, PauseIcon } from './icons';

// Screens
import { HomeScreen } from './screens/HomeScreen';
import { SearchScreen } from './screens/SearchScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { LocalSongsScreen } from './screens/LocalSongsScreen';
import { NowPlayingScreen } from './screens/NowPlayingScreen';

const AppShell = () => {
  const { colors } = useTheme();
  const { currentScreen, navigate } = useAppNavigation();
  const { currentTrack, isPlaying, togglePlayPause } = usePlayer();

  const isMainTab = ['Home', 'Search', 'Library'].includes(currentScreen);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home': return <HomeScreen />;
      case 'Search': return <SearchScreen />;
      case 'Library': return <LibraryScreen />;
      case 'LocalSongs': return <LocalSongsScreen />;
      case 'NowPlaying': return <NowPlayingScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      
      {/* Mini Player */}
      {currentTrack && currentScreen !== 'NowPlaying' && (
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={[styles.miniPlayer, { backgroundColor: colors.accent, borderColor: colors.border }]}
          onPress={() => navigate('NowPlaying')}
        >
          <View style={styles.miniPlayerInfo}>
            <Text numberOfLines={1} style={[styles.miniPlayerTitle, { color: colors.text }]}>{currentTrack.title}</Text>
            <Text numberOfLines={1} style={[styles.miniPlayerArtist, { color: colors.text }]}>{currentTrack.artist}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.miniPlayBtn, { backgroundColor: colors.card, borderColor: colors.border }]} 
            onPress={togglePlayPause}
          >
            {isPlaying ? <PauseIcon size={16} color={colors.text} /> : <PlayIcon size={16} color={colors.text} />}
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Bottom Navigation */}
      {isMainTab && (
        <View style={[styles.bottomNav, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigate('Home')}>
            <HomeIcon color={currentScreen === 'Home' ? colors.primary : colors.textMuted} size={28} />
            <Text style={[styles.navText, currentScreen === 'Home' && { color: colors.primary }]}>HOME</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigate('Search')}>
            <SearchIcon color={currentScreen === 'Search' ? colors.primary : colors.textMuted} size={28} />
            <Text style={[styles.navText, currentScreen === 'Search' && { color: colors.primary }]}>SEARCH</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigate('Library')}>
            <LibraryIcon color={currentScreen === 'Library' ? colors.primary : colors.textMuted} size={28} />
            <Text style={[styles.navText, currentScreen === 'Library' && { color: colors.primary }]}>LIBRARY</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default function AppRoot() {
  return (
    <ThemeProvider>
      <PlayerProvider>
        <NavigationProvider>
          <AppShell />
        </NavigationProvider>
      </PlayerProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  miniPlayer: { flexDirection: 'row', alignItems: 'center', margin: 12, padding: 12, borderWidth: 3, borderRadius: 8, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
  miniPlayerInfo: { flex: 1, marginRight: 12 },
  miniPlayerTitle: { fontSize: 16, fontWeight: '900', textTransform: 'uppercase' },
  miniPlayerArtist: { fontSize: 14, fontWeight: '700' },
  miniPlayBtn: { width: 40, height: 40, borderWidth: 2, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 3, paddingVertical: 12, paddingBottom: 20 },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 10, fontWeight: '900', marginTop: 4 },
});
