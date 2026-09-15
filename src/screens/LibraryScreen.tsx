import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../theme';
import { MOCK_PLAYLISTS } from '../data';
import { NeoButton } from '../components';
import { useAppNavigation } from '../navigation/NavigationContext';

export const LibraryScreen: React.FC = () => {
  const { colors, styles: globalStyles } = useTheme();
  const { navigate } = useAppNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>YOUR LIBRARY</Text>
      </View>

      <View style={styles.actionRow}>
        <NeoButton 
          title="LOCAL SONGS" 
          variant="secondary" 
          style={styles.actionBtn} 
          onPress={() => navigate('LocalSongs')} 
        />
        <NeoButton 
          title="NEW PLAYLIST" 
          variant="accent" 
          style={styles.actionBtn} 
        />
      </View>

      <FlatList
        data={MOCK_PLAYLISTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.libraryItem, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.border }]}>
            <View style={[styles.colorBlock, { backgroundColor: item.color, borderColor: colors.border }]} />
            <View style={styles.itemInfo}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.itemSubtitle, { color: colors.textMuted }]}>
                {item.trackCount} Tracks • By {item.creator}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  libraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  colorBlock: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderRadius: 6,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    fontWeight: '700',
  },
});
