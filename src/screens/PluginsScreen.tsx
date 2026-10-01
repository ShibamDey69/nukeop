import React, { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { Chip, EmptyState, IconButton, LargeHeader, SearchField, Switch, TabBar } from "../ui";
import { ActionSheet } from "../widgets/ActionSheet";
import { PLUGINS } from "../data";
import type { Plugin } from "../data";
import { CheckIcon, ClockIcon, GearIcon, TrashIcon } from "../icons";
import { fonts, radius, stroke, ThemeContextValue, useTheme, useThemedStyles } from "../theme";
import { getPluginState, installPlugin, setPluginEnabled, uninstallPlugin, usePlugins } from "../plugins";

type PluginsTab = "store" | "installed";
type Category = "All" | "Themes" | "Lyrics" | "Visualizers" | "Tools";

const TABS: { id: PluginsTab; label: string }[] = [
  { id: "store", label: "Store" },
  { id: "installed", label: "Installed" },
];

const CATEGORIES: Category[] = ["All", "Themes", "Lyrics", "Visualizers", "Tools"];

interface PluginsScreenProps {
  initialTab?: PluginsTab;
}

export default function PluginsScreen({ initialTab = "store" }: PluginsScreenProps) {
  const { colors, shadows } = useTheme();
  const s = useThemedStyles(makeStyles);
  const [activeTab, setActiveTab] = useState<PluginsTab>(initialTab);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [settingsFor, setSettingsFor] = useState<Plugin | null>(null);
  const states = usePlugins();

  function PluginIcon({ bg, label }: { bg: string; label: string }) {
    return (
      <View style={[s.pluginIcon, { backgroundColor: bg }]}>
        <Text style={s.pluginIconLabel}>{label}</Text>
      </View>
    );
  }

  const storePlugins = PLUGINS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const installedPlugins = PLUGINS.filter((p) => states[p.id]?.installed);

  return (
    <View style={{ flex: 1 }}>
      <LargeHeader title="Plugins" subtitle="Extend nukeop" />
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === "store" && (
        <FlatList
          data={storePlugins}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10, gap: 12 }}>
              <SearchField placeholder="Search plugins" value={search} onChange={setSearch} />
              <FlatList
                data={CATEGORIES}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(c) => c}
                contentContainerStyle={{ gap: 8 }}
                renderItem={({ item: c }) => <Chip label={c} active={category === c} onPress={() => setCategory(c)} />}
              />
            </View>
          }
          ListEmptyComponent={<EmptyState title="No plugins match" message="Try a different search or category." />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16, gap: 10 }}
          renderItem={({ item: plugin }) => {
            const state = states[plugin.id];
            const installed = !!state?.installed;
            return (
              <View style={[s.pluginRow, shadows.sm]}>
                <PluginIcon bg={plugin.iconBg} label={plugin.iconLabel} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={s.rowGap}>
                    <Text style={s.pluginName} numberOfLines={1}>
                      {plugin.name}
                    </Text>
                    {!plugin.available && <ClockIcon size={12} color={colors.faint} />}
                  </View>
                  <Text style={s.pluginDesc} numberOfLines={2}>
                    {plugin.description}
                  </Text>
                </View>
                {plugin.available ? (
                  <Chip
                    label={installed ? "Installed" : "Install"}
                    active={installed}
                    onPress={() => (installed ? uninstallPlugin(plugin.id) : installPlugin(plugin.id))}
                  />
                ) : (
                  <Text style={s.soonLabel}>Soon</Text>
                )}
              </View>
            );
          }}
        />
      )}

      {activeTab === "installed" && (
        <FlatList
          data={installedPlugins}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<EmptyState title="Nothing installed" message="Install a plugin from the Store tab." />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 }}
          renderItem={({ item: plugin, index }) => {
            const state = states[plugin.id];
            return (
              <View style={[s.installedRow, index === 0 && s.installedFirst, index === installedPlugins.length - 1 && s.installedLast]}>
                <PluginIcon bg={plugin.iconBg} label={plugin.iconLabel} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.pluginName} numberOfLines={1}>
                    {plugin.name}
                  </Text>
                  <Text style={s.pluginVersion}>{plugin.version}</Text>
                </View>
                <View style={s.installedRight}>
                  <Switch value={!!state?.enabled} onChange={(v) => setPluginEnabled(plugin.id, v)} />
                  <IconButton label={`${plugin.name} settings`} size={30} icon={<GearIcon size={18} color={colors.faint} />} onPress={() => setSettingsFor(plugin)} />
                </View>
              </View>
            );
          }}
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
                  label: getPluginState(settingsFor.id).enabled ? "Disable plugin" : "Enable plugin",
                  icon: <CheckIcon size={17} color={colors.ink} />,
                  onPress: () => setPluginEnabled(settingsFor.id, !getPluginState(settingsFor.id).enabled),
                },
                {
                  label: "Uninstall",
                  destructive: true,
                  icon: <TrashIcon size={17} color={colors.danger} />,
                  onPress: () => uninstallPlugin(settingsFor.id),
                },
              ]
            : []
        }
      />
    </View>
  );
}

const makeStyles = ({ colors, shadows }: ThemeContextValue) => ({
  rowGap: { flexDirection: "row" as const, alignItems: "center" as const, gap: 6 },
  pluginIcon: { width: 46, height: 46, borderRadius: radius.md, borderWidth: stroke.thin, borderColor: colors.outline, alignItems: "center" as const, justifyContent: "center" as const },
  pluginIconLabel: { fontFamily: fonts.monoMedium, fontSize: 11, color: "#FFFFFF", textTransform: "uppercase" as const },
  pluginRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 14, borderRadius: radius.lg, borderWidth: stroke.base, borderColor: colors.outline, padding: 14, backgroundColor: colors.surface },
  pluginName: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: colors.ink },
  pluginDesc: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.muted, marginTop: 2, lineHeight: 16 },
  pluginVersion: { fontFamily: fonts.bodyMedium, fontSize: 11.5, color: colors.muted, marginTop: 1 },
  soonLabel: { fontFamily: fonts.bodyBold, fontSize: 11.5, color: colors.faint },
  installedRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 14, paddingVertical: 13, borderBottomWidth: stroke.thin, borderBottomColor: colors.border },
  installedFirst: { borderTopWidth: stroke.thin, borderTopColor: colors.border, marginTop: 4 },
  installedLast: { borderBottomWidth: 0 },
  installedRight: { flexDirection: "row" as const, alignItems: "center" as const, gap: 14 },
});
