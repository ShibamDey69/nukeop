import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
} from "react-native";
import { usePlayer } from "../player/PlayerContext";
import {
  EqualizerIcon,
  TrashIcon,
  ChevronDownIcon,
  MusicNoteIcon,
} from "../icons";
import { colors, fonts, nbShadow } from "../theme";

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface QueueSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function QueueSheet({ visible, onClose }: QueueSheetProps) {
  const {
    queue,
    index,
    currentTrack,
    isPlaying,
    jumpToIndex,
    removeFromQueue,
    moveQueueItem,
    clearQueue,
  } = usePlayer();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, nbShadow]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.grabber} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.title}>Playback Queue</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{queue.length} tracks</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              {queue.length > 1 && (
                <TouchableOpacity
                  onPress={clearQueue}
                  style={styles.clearBtn}
                  activeOpacity={0.7}
                  hitSlop={6}
                >
                  <TrashIcon size={14} color={colors.ink} />
                  <Text style={styles.clearBtnText}>Clear</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={8}>
                <ChevronDownIcon size={20} color={colors.ink} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable queue list */}
          <FlatList
            data={queue}
            keyExtractor={(item, i) => `${item.id}-${i}`}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              currentTrack ? (
                <View style={styles.nowPlayingSection}>
                  <Text style={styles.sectionLabel}>Now Playing</Text>
                  <View style={[styles.nowPlayingCard, nbShadow]}>
                    <View style={styles.cardArtWrap}>
                      {currentTrack.image ? (
                        <Image source={{ uri: currentTrack.image }} style={styles.cardArt} />
                      ) : (
                        <View style={styles.cardArtPlaceholder}>
                          <MusicNoteIcon size={20} color={colors.ink} />
                        </View>
                      )}
                      {isPlaying && (
                        <View style={styles.playingBadge}>
                          <EqualizerIcon size={14} color={colors.white} />
                        </View>
                      )}
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.nowPlayingTitle} numberOfLines={1}>
                        {currentTrack.title}
                      </Text>
                      <Text style={styles.nowPlayingArtist} numberOfLines={1}>
                        {currentTrack.artist}
                      </Text>
                    </View>
                    <Text style={styles.trackDuration}>
                      {formatDuration(currentTrack.duration)}
                    </Text>
                  </View>
                  <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
                    Up Next ({Math.max(0, queue.length - 1 - index)})
                  </Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>Queue is empty</Text>
                <Text style={styles.emptySubtext}>
                  Play tracks or add them to queue from Library, Search, or Local songs.
                </Text>
              </View>
            }
            renderItem={({ item, index: trackIdx }) => {
              const isCurrent = trackIdx === index;
              return (
                <View style={[styles.queueRow, isCurrent && styles.queueRowCurrent]}>
                  {/* Position number or playing indicator */}
                  <View style={styles.leading}>
                    {isCurrent ? (
                      <EqualizerIcon size={14} color={colors.accent} />
                    ) : (
                      <Text style={styles.positionText}>
                        {trackIdx > index ? `+${trackIdx - index}` : `${trackIdx + 1}`}
                      </Text>
                    )}
                  </View>

                  {/* Artwork */}
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.rowArt} />
                  ) : (
                    <View style={styles.rowArtPlaceholder}>
                      <MusicNoteIcon size={16} color={colors.ink} />
                    </View>
                  )}

                  {/* Track Info (Tap to play) */}
                  <TouchableOpacity
                    style={{ flex: 1, minWidth: 0 }}
                    onPress={() => jumpToIndex(trackIdx)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.rowTitle, isCurrent && { color: colors.accent }]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.rowArtist} numberOfLines={1}>
                      {item.artist}
                    </Text>
                  </TouchableOpacity>

                  {/* Duration */}
                  <Text style={styles.trackDuration}>{formatDuration(item.duration)}</Text>

                  {/* Reorder controls */}
                  <View style={styles.reorderControls}>
                    {trackIdx > 0 && (
                      <TouchableOpacity
                        onPress={() => moveQueueItem(trackIdx, trackIdx - 1)}
                        style={styles.reorderBtn}
                        hitSlop={4}
                      >
                        <Text style={styles.arrowText}>▲</Text>
                      </TouchableOpacity>
                    )}
                    {trackIdx < queue.length - 1 && (
                      <TouchableOpacity
                        onPress={() => moveQueueItem(trackIdx, trackIdx + 1)}
                        style={styles.reorderBtn}
                        hitSlop={4}
                      >
                        <Text style={styles.arrowText}>▼</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Remove button */}
                  <TouchableOpacity
                    onPress={() => removeFromQueue(trackIdx)}
                    style={styles.removeBtn}
                    hitSlop={8}
                  >
                    <TrashIcon size={16} color={colors.muted} />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(17,17,17,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderColor: colors.ink,
    maxHeight: "82%",
    minHeight: 380,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.muted,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
    opacity: 0.5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
    letterSpacing: -0.4,
  },
  countBadge: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  countBadgeText: {
    fontFamily: fonts.monoSemibold,
    fontSize: 10,
    color: colors.ink,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.ground,
  },
  clearBtnText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.ink,
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
  nowPlayingSection: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontFamily: fonts.display,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 8,
  },
  nowPlayingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.ground,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: 10,
  },
  cardArtWrap: {
    width: 44,
    height: 44,
    position: "relative",
  },
  cardArt: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  cardArtPlaceholder: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  playingBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: colors.accent,
    padding: 2,
    borderRadius: 2,
  },
  nowPlayingTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: colors.ink,
  },
  nowPlayingArtist: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  queueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  queueRowCurrent: {
    backgroundColor: colors.ground,
  },
  leading: {
    width: 24,
    alignItems: "center",
  },
  positionText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.muted,
  },
  rowArt: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  rowArtPlaceholder: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: colors.ground,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.ink,
  },
  rowArtist: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  trackDuration: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.muted,
  },
  reorderControls: {
    flexDirection: "column",
    gap: 2,
  },
  reorderBtn: {
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  arrowText: {
    fontSize: 9,
    color: colors.ink,
    fontFamily: fonts.mono,
  },
  removeBtn: {
    padding: 6,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: colors.ink,
  },
  emptySubtext: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 18,
  },
});
