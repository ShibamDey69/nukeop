import React, { ReactNode, useId } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

export interface GradientStop {
  color: string; // #rrggbb
  opacity?: number;
}

interface GradientProps {
  stops: GradientStop[];
  direction?: "vertical" | "horizontal" | "diagonal";
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  pointerEvents?: "none" | "auto";
}

const VECTORS = {
  vertical: { x1: "0", y1: "0", x2: "0", y2: "1" },
  horizontal: { x1: "0", y1: "0", x2: "1", y2: "0" },
  diagonal: { x1: "0", y1: "0", x2: "1", y2: "1" },
} as const;

export function Gradient({ stops, direction = "vertical", style, children, pointerEvents }: GradientProps) {
  const id = `g${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const v = VECTORS[direction];
  return (
    <View style={style} pointerEvents={pointerEvents}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1={v.x1} y1={v.y1} x2={v.x2} y2={v.y2}>
            {stops.map((s, i) => (
              <Stop
                key={i}
                offset={stops.length === 1 ? 0 : i / (stops.length - 1)}
                stopColor={s.color}
                stopOpacity={s.opacity ?? 1}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
      {children}
    </View>
  );
}
