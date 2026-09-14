import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, ViewStyle, Pressable, PressableProps } from "react-native";

/**
 * FluidSwitcher cross-fades + slides between whatever child is passed in,
 * keyed by `screenKey`. Used for every top-level screen/tab/modal change so
 * navigation always feels like a continuous motion instead of a hard cut.
 */
export function FluidSwitcher({
  screenKey,
  children,
  direction = "forward",
  style,
}: {
  screenKey: string;
  children: ReactNode;
  direction?: "forward" | "back";
  style?: ViewStyle;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const [displayed, setDisplayed] = useState<{ key: string; node: ReactNode }>({
    key: screenKey,
    node: children,
  });
  const prevKey = useRef(screenKey);

  useEffect(() => {
    if (prevKey.current === screenKey) {
      // Same screen, content updated in place — no transition needed.
      setDisplayed({ key: screenKey, node: children });
      return;
    }
    prevKey.current = screenKey;
    progress.setValue(0);
    setDisplayed({ key: screenKey, node: children });
    Animated.timing(progress, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenKey]);

  const sign = direction === "back" ? -1 : 1;
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [sign * 24, 0],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      key={displayed.key}
      style={[{ flex: 1, opacity, transform: [{ translateX }] }, style]}
    >
      {displayed.node}
    </Animated.View>
  );
}

/**
 * FadeSlideIn plays a single fade+rise-in entrance the first time it mounts.
 * Pass `delay` to stagger a list of these (e.g. bento cards on Home).
 */
export function FadeSlideIn({
  children,
  delay = 0,
  distance = 14,
  style,
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  style?: any;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: 340,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] });

  return (
    <Animated.View style={[{ opacity: progress, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

/**
 * AnimatedPressable gives every tappable surface the same soft, springy
 * scale-down-on-press feedback so touch always feels immediate and fluid.
 */
export function AnimatedPressable({
  children,
  style,
  onPressIn,
  onPressOut,
  scaleTo = 0.96,
  ...rest
}: Omit<PressableProps, "children"> & { children?: ReactNode; style?: any; scaleTo?: number }) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn(e: any) {
    Animated.spring(scale, {
      toValue: scaleTo,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
    onPressIn?.(e);
  }
  function handlePressOut(e: any) {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
    onPressOut?.(e);
  }

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} {...rest}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

/** Simple fade-in wrapper for content that just needs to appear smoothly (no offset). */
export function FadeIn({
  children,
  style,
  visible = true,
  duration = 220,
}: {
  children: ReactNode;
  style?: any;
  visible?: boolean;
  duration?: number;
}) {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [visible]);
  return <Animated.View style={[style, { opacity }]}>{children}</Animated.View>;
}

export const styles = StyleSheet.create({});
