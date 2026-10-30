import { setCategories } from '@/lib/categories';
import { listCategories } from '@/lib/db/categories';
import { migrateDbIfNeeded } from '@/lib/db/schema';
import type { SQLiteDatabase } from 'expo-sqlite';

/** `SQLiteProvider.onInit`: migrate, then load the categories so the first render already has them. */
export async function initDatabase(db: SQLiteDatabase) {
  await migrateDbIfNeeded(db);
  setCategories(await listCategories(db));
}
