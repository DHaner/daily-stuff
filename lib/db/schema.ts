import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'finanzas.db';

const DATABASE_VERSION = 2;

/**
 * Runs on `SQLiteProvider.onInit`. Migrations are keyed on SQLite's `user_version`
 * pragma so adding a step later is just another `if (currentVersion < n)` block.
 */
export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY NOT NULL,
        concept TEXT NOT NULL,
        total REAL NOT NULL DEFAULT 0,
        description TEXT NOT NULL DEFAULT '',
        category_id TEXT NOT NULL DEFAULT 'otros',
        date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS expense_items (
        id TEXT PRIMARY KEY NOT NULL,
        expense_id TEXT NOT NULL,
        concept TEXT NOT NULL,
        amount REAL NOT NULL DEFAULT 0,
        description TEXT NOT NULL DEFAULT '',
        category_id TEXT NOT NULL DEFAULT 'otros',
        position INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (expense_id) REFERENCES expenses (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date);
      CREATE INDEX IF NOT EXISTS idx_expense_items_expense_id ON expense_items (expense_id);
    `);
    currentVersion = 1;
  }

  if (currentVersion === 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS incomes (
        id TEXT PRIMARY KEY NOT NULL,
        concept TEXT NOT NULL,
        total REAL NOT NULL DEFAULT 0,
        description TEXT NOT NULL DEFAULT '',
        category_id TEXT NOT NULL DEFAULT 'otros',
        date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS income_items (
        id TEXT PRIMARY KEY NOT NULL,
        income_id TEXT NOT NULL,
        concept TEXT NOT NULL,
        amount REAL NOT NULL DEFAULT 0,
        description TEXT NOT NULL DEFAULT '',
        category_id TEXT NOT NULL DEFAULT 'otros',
        position INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (income_id) REFERENCES incomes (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes (date);
      CREATE INDEX IF NOT EXISTS idx_income_items_income_id ON income_items (income_id);
    `);
    currentVersion = 2;
  }

  await db.execAsync(`PRAGMA user_version = ${currentVersion}`);
}
