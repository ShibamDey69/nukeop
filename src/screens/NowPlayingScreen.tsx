import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '../theme';
import { usePlayer } from '../player/PlayerContext';
import { useAppNavigation } from '../navigation/NavigationContext';
import { QueueSheet } from '../widgets/QueueSheet';
import { PlayIcon, PauseIcon, SkipNextIcon, SkipPrevIcon, LibraryIcon } from '../icons';

export const NowPlayingScreen: React.FC = () => {
  const { colors, styles: globalStyles } = useTheme();
  const { currentTrack, isPlaying, togglePlayPause, skipNext, skipPrevious } = usePlayer();
  const { goBack } = useAppNavigation();
  const [queueVisible, setQueueVisible] = useState(false);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.navBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={goBack}>
          <Text style={[styles.navBtnText, { color: colors.text }]}>↓</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>NOW PLAYING</Text>
        <TouchableOpacity style={[styles.navBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => setQueueVisible(true)}>
          <LibraryIcon size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.albumArt, { backgroundColor: colors.primary, borderColor: colors.border, shadowColor: colors.border }]}>
          <Text style={styles.albumArtText}>🎵</Text>
        </View>

        <View style={styles.metaContainer}>
          <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>
            {currentTrack ? currentTrack.title : 'NO TRACK SELECTED'}
          </Text>
          <Text numberOfLines={1} style={[styles.artist, { color: colors.textMuted }]}>
            {currentTrack ? currentTrack.artist : 'Pick a song to start'}
          </Text>
        </View>

        <View style={styles.progressBarWrapper}>
          <View style={[styles.progressBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.accent, width: isPlaying ? '45%' : '0%' }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={[styles.timeText, { color: colors.text }]}>01:24</Text>
            <Text style={[styles.timeText, { color: colors.text }]}>{currentTrack?.duration || '00:00'}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={[styles.controlBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={skipPrevious}>
            <SkipPrevIcon size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mainControlBtn, { borderColor: colors.border, backgroundColor: colors.secondary, shadowColor: colors.border }]}
            onPress={togglePlayPause}
          >
            {isPlaying ? <PauseIcon size={32} color={colors.text} /> : <PlayIcon size={32} color={colors.text} />}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={skipNext}>
            <SkipNextIcon size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <QueueSheet visible={queueVisible} onClose={() => setQueueVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 3 },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  navBtn: { width: 44, height: 44, borderWidth: 3, borderRadius: 8, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 },
  navBtnText: { fontSize: 24, fontWeight: '900', lineHeight: 28 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 24, paddingVertical: 20 },
  albumArt: { width: 280, height: 280, borderWidth: 4, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 1, shadowRadius: 0, elevation: 6 },
  albumArtText: { fontSize: 80 },
  metaContainer: { alignItems: 'center', width: '100%' },
  title: { fontSize: 26, fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', marginBottom: 4 },
  artist: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  progressBarWrapper: { width: '100%' },
  progressBar: { height: 16, borderWidth: 3, borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRightWidth: 3, borderColor: '#121212' },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  timeText: { fontSize: 14, fontWeight: '900' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 24 },
  controlBtn: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 },
  mainControlBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
});
