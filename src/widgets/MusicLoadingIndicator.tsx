import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform, Text, View } from "react-native";
import { fonts, radius, stroke, ThemeContextValue, useThemedStyles } from "../theme";

interface MusicLoadingIndicatorProps {
  label?: string;
}

export function MusicLoadingIndicator({ label }: MusicLoadingIndicatorProps) {
  const s = useThemedStyles(makeStyles);
  const bars = useRef([0, 1, 2, 3].map(() => new Animated.Value(0.3))).current;
  const native = Platform.OS !== "web";

  useEffect(() => {
    const loops = bars.map((bar, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 110),
          Animated.timing(bar, { toValue: 1, duration: 340, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
          Animated.timing(bar, { toValue: 0.25, duration: 340, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={s.wrap}>
      <View style={s.barsRow}>
        {bars.map((bar, i) => (
          <Animated.View key={i} style={[s.bar, { transform: [{ scaleY: bar }] }]} />
        ))}
      </View>
      {label ? <Text style={s.label}>{label}</Text> : null}
    </View>
  );
}

const makeStyles = ({ colors }: ThemeContextValue) => ({
  wrap: { alignItems: "center" as const, justifyContent: "center" as const, paddingVertical: 28, gap: 12 },
  barsRow: { flexDirection: "row" as const, alignItems: "flex-end" as const, gap: 6, height: 26 },
  bar: { width: 6, height: 26, borderRadius: radius.sm, borderWidth: stroke.thin, borderColor: colors.outline, backgroundColor: colors.accent },
  label: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.muted },
});
