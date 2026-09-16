import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, StyleSheet } from "react-native";
import { useTheme, fonts, ThemeColors } from "../theme";

interface MusicLoadingIndicatorProps {
  label?: string;
}

/**
 * A small looping "equalizer bars" animation — four bars bouncing out of
 * phase with each other, like a playing track indicator. Used anywhere we
 * need to say "we're actively working on your music" (scanning, buffering).
 */
export function MusicLoadingIndicator({ label }: MusicLoadingIndicatorProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const bars = useRef([0, 1, 2, 3].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const loops = bars.map((bar, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 110),
          Animated.timing(bar, {
            toValue: 1,
            duration: 340,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(bar, {
            toValue: 0.25,
            duration: 340,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.wrap}>
      <View style={styles.barsRow}>
        {bars.map((bar, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                backgroundColor: colors.accent,
                height: bar.interpolate({ inputRange: [0, 1], outputRange: [6, 22] }),
              },
            ]}
          />
        ))}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: { alignItems: "center", justifyContent: "center", paddingVertical: 20, gap: 10 },
    barsRow: { flexDirection: "row", alignItems: "flex-end", gap: 5, height: 24 },
    bar: { width: 5, borderRadius: 2 },
    label: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.muted },
  });
}
