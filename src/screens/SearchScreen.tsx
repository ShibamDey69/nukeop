import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { NeoInput, NeoTag } from '../components';
import { MOCK_RECENT_SEARCHES, MOCK_TRACKS } from '../data';
import { TrackRow } from '../widgets/TrackRow';
import { usePlayer } from '../player/PlayerContext';

export const SearchScreen: React.FC = () => {
  const { colors, styles: globalStyles } = useTheme();
  const { playTrack, currentTrack } = usePlayer();
  const [query, setQuery] = useState('');

  const filteredTracks = query.length > 0 
    ? MOCK_TRACKS.filter(t => t.title.toLowerCase().includes(query.toLowerCase()) || t.artist.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[globalStyles.title, styles.title]}>SEARCH</Text>
        <NeoInput 
          placeholder="Artists, songs, or podcasts..." 
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {query.length === 0 ? (
          <View style={styles.recentSection}>
            <Text style={[globalStyles.subtitle, styles.sectionTitle]}>RECENT SEARCHES</Text>
            <View style={styles.tagCloud}>
              {MOCK_RECENT_SEARCHES.map((search, i) => (
                <TouchableOpacity key={i} onPress={() => setQuery(search)}>
                  <NeoTag label={search} color={colors.accent} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.resultsSection}>
            <Text style={[globalStyles.subtitle, styles.sectionTitle]}>TOP RESULTS</Text>
            {filteredTracks.length > 0 ? (
              filteredTracks.map((track, index) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={index}
                  isPlaying={currentTrack?.id === track.id}
                  onPress={() => playTrack(track, filteredTracks)}
                />
              ))
            ) : (
              <Text style={[globalStyles.subtitle, styles.noResults]}>No results found for "{query}".</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 24, paddingBottom: 16 },
  title: { marginBottom: 16 },
  searchInput: { marginBottom: 8 },
  content: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  recentSection: { marginBottom: 32 },
  sectionTitle: { marginBottom: 16, fontWeight: '900' },
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  resultsSection: { marginBottom: 32 },
  noResults: { marginTop: 20, textAlign: 'center' },
});
