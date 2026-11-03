import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  themePreference: 'theme-preference',
  profile: 'profile',
  queryCache: 'tanstack-query-cache',
  /** Task id -> id of the notification scheduled on this device. */
  reminderIds: 'reminder-notification-ids',
} as const;

/**
 * AsyncStorage already matches the `getItem`/`setItem`/`removeItem` shape that
 * `@tanstack/query-async-storage-persister` expects, so it's used directly as storage.
 */
export const storage = AsyncStorage;
