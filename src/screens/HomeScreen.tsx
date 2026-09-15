import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { MOCK_PLAYLISTS, MOCK_TRACKS } from '../data';
import { NeoTag } from '../components';
import { TrackRow } from '../widgets/TrackRow';
import { usePlayer } from '../player/PlayerContext';

export const HomeScreen: React.FC = () => {
  const { colors, styles: globalStyles } = useTheme();
  const { playTrack, currentTrack } = usePlayer();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={[globalStyles.title, styles.greeting]}>GOOD MORNING, PUNK!</Text>
      
      <View style={styles.section}>
        <Text style={[globalStyles.subtitle, styles.sectionTitle]}>TOP PLAYLISTS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {MOCK_PLAYLISTS.map(playlist => (
            <TouchableOpacity 
              key={playlist.id} 
              activeOpacity={0.8} 
              style={[
                styles.playlistCard, 
                { backgroundColor: playlist.color, borderColor: colors.border, shadowColor: colors.border }
              ]}
            >
              <Text style={[styles.playlistTitle, { color: colors.text }]}>{playlist.title}</Text>
              <NeoTag label={`${playlist.trackCount} TRACKS`} color={colors.card} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={[globalStyles.subtitle, styles.sectionTitle]}>JUMP BACK IN</Text>
        {MOCK_TRACKS.map((track, index) => (
          <TrackRow
            key={track.id}
            track={track}
            index={index}
            isPlaying={currentTrack?.id === track.id}
            onPress={() => playTrack(track, MOCK_TRACKS)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  greeting: {
    marginBottom: 24,
    fontSize: 28,
    lineHeight: 34,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '900',
  },
  horizontalList: {
    paddingBottom: 8,
    gap: 16,
  },
  playlistCard: {
    width: 160,
    height: 160,
    borderWidth: 3,
    borderRadius: 8,
    padding: 16,
    justifyContent: 'space-between',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginRight: 16,
  },
  playlistTitle: {
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
  }
});
