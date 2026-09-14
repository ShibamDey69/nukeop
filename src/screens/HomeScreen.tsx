import React, { ReactNode } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import {
  ArrowUpRightIcon,
  ArrowRightIcon,
  ArtistsIcon,
  AlbumsIcon,
  PlaylistIcon,
  PluginsIcon,
  PreferencesIcon,
  WhatsNewIcon,
  LogsIcon,
  FolderScanIcon,
} from "../icons";
import { useTheme, Palette, fonts } from "../theme";
import { AnimatedPressable, FadeSlideIn } from "../motion";

export type HomeNav =
  | "artists"
  | "albums"
  | "playlists"
  | "plugins"
  | "preferences"
  | "whats-new"
  | "logs"
  | "now-playing"
  | "local-songs";

interface HomeScreenProps {
  onNavigate: (dest: HomeNav) => void;
}

interface BentoCardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: any;
  span2?: boolean;
  delay?: number;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { colors, nbShadow } = useTheme();
  const styles = createStyles(colors);

  function BentoCard({ children, onPress, style, span2, delay = 0 }: BentoCardProps) {
    return (
      <FadeSlideIn delay={delay} style={[styles.card, span2 && styles.cardSpan2]}>
        <AnimatedPressable
          onPress={onPress}
          disabled={!onPress}
          style={[styles.cardInner, nbShadow, style]}
          scaleTo={0.97}
        >
          {children}
        </AnimatedPressable>
      </FadeSlideIn>
    );
  }

  return (
    <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 16 }}>
      <View style={styles.grid}>
        {/* Hero card */}
        <BentoCard
          span2
          style={[styles.heroCard, { minHeight: 120 }]}
          onPress={() => onNavigate("now-playing")}
        >
          <View style={styles.rowBetween}>
            <Text style={styles.heroTitle}>Music,{"\n"}your way.</Text>
            <ArrowUpRightIcon size={20} color={colors.white} />
          </View>
          <Text style={styles.heroSubtitle}>Listen. Organize. Extend.</Text>
        </BentoCard>

        {/* Artists */}
        <BentoCard delay={40} style={{ backgroundColor: colors.accentLight }} onPress={() => onNavigate("artists")}>
          <ArtistsIcon size={22} color={colors.ink} />
          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.cardTitle}>Artists</Text>
              <Text style={[styles.cardSubtitle, { opacity: 0.6, color: colors.ink }]}>Explore artists</Text>
            </View>
            <ArrowRightIcon size={14} color={colors.ink} />
          </View>
        </BentoCard>

        {/* Albums */}
        <BentoCard delay={70} onPress={() => onNavigate("albums")}>
          <AlbumsIcon size={22} color={colors.ink} />
          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.cardTitle}>Albums</Text>
              <Text style={styles.cardSubtitle}>Browse albums</Text>
            </View>
            <ArrowRightIcon size={14} color={colors.ink} />
          </View>
        </BentoCard>

        {/* Local songs — full width */}
        <BentoCard
          delay={100}
          span2
          style={[styles.rowCard, { minHeight: 64, backgroundColor: colors.ink }]}
          onPress={() => onNavigate("local-songs")}
        >
          <View style={styles.rowLeft}>
            <FolderScanIcon size={22} color={colors.white} />
            <View>
              <Text style={[styles.cardTitle, { color: colors.white }]}>Local songs</Text>
              <Text style={[styles.cardSubtitle, { color: colors.muted }]}>Scan & play from this device</Text>
            </View>
          </View>
          <ArrowUpRightIcon size={16} color={colors.white} />
        </BentoCard>

        {/* Playlists — full width */}
        <BentoCard delay={130} span2 style={[styles.rowCard, { minHeight: 64 }]} onPress={() => onNavigate("playlists")}>
          <View style={styles.rowLeft}>
            <PlaylistIcon size={22} color={colors.ink} />
            <View>
              <Text style={styles.cardTitle}>Playlists</Text>
              <Text style={styles.cardSubtitle}>Your collections</Text>
            </View>
          </View>
          <ArrowUpRightIcon size={16} color={colors.ink} />
        </BentoCard>

        {/* Plugins */}
        <BentoCard delay={160} style={{ backgroundColor: colors.ink }} onPress={() => onNavigate("plugins")}>
          <PluginsIcon size={22} color={colors.white} />
          <View style={styles.cardBottomRowSingle}>
            <Text style={[styles.cardTitle, { color: colors.white }]}>Plugins</Text>
            <Text style={[styles.cardSubtitle, { color: colors.muted }]}>Extend nukeop</Text>
          </View>
        </BentoCard>

        {/* Preferences */}
        <BentoCard delay={190} onPress={() => onNavigate("preferences")}>
          <PreferencesIcon size={22} color={colors.ink} />
          <View style={styles.cardBottomRowSingle}>
            <Text style={styles.cardTitle}>Preferences</Text>
            <Text style={styles.cardSubtitle}>Make it yours</Text>
          </View>
        </BentoCard>

        {/* What's New */}
        <BentoCard delay={220} style={[styles.rowCard, { minHeight: 56 }]} onPress={() => onNavigate("whats-new")}>
          <WhatsNewIcon size={20} color={colors.ink} />
          <View>
            <Text style={styles.cardTitle}>What's new</Text>
            <Text style={styles.cardSubtitle}>Changelog & updates</Text>
          </View>
        </BentoCard>

        {/* Logs */}
        <BentoCard delay={250} style={[styles.rowCard, { minHeight: 56 }]} onPress={() => onNavigate("logs")}>
          <LogsIcon size={20} color={colors.ink} />
          <View>
            <Text style={styles.cardTitle}>Logs</Text>
            <Text style={styles.cardSubtitle}>View logs</Text>
          </View>
        </BentoCard>
      </View>
    </ScrollView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    content: { flex: 1 },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      padding: 12,
      gap: 12,
    },
    card: { width: "47%" },
    cardSpan2: { width: "100%" },
    cardInner: {
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 12,
      justifyContent: "space-between",
      height: "100%",
    },
    heroCard: { backgroundColor: colors.accent },
    rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    rowCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
    heroTitle: {
      fontFamily: fonts.display,
      fontSize: 26,
      lineHeight: 28,
      letterSpacing: -0.8,
      color: colors.white,
      flexShrink: 1,
    },
    heroSubtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.white, opacity: 0.85, marginTop: 8 },
    cardBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 16 },
    cardBottomRowSingle: { marginTop: 16 },
    cardTitle: { fontFamily: fonts.displayBold, fontSize: 14, color: colors.ink },
    cardSubtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  });
}
