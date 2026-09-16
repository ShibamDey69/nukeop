import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { useTheme, fonts, ThemeColors } from "../theme";

export interface ActionSheetOption {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  options: ActionSheetOption[];
  onClose: () => void;
}

export function ActionSheet({ visible, title, subtitle, options, onClose }: ActionSheetProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.grabber} />
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <View style={styles.optionList}>
            {options.map((opt, i) => (
              <TouchableOpacity
                key={opt.label}
                onPress={() => {
                  onClose();
                  opt.onPress();
                }}
                style={[styles.option, i === options.length - 1 && { borderBottomWidth: 0 }]}
                activeOpacity={0.6}
              >
                {opt.icon}
                <Text style={[styles.optionLabel, opt.destructive && { color: "#dc2626" }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(17,17,17,0.4)", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: colors.surface,
      borderTopWidth: 2,
      borderColor: colors.ink,
      paddingBottom: 28,
      paddingTop: 10,
      shadowColor: colors.ink,
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 8,
    },
    grabber: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.muted, alignSelf: "center", marginBottom: 12, opacity: 0.5 },
    title: { fontFamily: fonts.display, fontSize: 18, color: colors.ink, paddingHorizontal: 20 },
    subtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, paddingHorizontal: 20, marginTop: 2, marginBottom: 4 },
    optionList: { marginTop: 8 },
    option: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
    },
    optionLabel: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink },
  });
}
