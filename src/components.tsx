import React from 'react';
import { TouchableOpacity, Text, View, TextInput, StyleSheet, TextInputProps, TouchableOpacityProps } from 'react-native';
import { useTheme } from './theme';

interface NeoButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
}

export const NeoButton: React.FC<NeoButtonProps> = ({ title, variant = 'primary', style, ...props }) => {
  const { colors, styles } = useTheme();
  
  let bgColor = colors.primary;
  if (variant === 'secondary') bgColor = colors.secondary;
  if (variant === 'accent') bgColor = colors.accent;
  if (variant === 'danger') bgColor = colors.danger;

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      style={[styles.button, { backgroundColor: bgColor }, style]} 
      {...props}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

export const NeoCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => {
  const { styles } = useTheme();
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

export const NeoInput: React.FC<TextInputProps> = ({ style, ...props }) => {
  const { colors, styles } = useTheme();
  return (
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor={colors.textMuted}
      {...props}
    />
  );
};

export const NeoTag: React.FC<{ label: string; color?: string }> = ({ label, color }) => {
  const { colors } = useTheme();
  return (
    <View style={[tagStyles.container, { backgroundColor: color || colors.surface }]}>
      <Text style={tagStyles.text}>{label}</Text>
    </View>
  );
};

const tagStyles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: '#121212',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#121212',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  text: {
    fontSize: 12,
    fontWeight: '900',
    color: '#121212',
    textTransform: 'uppercase',
  }
});
