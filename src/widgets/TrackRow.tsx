import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { Track } from '../data';
import { MoreIcon } from '../icons';

interface TrackRowProps {
  track: Track;
  index: number;
  isPlaying?: boolean;
  onPress: () => void;
  onOptionsPress?: () => void;
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, index, isPlaying = false, onPress, onOptionsPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        { 
          backgroundColor: isPlaying ? colors.primary : colors.card, 
          borderColor: colors.border,
          shadowColor: colors.border 
        }
      ]}
    >
      <View style={[styles.indexContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.indexText, { color: colors.text }]}>{(index + 1).toString().padStart(2, '0')}</Text>
      </View>

      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>
          {track.title}
        </Text>
        <Text numberOfLines={1} style={[styles.artist, { color: colors.textMuted }]}>
          {track.artist}
        </Text>
      </View>

      <Text style={[styles.duration, { color: colors.text }]}>{track.duration}</Text>

      {onOptionsPress && (
        <TouchableOpacity 
          onPress={onOptionsPress} 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} 
          style={styles.moreButton}
        >
          <MoreIcon color={colors.text} size={20} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  indexContainer: {
    width: 36,
    height: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderRadius: 6,
  },
  indexText: {
    fontSize: 14,
    fontWeight: '900',
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  artist: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  duration: {
    fontSize: 14,
    fontWeight: '800',
    marginRight: 10,
  },
  moreButton: {
    padding: 4,
    marginLeft: 6,
  },
});
