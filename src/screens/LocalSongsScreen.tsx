import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { useAppNavigation } from '../navigation/NavigationContext';
import { usePlayer } from '../player/PlayerContext';
import { TrackRow } from '../widgets/TrackRow';

const MOCK_LOCAL = [
  { id: 'loc-1', title: 'Downloaded Mix 1', artist: 'Various', album: 'Local', duration: '5:42' },
  { id: 'loc-2', title: 'Voice Memo 4', artist: 'Me', album: 'Local', duration: '1:15' },
  { id: 'loc-3', title: 'Offline Beat', artist: 'Producer XYZ', album: 'Local', duration: '2:58' },
];

export const LocalSongsScreen: React.FC = () => {
  const { colors, styles: globalStyles } = useTheme();
  const { goBack } = useAppNavigation();
  const { currentTrack, playTrack } = usePlayer();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={goBack}>
          <Text style={[styles.backBtnText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[globalStyles.title, styles.headerTitle]}>LOCAL AUDIO</Text>
      </View>

      <FlatList
        data={MOCK_LOCAL}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <TrackRow
            track={item}
            index={index}
            isPlaying={currentTrack?.id === item.id}
            onPress={() => playTrack(item, MOCK_LOCAL)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 24, borderBottomWidth: 3, gap: 16 },
  headerTitle: { marginBottom: 0 },
  backBtn: { width: 44, height: 44, borderWidth: 3, borderRadius: 8, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 },
  backBtnText: { fontSize: 20, fontWeight: '900' },
  list: { paddingVertical: 12 },
});
