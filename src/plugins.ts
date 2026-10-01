import { PLUGINS } from "./data";
import { createStore } from "./storage";
import { logger } from "./logger";

export interface PluginState {
  installed: boolean;
  enabled: boolean;
}

interface PluginsData {
  states: Record<string, PluginState>;
}

function defaults(): PluginsData {
  const states: Record<string, PluginState> = {};
  for (const p of PLUGINS) {
    states[p.id] = { installed: p.available && p.defaultInstalled, enabled: p.available && p.defaultInstalled };
  }
  return { states };
}

export const pluginsStore = createStore<PluginsData>("nukeop:plugins-v1", defaults());

const OFF: PluginState = { installed: false, enabled: false };

export function getPluginState(id: string): PluginState {
  return pluginsStore.get().states[id] ?? OFF;
}

export function isPluginEnabled(id: string): boolean {
  const s = getPluginState(id);
  return s.installed && s.enabled;
}

function update(id: string, patch: Partial<PluginState>) {
  const plugin = PLUGINS.find((p) => p.id === id);
  if (!plugin || !plugin.available) return;
  pluginsStore.set((s) => ({
    states: { ...s.states, [id]: { ...(s.states[id] ?? OFF), ...patch } },
  }));
}

export function installPlugin(id: string) {
  update(id, { installed: true, enabled: true });
  logger.info(`Plugin installed: ${id}`);
}

export function uninstallPlugin(id: string) {
  update(id, { installed: false, enabled: false });
  logger.info(`Plugin uninstalled: ${id}`);
}

export function setPluginEnabled(id: string, enabled: boolean) {
  update(id, { enabled });
  logger.info(`Plugin ${enabled ? "enabled" : "disabled"}: ${id}`);
}

export function usePlugins() {
  return pluginsStore.use().states;
}

export function usePluginEnabled(id: string): boolean {
  const states = pluginsStore.use().states;
  const s = states[id];
  return !!s && s.installed && s.enabled;
}
