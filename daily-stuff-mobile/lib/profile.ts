import { storage, StorageKeys } from '@/lib/storage';
import * as React from 'react';

export type Profile = { name: string; email: string };

const EMPTY_PROFILE: Profile = { name: '', email: '' };

async function loadProfile(): Promise<Profile> {
  try {
    const raw = await storage.getItem(StorageKeys.profile);
    const parsed = raw ? JSON.parse(raw) : null;

    return {
      name: typeof parsed?.name === 'string' ? parsed.name : '',
      email: typeof parsed?.email === 'string' ? parsed.email : '',
    };
  } catch {
    return EMPTY_PROFILE;
  }
}

/** Name and email of the person using the app, kept on the device only. */
export function useProfile() {
  const [profile, setProfile] = React.useState<Profile>(EMPTY_PROFILE);

  React.useEffect(() => {
    loadProfile().then(setProfile);
  }, []);

  const update = React.useCallback((patch: Partial<Profile>) => {
    setProfile((current) => {
      const next = { ...current, ...patch };

      storage.setItem(StorageKeys.profile, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return { profile, update };
}
