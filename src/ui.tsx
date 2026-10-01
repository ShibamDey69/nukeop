import React, { ReactNode, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  GestureResponderEvent,
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { BackIcon, CloseIcon, ChevronRightIcon, SearchIcon } from "./icons";
import { fonts, radius, stroke, ThemeContextValue, useTheme, useThemedStyles } from "./theme";

const NATIVE = Platform.OS !== "web";

// ── PressableScale ─────────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends Omit<PressableProps, "style" | "children"> {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  children?: ReactNode;
}

/** Pressable that gently shrinks while held — used for cards, tiles and buttons. */
export function PressableScale({ style, scaleTo = 0.97, children, onPressIn, onPressOut, ...rest }: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: NATIVE, speed: 50, bounciness: 0 }).start();

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e: GestureResponderEvent) => {
        animate(scaleTo);
        onPressIn?.(e);
      }}
      onPressOut={(e: GestureResponderEvent) => {
        animate(1);
        onPressOut?.(e);
      }}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}

// ── IconButton ─────────────────────────────────────────────────────────────

interface IconButtonProps {
  icon: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  size?: number;
  variant?: "plain" | "soft" | "accent" | "solid";
  label: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const makeIconButtonStyles = ({ colors, shadows }: ThemeContextValue) => ({
  plain: { backgroundColor: "transparent" },
  soft: { backgroundColor: colors.surfaceAlt, borderWidth: stroke.base, borderColor: colors.outline },
  solid: { backgroundColor: colors.surface, borderWidth: stroke.base, borderColor: colors.outline, ...shadows.sm },
  accent: { backgroundColor: colors.accent, borderWidth: stroke.base, borderColor: colors.outline, ...shadows.md },
});

export function IconButton({ icon, onPress, onLongPress, size = 40, variant = "plain", label, disabled, style }: IconButtonProps) {
  const styles = useThemedStyles(makeIconButtonStyles);
  return (
    <PressableScale
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      hitSlop={6}
      scaleTo={0.9}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        { width: size, height: size, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.4 : 1 },
        styles[variant],
        style,
      ]}
    >
      {icon}
    </PressableScale>
  );
}

// ── Button ─────────────────────────────────────────────────────────────────

interface ButtonProps {
  label: string;
  onPress?: () => void;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

const HEIGHTS = { sm: 36, md: 44, lg: 52 } as const;
const FONT_SIZES = { sm: 13, md: 14, lg: 16 } as const;

export function Button({ label, onPress, icon, variant = "primary", size = "md", disabled, style, fullWidth }: ButtonProps) {
  const { colors, shadows } = useTheme();
  const palette = {
    primary: { bg: colors.accent, fg: colors.onAccent, shadow: shadows.sm },
    secondary: { bg: colors.surfaceAlt, fg: colors.ink, shadow: shadows.sm },
    ghost: { bg: "transparent", fg: colors.ink, shadow: undefined },
    danger: { bg: colors.danger, fg: "#FFFFFF", shadow: shadows.sm },
  }[variant];

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        {
          height: HEIGHTS[size],
          paddingHorizontal: size === "sm" ? 16 : 22,
          borderRadius: radius.pill,
          backgroundColor: palette.bg,
          borderWidth: stroke.base,
          borderColor: colors.outline,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: disabled ? 0.5 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
          ...palette.shadow,
        },
        style,
      ]}
    >
      {icon}
      <Text
        style={{
          fontFamily: fonts.bodyBold,
          fontSize: FONT_SIZES[size],
          letterSpacing: 0.2,
          color: palette.fg,
        }}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

// ── Chip ───────────────────────────────────────────────────────────────────

const makeChipStyles = ({ colors, shadows }: ThemeContextValue) => ({
  base: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: stroke.base,
    borderColor: colors.outline,
    backgroundColor: colors.surface,
    ...shadows.sm,
  } as ViewStyle,
  active: { backgroundColor: colors.accent, borderColor: colors.outline } as ViewStyle,
  label: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink } as TextStyle,
  labelActive: { color: colors.onAccent } as TextStyle,
});

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  const s = useThemedStyles(makeChipStyles);
  return (
    <PressableScale onPress={onPress} scaleTo={0.95} style={[s.base, active && s.active]} accessibilityRole="button">
      <Text style={[s.label, active && s.labelActive]}>{label}</Text>
    </PressableScale>
  );
}

// ── Segmented control ──────────────────────────────────────────────────────

const makeSegStyles = ({ colors, shadows }: ThemeContextValue) => ({
  wrap: {
    flexDirection: "row",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: stroke.base,
    borderColor: colors.outline,
    padding: 3,
  } as ViewStyle,
  item: { flex: 1, height: 34, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", paddingHorizontal: 10 } as ViewStyle,
  itemActive: { backgroundColor: colors.accent, ...shadows.sm } as ViewStyle,
  label: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.muted } as TextStyle,
  labelActive: { color: colors.onAccent } as TextStyle,
});

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const s = useThemedStyles(makeSegStyles);
  return (
    <View style={[s.wrap, style]}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            style={[s.item, active && s.itemActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[s.label, active && s.labelActive]} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Headers ────────────────────────────────────────────────────────────────

const makeHeaderStyles = ({ colors }: ThemeContextValue) => ({
  bar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, height: 56, gap: 8 } as ViewStyle,
  title: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    letterSpacing: -0.2,
    color: colors.ink,
  } as TextStyle,
  side: { minWidth: 44, alignItems: "flex-end", justifyContent: "center" } as ViewStyle,
  sideLeft: { minWidth: 44, alignItems: "flex-start", justifyContent: "center" } as ViewStyle,
  large: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, gap: 12 } as ViewStyle,
  // Bangers is the manga sound-effect font — reserved for these big screen
  // titles (Home / Library / Plugins) so it reads as a title-card, not noise.
  largeTitle: { fontFamily: fonts.comic, fontSize: 38, lineHeight: 40, letterSpacing: 0.3, color: colors.ink } as TextStyle,
  largeSub: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.muted, marginTop: 3 } as TextStyle,
});

/** Header for pushed screens: back button, centred title, optional right action. */
export function Header({ title, onBack, right }: { title?: string; onBack?: () => void; right?: ReactNode }) {
  const s = useThemedStyles(makeHeaderStyles);
  const { colors } = useTheme();
  return (
    <View style={s.bar}>
      <View style={s.sideLeft}>
        {onBack ? <IconButton label="Back" onPress={onBack} icon={<BackIcon size={22} color={colors.ink} />} /> : null}
      </View>
      <Text style={s.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={s.side}>{right}</View>
    </View>
  );
}

/** Big left-aligned title used at the top of the tab screens. */
export function LargeHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  const s = useThemedStyles(makeHeaderStyles);
  return (
    <View style={s.large}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.largeTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={s.largeSub}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={{ flexDirection: "row", gap: 8, paddingBottom: 4 }}>{right}</View> : null}
    </View>
  );
}

// ── Underline tab bar (horizontal, scrollable) ─────────────────────────────

const makeTabBarStyles = ({ colors }: ThemeContextValue) => ({
  wrap: { flexDirection: "row" as const, gap: 22, paddingHorizontal: 20 },
  item: { paddingVertical: 12, borderBottomWidth: stroke.base, borderBottomColor: "transparent" },
  itemActive: { borderBottomColor: colors.accent },
  label: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: colors.muted },
  labelActive: { color: colors.ink },
});

export function TabBar<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  const s = useThemedStyles(makeTabBarStyles);
  const items = tabs.map((t) => {
    const isActive = t.id === active;
    return (
      <Pressable key={t.id} onPress={() => onChange(t.id)} style={[s.item, isActive && s.itemActive]} accessibilityRole="button">
        <Text style={[s.label, isActive && s.labelActive]}>{t.label}</Text>
      </Pressable>
    );
  });
  return <View style={s.wrap}>{items}</View>;
}

// ── Section title ──────────────────────────────────────────────────────────

const makeSectionStyles = ({ colors }: ThemeContextValue) => ({
  row: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 12 } as ViewStyle,
  title: { fontFamily: fonts.display, fontSize: 21, letterSpacing: -0.4, color: colors.ink } as TextStyle,
  action: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.accent } as TextStyle,
});

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const s = useThemedStyles(makeSectionStyles);
  return (
    <View style={s.row}>
      <Text style={s.title}>{title}</Text>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={s.action}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ── Search field ───────────────────────────────────────────────────────────

const makeSearchStyles = ({ colors, shadows }: ThemeContextValue) => ({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: stroke.base,
    borderColor: colors.outline,
    backgroundColor: colors.surface,
    ...shadows.sm,
  } as ViewStyle,
  input: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink, padding: 0, height: "100%" } as TextStyle,
});

interface SearchFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  onSubmit?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SearchField({ value, onChange, placeholder, autoFocus, onSubmit, style }: SearchFieldProps) {
  const s = useThemedStyles(makeSearchStyles);
  const { colors } = useTheme();
  return (
    <View style={[s.wrap, style]}>
      <SearchIcon size={18} color={colors.muted} />
      <TextInput
        style={s.input}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        value={value}
        onChangeText={onChange}
        autoFocus={autoFocus}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoCorrect={false}
        autoCapitalize="none"
        selectionColor={colors.accent}
        accessibilityLabel={placeholder}
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChange("")} hitSlop={10} accessibilityLabel="Clear search">
          <View style={{ width: 20, height: 20, borderRadius: radius.sm, backgroundColor: colors.surfaceHigh, alignItems: "center", justifyContent: "center" }}>
            <CloseIcon size={12} color={colors.muted} strokeWidth={2.5} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────

const makeEmptyStyles = ({ colors, shadows }: ThemeContextValue) => ({
  wrap: { alignItems: "center", paddingHorizontal: 36, paddingVertical: 40, gap: 6 } as ViewStyle,
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    borderWidth: stroke.base,
    borderColor: colors.outline,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    ...shadows.md,
  } as ViewStyle,
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.ink, textAlign: "center" } as TextStyle,
  message: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.muted, textAlign: "center" } as TextStyle,
});

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  const s = useThemedStyles(makeEmptyStyles);
  return (
    <View style={s.wrap}>
      {icon ? <View style={s.iconWrap}>{icon}</View> : null}
      <Text style={s.title}>{title}</Text>
      {message ? <Text style={s.message}>{message}</Text> : null}
      {action ? <View style={{ marginTop: 14 }}>{action}</View> : null}
    </View>
  );
}

// ── Switch ─────────────────────────────────────────────────────────────────

export function Switch({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  const { colors } = useTheme();
  const x = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(x, { toValue: value ? 1 : 0, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [value, x]);

  const bg = x.interpolate({ inputRange: [0, 1], outputRange: [colors.surfaceAlt, colors.accent] });
  const left = x.interpolate({ inputRange: [0, 1], outputRange: [3, 24] });

  return (
    <Pressable
      onPress={() => !disabled && onChange(!value)}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View
        style={{
          width: 50,
          height: 28,
          borderRadius: 14,
          borderWidth: stroke.base,
          borderColor: colors.outline,
          backgroundColor: bg,
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            left,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: "#FFFFFF",
            borderWidth: stroke.thin,
            borderColor: colors.outline,
          }}
        />
      </Animated.View>
    </Pressable>
  );
}

// ── Settings-style grouped rows ────────────────────────────────────────────

const makeGroupStyles = ({ colors, shadows }: ThemeContextValue) => ({
  wrap: { marginBottom: 22 } as ViewStyle,
  title: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.8, textTransform: "uppercase", color: colors.muted, marginBottom: 8, marginLeft: 6 } as TextStyle,
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: stroke.base,
    borderColor: colors.outline,
    overflow: "hidden",
    ...shadows.md,
  } as ViewStyle,
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, minHeight: 54, paddingVertical: 10 } as ViewStyle,
  rowBorder: { borderTopWidth: stroke.thin, borderTopColor: colors.border } as ViewStyle,
  iconWrap: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.accentSoft, borderWidth: stroke.thin, borderColor: colors.outline, alignItems: "center", justifyContent: "center" } as ViewStyle,
  label: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.ink } as TextStyle,
  sub: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 17, color: colors.muted, marginTop: 1 } as TextStyle,
  value: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.muted } as TextStyle,
});

export function SettingsGroup({ title, children }: { title?: string; children: ReactNode }) {
  const s = useThemedStyles(makeGroupStyles);
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={s.wrap}>
      {title ? <Text style={s.title}>{title}</Text> : null}
      <View style={s.card}>
        {items.map((child, i) => (
          <View key={i} style={i > 0 ? s.rowBorder : undefined}>
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}

interface SettingsRowProps {
  label: string;
  sublabel?: string;
  icon?: ReactNode;
  value?: string;
  right?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  destructive?: boolean;
}

export function SettingsRow({ label, sublabel, icon, value, right, onPress, chevron, destructive }: SettingsRowProps) {
  const s = useThemedStyles(makeGroupStyles);
  const { colors } = useTheme();
  const content = (
    <View style={s.row}>
      {icon ? <View style={s.iconWrap}>{icon}</View> : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[s.label, destructive && { color: colors.danger }]}>{label}</Text>
        {sublabel ? <Text style={s.sub}>{sublabel}</Text> : null}
      </View>
      {value ? <Text style={s.value}>{value}</Text> : null}
      {right}
      {chevron ? <ChevronRightIcon size={16} color={colors.faint} /> : null}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} android_ripple={{ color: colors.accentSoft }} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      {content}
    </Pressable>
  );
}

export { TextInput };
