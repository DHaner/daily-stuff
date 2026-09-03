import { storage, StorageKeys } from '@/lib/storage';
import * as React from 'react';
import { Uniwind, type ThemeName } from 'uniwind';

export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];

function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_PREFERENCES as readonly string[]).includes(value);
}

/**
 * AsyncStorage is, well, async — so there's no way to read this before the first
 * paint. `cachedPreference` is filled in once `applyStoredThemePreference` (awaited by
 * the root layout before it renders anything) resolves, so every component that mounts
 * afterwards — like `useThemePreference` — sees the real value immediately.
 */
let cachedPreference: ThemePreference = 'system';

export async function loadStoredThemePreference(): Promise<ThemePreference> {
  const stored = await storage.getItem(StorageKeys.themePreference);
  cachedPreference = isThemePreference(stored) ? stored : 'system';
  return cachedPreference;
}

export function setThemePreference(preference: ThemePreference) {
  cachedPreference = preference;
  Uniwind.setTheme(preference as ThemeName | 'system');
  storage.setItem(StorageKeys.themePreference, preference).catch(() => {});
}

/** Awaited once by the root layout before it renders anything. */
export async function applyStoredThemePreference() {
  const preference = await loadStoredThemePreference();
  Uniwind.setTheme(preference as ThemeName | 'system');
}

export function useThemePreference() {
  const [preference, setPreferenceState] = React.useState<ThemePreference>(cachedPreference);

  const setPreference = React.useCallback((next: ThemePreference) => {
    setThemePreference(next);
    setPreferenceState(next);
  }, []);

  return { preference, setPreference };
}
