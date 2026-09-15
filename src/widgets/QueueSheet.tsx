import React from 'react';
import { View, Text, StyleSheet, Modal, FlatList, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { usePlayer } from '../player/PlayerContext';
import { TrackRow } from './TrackRow';

interface QueueSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const QueueSheet: React.FC<QueueSheetProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { queue, currentIndex, playTrack } = usePlayer();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheetContainer, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>UP NEXT ({queue.length})</Text>
            <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.closeBtnText, { color: colors.text }]}>✕</Text>
            </Pressable>
          </View>

          <FlatList
            data={queue}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => (
              <TrackRow
                track={item}
                index={index}
                isPlaying={index === currentIndex}
                onPress={() => {
                  playTrack(item, queue);
                  onClose();
                }}
              />
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheetContainer: { height: '70%', borderTopWidth: 4, borderLeftWidth: 4, borderRightWidth: 4, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 3, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  closeBtn: { borderWidth: 3, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  closeBtnText: { fontWeight: '900', fontSize: 16 },
  listContent: { paddingVertical: 12, paddingHorizontal: 4 },
});
