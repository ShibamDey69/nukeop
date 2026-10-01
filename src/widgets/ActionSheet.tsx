import React, { ReactNode, useEffect, useRef } from "react";
import { Animated, Easing, Modal, Platform, Pressable, Text, View } from "react-native";
import { fonts, radius, stroke, ThemeContextValue, useTheme, useThemedStyles } from "../theme";

export interface ActionSheetOption {
  label: string;
  icon?: ReactNode;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  options?: ActionSheetOption[];
  onClose: () => void;
  children?: ReactNode;
}

const makeStyles = ({ colors, shadows }: ThemeContextValue) => ({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" as const },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: stroke.base,
    borderColor: colors.outline,
    borderBottomWidth: 0,
    paddingBottom: 30,
    paddingTop: 10,
    maxHeight: "82%" as const,
    ...shadows.lg,
  },
  grabber: { width: 40, height: 5, borderRadius: 2.5, backgroundColor: colors.outline, alignSelf: "center" as const, marginBottom: 14 },
  title: { fontFamily: fonts.display, fontSize: 17, color: colors.ink, paddingHorizontal: 20, textAlign: "center" as const },
  subtitle: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: colors.muted, paddingHorizontal: 20, marginTop: 3, marginBottom: 2, textAlign: "center" as const },
  optionList: { marginTop: 10, paddingHorizontal: 8 },
  option: { flexDirection: "row" as const, alignItems: "center" as const, gap: 14, paddingHorizontal: 14, paddingVertical: 14, borderRadius: radius.md },
  optionLabel: { fontFamily: fonts.bodySemibold, fontSize: 15.5, color: colors.ink },
});

export function ActionSheet({ visible, title, subtitle, options, onClose, children }: ActionSheetProps) {
  const s = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(300)).current;
  const native = Platform.OS !== "web";

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : 300,
      duration: visible ? 260 : 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: native,
    }).start();
  }, [visible, translateY, native]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Animated.View onStartShouldSetResponder={() => true} style={[s.sheet, { transform: [{ translateY }] }]}>
          <View style={s.grabber} />
          {title ? (
            <Text style={s.title} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text style={s.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}

          {children}

          {options && options.length > 0 ? (
            <View style={s.optionList}>
              {options.map((opt) => (
                <Pressable
                  key={opt.label}
                  disabled={opt.disabled}
                  onPress={() => {
                    onClose();
                    opt.onPress();
                  }}
                  style={({ pressed }) => [s.option, { opacity: opt.disabled ? 0.4 : pressed ? 0.6 : 1 }]}
                >
                  {opt.icon}
                  <Text style={[s.optionLabel, opt.destructive && { color: colors.danger }]}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
