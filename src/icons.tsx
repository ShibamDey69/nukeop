import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { NeubrutalColors } from './theme';

interface IconProps {
  size?: number;
  color?: string;
}

export const PlayIcon: React.FC<IconProps> = ({ size = 24, color = NeubrutalColors.text }) => (
  <Text style={[styles.iconText, { fontSize: size, color }]}>▶</Text>
);

export const PauseIcon: React.FC<IconProps> = ({ size = 24, color = NeubrutalColors.text }) => (
  <Text style={[styles.iconText, { fontSize: size, color, letterSpacing: -2 }]}>❚❚</Text>
);

export const SkipNextIcon: React.FC<IconProps> = ({ size = 24, color = NeubrutalColors.text }) => (
  <Text style={[styles.iconText, { fontSize: size, color }]}>⏭</Text>
);

export const SkipPrevIcon: React.FC<IconProps> = ({ size = 24, color = NeubrutalColors.text }) => (
  <Text style={[styles.iconText, { fontSize: size, color }]}>⏮</Text>
);

export const HomeIcon: React.FC<IconProps> = ({ size = 24, color = NeubrutalColors.text }) => (
  <Text style={[styles.iconText, { fontSize: size, color }]}>⌂</Text>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 24, color = NeubrutalColors.text }) => (
  <Text style={[styles.iconText, { fontSize: size, color }]}>⚲</Text>
);

export const LibraryIcon: React.FC<IconProps> = ({ size = 24, color = NeubrutalColors.text }) => (
  <Text style={[styles.iconText, { fontSize: size, color }]}>☰</Text>
);

export const MoreIcon: React.FC<IconProps> = ({ size = 24, color = NeubrutalColors.text }) => (
  <Text style={[styles.iconText, { fontSize: size, color, letterSpacing: -1 }]}>•••</Text>
);

const styles = StyleSheet.create({
  iconText: {
    fontWeight: '900',
    textAlign: 'center',
    includeFontPadding: false,
  }
});
