import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { usePlayer } from "../player/PlayerContext";
import { TopBar } from "../components";
import { PlayIcon, PauseIcon, ChevronUpIcon, ChevronDownIcon, TrashIcon } from "../icons";
import { useTheme, fonts, ThemeColors } from "../theme";

interface QueueScreenProps {
  onBack: () => void;
}

export default function QueueScreen({ onBack }: QueueScreenProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const {
    currentTrack,
    isPlaying,
    queue,
    index,
    togglePlayPause,
    jumpToQueueIndex,
    removeFromQueue,
    reorderQueue,
    clearUpNext,
  } = usePlayer();

  // upNext[i] lives at queue[offset + i] in the real, underlying queue.
  const offset = index + 1;
  const upNext = index >= 0 ? queue.slice(offset) : queue;

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <TopBar title="Queue" onBack={onBack} />

      {currentTrack && (
        <View style={styles.nowPlayingCard}>
          <Text style={styles.sectionLabel}>Now playing</Text>
          <View style={styles.nowPlayingRow}>
            <Image source={{ uri: currentTrack.image }} style={styles.art} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.title} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
                {currentTrack.artist}
              </Text>
            </View>
            <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseBtn} hitSlop={8}>
              {isPlaying ? <PauseIcon size={18} color={colors.white} /> : <PlayIcon size={18} color={colors.white} />}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.upNextHeader}>
        <Text style={styles.sectionLabel}>Up next · {upNext.length}</Text>
        {upNext.length > 0 && (
          <TouchableOpacity onPress={clearUpNext} hitSlop={6}>
            <Text style={styles.clearLabel}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={upNext}
        keyExtractor={(item, i) => `${item.id}-${i}`}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nothing queued yet — use "Play next" or "Add to queue" from any track's menu.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item: track, index: i }) => {
          const realIndex = offset + i;
          return (
            <View style={styles.row}>
              <View style={styles.reorderCol}>
                <TouchableOpacity
                  disabled={i === 0}
                  onPress={() => reorderQueue(realIndex, realIndex - 1)}
                  hitSlop={4}
                  style={{ opacity: i === 0 ? 0.3 : 1 }}
                >
                  <ChevronUpIcon size={14} color={colors.ink} />
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={i === upNext.length - 1}
                  onPress={() => reorderQueue(realIndex, realIndex + 1)}
                  hitSlop={4}
                  style={{ opacity: i === upNext.length - 1 ? 0.3 : 1 }}
                >
                  <ChevronDownIcon size={14} color={colors.ink} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.rowInfo}
                activeOpacity={0.7}
                onPress={() => jumpToQueueIndex(realIndex)}
              >
                <Image source={{ uri: track.image }} style={styles.rowArt} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text style={styles.rowArtist} numberOfLines={1}>
                    {track.artist}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => removeFromQueue(realIndex)} hitSlop={8} style={{ padding: 6 }}>
                <TrashIcon size={16} color={colors.muted} />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    sectionLabel: {
      fontFamily: fonts.display,
      fontSize: 12,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: colors.muted,
    },
    nowPlayingCard: {
      margin: 16,
      marginBottom: 8,
      padding: 12,
      borderWidth: 2,
      borderColor: colors.ink,
      backgroundColor: colors.surface,
    },
    nowPlayingRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
    art: { width: 48, height: 48, borderWidth: 2, borderColor: colors.ink },
    title: { fontFamily: fonts.displayBold, fontSize: 14, color: colors.ink },
    artist: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
    playPauseBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    upNextHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    clearLabel: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.accent },
    emptyText: {
      fontFamily: fonts.body,
      fontSize: 13,
      color: colors.muted,
      textAlign: "center",
      paddingHorizontal: 32,
      paddingTop: 24,
    },
    row: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
    reorderCol: { width: 20, alignItems: "center", gap: 2 },
    rowInfo: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 10 },
    rowArt: { width: 36, height: 36, borderWidth: 2, borderColor: colors.ink },
    rowTitle: { fontFamily: fonts.displayBold, fontSize: 13, color: colors.ink },
    rowArtist: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 1 },
  });
}
