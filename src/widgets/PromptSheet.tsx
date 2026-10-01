import React, { useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import { fonts, radius, stroke, ThemeContextValue, useTheme, useThemedStyles } from "../theme";
import { Button } from "../ui";
import { ActionSheet } from "./ActionSheet";

interface PromptSheetProps {
  visible: boolean;
  title: string;
  placeholder?: string;
  initialValue?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onSubmit: (value: string) => void;
}

const makeStyles = ({ colors }: ThemeContextValue) => ({
  wrap: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 6, gap: 16 },
  input: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: stroke.base,
    borderColor: colors.outline,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
});

export function PromptSheet({ visible, title, placeholder, initialValue = "", confirmLabel = "Save", onCancel, onSubmit }: PromptSheetProps) {
  const s = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <ActionSheet visible={visible} onClose={onCancel} title={title}>
      <View style={s.wrap}>
        <TextInput
          style={s.input}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={colors.faint}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={submit}
          selectionColor={colors.accent}
        />
        <Button label={confirmLabel} onPress={submit} disabled={!value.trim()} fullWidth />
      </View>
    </ActionSheet>
  );
}
