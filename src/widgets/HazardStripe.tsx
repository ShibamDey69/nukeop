import React, { useId } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Svg, { Defs, Pattern, Rect } from "react-native-svg";

interface HazardStripeProps {
  colorA: string;
  colorB: string;
  /** Width of each stripe band in px. */
  stripeWidth?: number;
  /** Angle of the stripes in degrees. */
  angle?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * A tileable diagonal two-tone stripe bar — the "hazard tape" accent seen
 * running along the reference player's chrome. Deliberately thin and used
 * sparingly (top of the mini player / bottom nav) as a signature touch,
 * not a background texture.
 */
export function HazardStripe({ colorA, colorB, stripeWidth = 8, angle = -45, style }: HazardStripeProps) {
  const id = `hz${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const tile = stripeWidth * 2;
  return (
    <View style={style} pointerEvents="none">
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <Pattern id={id} width={tile} height={tile} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle})`}>
            <Rect x={0} y={0} width={tile} height={tile} fill={colorA} />
            <Rect x={0} y={0} width={stripeWidth} height={tile} fill={colorB} />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
