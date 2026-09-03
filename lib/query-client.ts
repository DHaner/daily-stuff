import { storage, StorageKeys } from '@/lib/storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // SQLite is local, so refetching is cheap; keep data warm between screens.
      staleTime: 30 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/** Rehydrates the cache from AsyncStorage so the app paints instantly on cold start. */
export const queryPersister = createAsyncStoragePersister({
  storage,
  key: StorageKeys.queryCache,
  throttleTime: 1000,
});

export const PERSIST_MAX_AGE = 24 * 60 * 60 * 1000;
