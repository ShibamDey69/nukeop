import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  ViewStyle,
  Pressable,
  PressableProps,
  Dimensions,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * SlidingScreen gives navigation screens smooth, flowing sliding transitions.
 * - 'horizontal': slides in from the right edge with a soft, flowing decelerating curve.
 * - 'vertical': slides in from the bottom edge (ideal for Now Playing screen).
 */
export function SlidingScreen({
  children,
  variant = "horizontal",
  style,
}: {
  children: ReactNode;
  variant?: "horizontal" | "vertical";
  style?: ViewStyle;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 290,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: true,
    }).start();
  }, [anim]);

  const translateX =
    variant === "horizontal"
      ? anim.interpolate({
          inputRange: [0, 1],
          outputRange: [SCREEN_WIDTH * 0.9, 0],
        })
      : 0;

  const translateY =
    variant === "vertical"
      ? anim.interpolate({
          inputRange: [0, 1],
          outputRange: [SCREEN_HEIGHT * 0.85, 0],
        })
      : 0;

  const opacity = anim.interpolate({
    inputRange: [0, 0.1, 1],
    outputRange: [0, 0.8, 1],
  });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        {
          opacity,
          transform: [{ translateX }, { translateY }],
          backgroundColor: "#FCEBED",
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * FluidSwitcher cross-fades + slides between whatever child is passed in,
 * keyed by `screenKey`. Used for tab changes so navigation feels like a
 * continuous, flowing motion instead of a hard cut.
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
      setDisplayed({ key: screenKey, node: children });
      return;
    }
    prevKey.current = screenKey;
    progress.setValue(0);
    setDisplayed({ key: screenKey, node: children });
    Animated.timing(progress, {
      toValue: 1,
      duration: 260,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenKey]);

  const sign = direction === "back" ? -1 : 1;
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [sign * 50, 0],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0.7, 1],
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
 * FadeSlideIn plays a single smooth slide-and-rise entrance with flowing bezier easing.
 */
export function FadeSlideIn({
  children,
  delay = 0,
  distance = 20,
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
      duration: 320,
      delay,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] });
  const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

/**
 * AnimatedPressable gives tappable surfaces a soft, springy scale-down feedback.
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

/** Simple fade-in wrapper for content that just needs to appear smoothly. */
export function FadeIn({
  children,
  style,
  visible = true,
  duration = 240,
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
  }, [visible, duration, opacity]);
  return <Animated.View style={[style, { opacity }]}>{children}</Animated.View>;
}

export const styles = StyleSheet.create({});
