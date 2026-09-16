import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ScreenTransitionProps {
  routeKey: string;
  direction: 1 | -1; // 1 = forward/push (slides in from the right), -1 = back/pop (slides in from the left)
  children: React.ReactNode;
}

/**
 * Wraps the active screen and animates it in with a horizontal slide + subtle
 * fade whenever `routeKey` changes, instead of the instant cut (or plain
 * fade) that a conditional render normally produces. Modeled loosely on the
 * slide-and-settle motion used by YouTube's stack transitions.
 */
export function ScreenTransition({ routeKey, direction, children }: ScreenTransitionProps) {
  const translateX = useRef(new Animated.Value(direction * SCREEN_WIDTH * 0.35)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const lastKey = useRef(routeKey);

  useEffect(() => {
    if (lastKey.current === routeKey) return;
    lastKey.current = routeKey;
    translateX.setValue(direction * SCREEN_WIDTH * 0.35);
    opacity.setValue(0.4);
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        friction: 11,
        tension: 70,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey, direction]);

  // First mount: settle in immediately without a stale offset.
  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        friction: 11,
        tension: 70,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[styles.fill, { transform: [{ translateX }], opacity }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
