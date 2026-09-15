import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { SubTabBar, SearchBar, FilterChip, Toggle, SectionHeader, ChipRow } from "../components";
import { ActionSheet } from "../widgets/ActionSheet";
import { PLUGINS } from "../data";
import type { Plugin } from "../data";
import { ArrowUpRightIcon, GearIcon, CheckIcon } from "../icons";
import { colors, fonts, nbShadow, nbShadowSm } from "../theme";

type PluginsTab = "store" | "installed";
type Category = "All" | "Themes" | "Lyrics" | "Visualizers" | "Tools";

const TABS = [
  { id: "store" as PluginsTab, label: "Store" },
  { id: "installed" as PluginsTab, label: "Installed" },
];

const CATEGORIES: Category[] = ["All", "Themes", "Lyrics", "Visualizers", "Tools"];

interface PluginsScreenProps {
  initialTab?: PluginsTab;
}

function PluginIcon({ bg, label }: { bg: string; label: string }) {
  return (
    <View style={[styles.pluginIcon, { backgroundColor: bg }]}>
      <Text style={styles.pluginIconLabel}>{label}</Text>
    </View>
  );
}

export default function PluginsScreen({ initialTab = "store" }: PluginsScreenProps) {
  const [activeTab, setActiveTab] = useState<PluginsTab>(initialTab);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [plugins, setPlugins] = useState<Plugin[]>(PLUGINS);
  const [settingsFor, setSettingsFor] = useState<Plugin | null>(null);

  const storePlugins = plugins.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const installedPlugins = plugins.filter((p) => p.installed);

  function toggleInstall(id: string) {
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, installed: !p.installed, enabled: !p.installed } : p
      )
    );
  }

  function toggleEnabled(id: string) {
    setPlugins((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  }

  return (
    <View style={{ flex: 1 }}>
      <SubTabBar tabs={TABS} active={activeTab} onTab={setActiveTab} />

      {activeTab === "store" && (
        <FlatList
          data={storePlugins}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <View style={[styles.hero, nbShadow]}>
                <View>
                  <Text style={styles.heroTitle}>Plugin store</Text>
                  <Text style={styles.heroSubtitle}>Extend nukeop</Text>
                </View>
                <ArrowUpRightIcon size={18} color={colors.white} />
              </View>
              <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                <SearchBar placeholder="Search plugins..." value={search} onChange={setSearch} />
              </View>
              <ChipRow>
                {CATEGORIES.map((c) => (
                  <FilterChip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
                ))}
              </ChipRow>
            </>
          }
          ListEmptyComponent={<Text style={styles.emptyText}>No plugins match your search</Text>}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}
          renderItem={({ item: plugin }) => (
            <View style={[styles.pluginRow, nbShadowSm]}>
              <PluginIcon bg={plugin.iconBg} label={plugin.iconLabel} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.pluginName} numberOfLines={1}>
                  {plugin.name}
                </Text>
                <Text style={styles.pluginVersion}>{plugin.version}</Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleInstall(plugin.id)}
                style={[
                  styles.installBtn,
                  nbShadowSm,
                  { backgroundColor: plugin.installed ? colors.ink : colors.accent },
                ]}
                activeOpacity={0.8}
              >
                {plugin.installed && <CheckIcon size={12} color={colors.white} />}
                <Text style={styles.installBtnLabel}>
                  {plugin.installed ? "Installed" : "Install"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {activeTab === "installed" && (
        <FlatList
          data={installedPlugins}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <SectionHeader title="Installed plugins" subtitle="Manage your plugins" />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No plugins installed</Text>
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          renderItem={({ item: plugin, index }) => (
            <View
              style={[
                styles.installedRow,
                {
                  borderTopWidth: index === 0 ? 2 : 1,
                  borderTopColor: index === 0 ? colors.ink : "#ddd",
                  borderBottomWidth: index === installedPlugins.length - 1 ? 2 : 0,
                  borderBottomColor: colors.ink,
                },
              ]}
            >
              <PluginIcon bg={plugin.iconBg} label={plugin.iconLabel} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.pluginName} numberOfLines={1}>
                  {plugin.name}
                </Text>
                <Text style={styles.pluginVersion}>{plugin.version}</Text>
              </View>
              <View style={styles.installedRight}>
                <Toggle value={plugin.enabled} onChange={() => toggleEnabled(plugin.id)} />
                <TouchableOpacity style={{ padding: 4 }} onPress={() => setSettingsFor(plugin)} hitSlop={6}>
                  <GearIcon size={18} color={colors.muted} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <ActionSheet
        visible={settingsFor !== null}
        onClose={() => setSettingsFor(null)}
        title={settingsFor?.name}
        subtitle={settingsFor?.settingsSummary}
        options={
          settingsFor
            ? [
                {
                  label: settingsFor.enabled ? "Disable plugin" : "Enable plugin",
                  onPress: () => toggleEnabled(settingsFor.id),
                },
                {
                  label: "Uninstall",
                  destructive: true,
                  onPress: () => toggleInstall(settingsFor.id),
                },
              ]
            : []
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.accent,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  heroTitle: { fontFamily: fonts.display, fontSize: 22, lineHeight: 24, letterSpacing: -0.6, color: colors.white },
  heroSubtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.white, opacity: 0.85, marginTop: 4 },
  pluginIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.ink,
  },
  pluginIconLabel: { fontFamily: fonts.monoSemibold, fontSize: 11, color: colors.white, textTransform: "uppercase" },
  pluginRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: 12,
    backgroundColor: colors.surface,
  },
  pluginName: { fontFamily: fonts.displayBold, fontSize: 14, color: colors.ink },
  pluginVersion: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
  installBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 2, borderColor: colors.ink },
  installBtnLabel: { fontFamily: fonts.display, fontSize: 12, color: colors.white },
  installedRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  installedRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, paddingVertical: 32, textAlign: "center" },
});
