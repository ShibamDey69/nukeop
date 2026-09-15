import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { SectionHeader, SearchBar, DefaultArt } from "../components";
import { FolderScanIcon, RefreshIcon } from "../icons";
import { useTheme, Palette, fonts, space, type } from "../theme";
import { AnimatedPressable, FadeSlideIn } from "../motion";
import { scanLocalAudio, formatDuration, ScanStatus } from "../localLibrary";
import { LocalTrack } from "../data";

interface LocalSongsScreenProps {
  tracks: LocalTrack[];
  onTracksScanned: (tracks: LocalTrack[]) => void;
  onPlayTrack: (track: LocalTrack) => void;
}

export default function LocalSongsScreen({ tracks, onTracksScanned, onPlayTrack }: LocalSongsScreenProps) {
  const { colors, nbBorder } = useTheme();
  const styles = createStyles(colors);
  const [status, setStatus] = useState<ScanStatus>(tracks.length ? "done" : "idle");
  const [search, setSearch] = useState("");

  async function handleScan() {
    setStatus("requesting-permission");
    const result = await scanLocalAudio();
    setStatus(result.status);
    if (result.status === "done") {
      onTracksScanned(result.tracks);
    }
  }

  const filtered = tracks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.artist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      <SectionHeader title="Local songs" subtitle="Music stored on this device" />

      <View style={styles.scanBar}>
        <AnimatedPressable onPress={handleScan} style={[styles.scanBtn, nbBorder]} scaleTo={0.96}>
          {status === "requesting-permission" || status === "scanning" ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <FolderScanIcon size={15} color={colors.white} />
          )}
          <Text style={styles.scanBtnLabel}>
            {tracks.length ? "Rescan device" : "Scan for local songs"}
          </Text>
          {tracks.length > 0 && <RefreshIcon size={13} color={colors.white} />}
        </AnimatedPressable>
      </View>

      {status === "denied" && (
        <FadeSlideIn>
          <View style={[styles.noticeBox, nbBorder]}>
            <Text style={styles.noticeText}>
              Permission to access media was denied. Enable it from your device settings to scan local songs.
            </Text>
          </View>
        </FadeSlideIn>
      )}

      {status === "error" && (
        <FadeSlideIn>
          <View style={[styles.noticeBox, nbBorder]}>
            <Text style={styles.noticeText}>Something went wrong scanning your device. Try again.</Text>
          </View>
        </FadeSlideIn>
      )}

      {tracks.length > 0 && (
        <View style={{ paddingHorizontal: space.lg, paddingBottom: space.xs }}>
          <SearchBar placeholder="Search local songs..." value={search} onChange={setSearch} />
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.lg, gap: space.xs }}
        ListEmptyComponent={
          status === "idle" ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>
                Nothing scanned yet. Tap "Scan for local songs" to find audio files on your device — each
                track shows whatever metadata it has, with a default icon standing in for missing artwork.
              </Text>
            </View>
          ) : status === "done" ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No audio files found on this device.</Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <FadeSlideIn delay={Math.min(index, 8) * 25}>
            <AnimatedPressable onPress={() => onPlayTrack(item)} style={[styles.row, nbBorder]} scaleTo={0.98}>
              <DefaultArt size={36} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.rowSubtitle} numberOfLines={1}>
                  {item.artist}
                </Text>
              </View>
              <Text style={styles.rowDuration}>{formatDuration(item.duration)}</Text>
            </AnimatedPressable>
          </FadeSlideIn>
        )}
      />
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    scanBar: { paddingHorizontal: space.lg, paddingBottom: space.md },
    scanBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: space.xs,
      backgroundColor: colors.ink,
      paddingVertical: space.sm + 2,
    },
    scanBtnLabel: { fontFamily: fonts.displayBold, fontSize: type.caption, color: colors.white },
    noticeBox: {
      marginHorizontal: space.lg,
      marginBottom: space.md,
      backgroundColor: colors.surface,
      padding: space.md,
    },
    noticeText: { fontFamily: fonts.body, fontSize: type.body, color: colors.ink, lineHeight: 18 },
    emptyWrap: { paddingHorizontal: space.lg, paddingTop: space.xs },
    emptyText: { fontFamily: fonts.body, fontSize: type.body, color: colors.muted, lineHeight: 18 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: space.md,
      backgroundColor: colors.surface,
      padding: space.xs + 2,
    },
    rowTitle: { fontFamily: fonts.displayBold, fontSize: type.body, color: colors.ink },
    rowSubtitle: { fontFamily: fonts.body, fontSize: type.caption, color: colors.muted, marginTop: 1 },
    rowDuration: { fontFamily: fonts.mono, fontSize: type.micro, color: colors.muted },
  });
}
