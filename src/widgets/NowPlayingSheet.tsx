import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, Modal, PanResponder, StyleSheet } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// How far (or how fast) the user has to drag down before we treat it as an
// intentional dismiss rather than a little bounce back into place.
const DISMISS_DISTANCE = SCREEN_HEIGHT * 0.22;
const DISMISS_VELOCITY = 1.1;

interface NowPlayingSheetProps {
  open: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
}

/**
 * Full-screen "Now Playing" presentation. Uses React Native's built-in
 * Modal (the same primitive ActionSheet already relies on) so it is
 * guaranteed to render in its own top-level native layer above the rest of
 * the app — no manual z-index/elevation bookkeeping that can silently fail.
 * Modal's own `slide` animation handles the open/close grow-up motion, and
 * a PanResponder layered on top adds the interactive drag-down-to-dismiss
 * gesture while it's open.
 */
export function NowPlayingSheet({ open, onDismiss, children }: NowPlayingSheetProps) {
  const translateY = useRef(new Animated.Value(0)).current;

  // Always start fully in place when (re)opened, in case a previous session
  // left the drag offset mid-way through a cancelled gesture.
  useEffect(() => {
    if (open) translateY.setValue(0);
  }, [open, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      // Only claim the gesture once it's clearly a deliberate, mostly-vertical
      // downward drag — this keeps taps and the internal progress slider
      // fully responsive.
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx) * 1.5,
      onPanResponderMove: (_evt, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_evt, gesture) => {
        const shouldDismiss = gesture.dy > DISMISS_DISTANCE || gesture.vy > DISMISS_VELOCITY;
        if (shouldDismiss) {
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 220,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start(() => {
            onDismiss();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 9,
            tension: 70,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 9, tension: 70 }).start();
      },
    })
  ).current;

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onDismiss} statusBarTranslucent presentationStyle="fullScreen">
      <Animated.View {...panResponder.panHandlers} style={[styles.fill, { transform: [{ translateY }] }]}>
        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
