import React, { createContext, useContext, useMemo } from 'react';
import { StyleSheet } from 'react-native';

export const NeubrutalColors = {
  bg: '#FFFDF6',         // Off-white background
  card: '#FFFFFF',       // Pure white for cards
  border: '#121212',     // Pitch black for thick borders
  primary: '#FFE600',    // Electric Yellow
  accent: '#FF5C8A',     // Hot Pink
  secondary: '#38E54D',  // High-vis Mint Green
  surface: '#2192FF',    // Vivid Cyan
  text: '#121212',
  textMuted: '#5E5E5E',
  danger: '#FF3333',
};

export const NeubrutalStyles = StyleSheet.create({
  card: {
    backgroundColor: NeubrutalColors.card,
    borderWidth: 3,
    borderColor: NeubrutalColors.border,
    borderRadius: 8,
    shadowColor: NeubrutalColors.border,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5, // For Android
    padding: 16,
  },
  button: {
    backgroundColor: NeubrutalColors.primary,
    borderWidth: 3,
    borderColor: NeubrutalColors.border,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: NeubrutalColors.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  buttonText: {
    color: NeubrutalColors.text,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 16,
  },
  input: {
    backgroundColor: NeubrutalColors.card,
    borderWidth: 3,
    borderColor: NeubrutalColors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    fontWeight: '700',
    color: NeubrutalColors.text,
    shadowColor: NeubrutalColors.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: NeubrutalColors.text,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: NeubrutalColors.textMuted,
  }
});

interface ThemeContextType {
  colors: typeof NeubrutalColors;
  styles: typeof NeubrutalStyles;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: NeubrutalColors,
  styles: NeubrutalStyles,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useMemo(() => ({ colors: NeubrutalColors, styles: NeubrutalStyles }), []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
