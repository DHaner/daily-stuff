import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  themePreference: 'theme-preference',
  queryCache: 'tanstack-query-cache',
} as const;

/**
 * AsyncStorage already matches the `getItem`/`setItem`/`removeItem` shape that
 * `@tanstack/query-async-storage-persister` expects, so it's used directly as storage.
 */
export const storage = AsyncStorage;
