import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Animated, DimensionValue, Easing, Image, Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { HeartIcon, MusicNoteIcon, PlaylistIcon } from "../icons";
import { radius as radii, stroke, useTheme } from "../theme";
import { tintFor } from "../color";
import { Gradient } from "./Gradient";

interface ArtworkProps {
  uri?: string;
  /** Seeds the placeholder gradient so every album/playlist gets its own colours. */
  seed: string;
  /** Fixed square size. Omit to fill the parent's width as a square. */
  size?: number;
  radius?: number;
  circle?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  /** Set false for tiles inside a mosaic, where each one having its own thick outline would look noisy. */
  bordered?: boolean;
}

export function Artwork({ uri, seed, size, radius = radii.md, circle, icon, style, children, bordered = true }: ArtworkProps) {
  const { isDark, colors } = useTheme();
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);

  const [a, b] = tintFor(seed, isDark);
  const dims: { width: DimensionValue; height?: number; aspectRatio?: number } = size
    ? { width: size, height: size }
    : { width: "100%", aspectRatio: 1 };

  return (
    <View
      style={[
        {
          overflow: "hidden",
          borderRadius: circle ? 9999 : radius,
          backgroundColor: colors.surfaceAlt,
          borderWidth: bordered ? stroke.base : 0,
          borderColor: colors.outline,
        },
        dims,
        style,
      ]}
    >
      <Gradient stops={[{ color: a }, { color: b }]} direction="diagonal" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        {icon ?? <MusicNoteIcon size={size ? Math.max(14, size * 0.38) : 40} color="rgba(255,255,255,0.88)" strokeWidth={1.8} />}
      </View>
      {uri && !failed ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setFailed(true)} />
      ) : null}
      {children}
    </View>
  );
}

interface PlaylistCoverProps {
  images: string[];
  seed: string;
  size?: number;
  radius?: number;
  kind?: "playlist" | "liked";
  style?: StyleProp<ViewStyle>;
}

/** 2×2 mosaic for playlists with several distinct covers, single cover otherwise. */
export function PlaylistCover({ images, seed, size, radius = radii.md, kind = "playlist", style }: PlaylistCoverProps) {
  const { colors, isDark } = useTheme();
  const dims: { width: DimensionValue; height?: number; aspectRatio?: number } = size
    ? { width: size, height: size }
    : { width: "100%", aspectRatio: 1 };

  if (kind === "liked") {
    return (
      <Gradient
        direction="diagonal"
        stops={[{ color: isDark ? "#7C3AED" : "#9146FF" }, { color: isDark ? "#DB2777" : "#FF2D78" }]}
        style={[
          {
            overflow: "hidden",
            borderRadius: radius,
            borderWidth: stroke.base,
            borderColor: colors.outline,
            alignItems: "center",
            justifyContent: "center",
          },
          dims,
          style,
        ]}
      >
        <HeartIcon size={size ? size * 0.4 : 44} color="#FFFFFF" filled strokeWidth={1.5} />
      </Gradient>
    );
  }

  const unique = Array.from(new Set(images.filter(Boolean)));
  if (unique.length >= 4) {
    return (
      <View
        style={[
          {
            overflow: "hidden",
            borderRadius: radius,
            borderWidth: stroke.base,
            borderColor: colors.outline,
            flexDirection: "row",
            flexWrap: "wrap",
            backgroundColor: colors.surfaceAlt,
          },
          dims,
          style,
        ]}
      >
        {unique.slice(0, 4).map((uri, i) => (
          <View key={uri + i} style={{ width: "50%", height: "50%" }}>
            <Artwork uri={uri} seed={`${seed}${i}`} radius={0} bordered={false} style={{ width: "100%", height: "100%", aspectRatio: undefined }} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <Artwork
      uri={unique[0]}
      seed={seed}
      size={size}
      radius={radius}
      style={style}
      icon={unique.length === 0 ? <PlaylistIcon size={size ? size * 0.4 : 40} color="rgba(255,255,255,0.9)" strokeWidth={1.8} /> : undefined}
    />
  );
}

/** Three little bars that bounce while `playing`, and rest low when paused. */
export function EqBars({ color, playing, height = 14 }: { color: string; playing: boolean; height?: number }) {
  const bars = useRef([0, 1, 2].map(() => new Animated.Value(0.35))).current;

  useEffect(() => {
    if (!playing) {
      bars.forEach((b) => b.setValue(0.35));
      return;
    }
    const native = Platform.OS !== "web";
    const loops = bars.map((bar, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 140),
          Animated.timing(bar, { toValue: 1, duration: 320 + i * 60, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
          Animated.timing(bar, { toValue: 0.3, duration: 320 + i * 60, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [playing, bars]);

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2.5, height }}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={{ width: 3, height, borderRadius: 1.5, backgroundColor: color, transform: [{ scaleY: bar }] }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
});
