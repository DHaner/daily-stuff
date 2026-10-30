import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'finanzas.db';

const DATABASE_VERSION = 6;

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

  if (currentVersion === 2) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS journal_labels (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS journal_entries (
        id TEXT PRIMARY KEY NOT NULL,
        date TEXT NOT NULL UNIQUE,
        mood TEXT NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        photo_uri TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS journal_entry_labels (
        entry_id TEXT NOT NULL,
        label_id TEXT NOT NULL,
        PRIMARY KEY (entry_id, label_id),
        FOREIGN KEY (entry_id) REFERENCES journal_entries (id) ON DELETE CASCADE,
        FOREIGN KEY (label_id) REFERENCES journal_labels (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_journal_entry_labels_label_id ON journal_entry_labels (label_id);
    `);
    currentVersion = 3;
  }

  if (currentVersion === 3) {
    await db.execAsync(`
      ALTER TABLE journal_labels ADD COLUMN color TEXT NOT NULL DEFAULT '#64748b';
    `);

    // Starter labels so the journal is usable from day one; only seeded when none exist yet.
    const existing = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM journal_labels'
    );

    if (!existing?.count) {
      const now = new Date().toISOString();
      const defaults = [
        ['default-trabajo', 'Trabajo', 'Briefcase', '#3b82f6'],
        ['default-ejercicio', 'Ejercicio', 'Dumbbell', '#22c55e'],
        ['default-familia', 'Familia', 'House', '#ec4899'],
        ['default-amigos', 'Amigos', 'PartyPopper', '#f59e0b'],
        ['default-descanso', 'Descanso', 'Moon', '#8b5cf6'],
      ];

      for (const [id, name, icon, color] of defaults) {
        await db.runAsync(
          'INSERT OR IGNORE INTO journal_labels (id, name, icon, color, created_at) VALUES (?, ?, ?, ?, ?)',
          id,
          name,
          icon,
          color,
          now
        );
      }
    }

    currentVersion = 4;
  }

  if (currentVersion === 4) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        kind TEXT NOT NULL,
        label TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        position INTEGER NOT NULL DEFAULT 0
      );
    `);

    // The categories that used to be hard-coded, so existing expenses and incomes keep
    // pointing at valid ids. `otros` / `otros_ingreso` sort last and act as the fallback.
    const builtins = [
      ['comida', 'gasto', 'Comida', 'UtensilsCrossed', '#f97316', 0],
      ['transporte', 'gasto', 'Transporte', 'Car', '#0ea5e9', 1],
      ['hogar', 'gasto', 'Hogar', 'House', '#14b8a6', 2],
      ['compras', 'gasto', 'Compras', 'ShoppingBag', '#a855f7', 3],
      ['salud', 'gasto', 'Salud', 'HeartPulse', '#ef4444', 4],
      ['ocio', 'gasto', 'Ocio', 'Clapperboard', '#ec4899', 5],
      ['servicios', 'gasto', 'Servicios', 'Zap', '#eab308', 6],
      ['educacion', 'gasto', 'Educación', 'GraduationCap', '#22c55e', 7],
      ['otros', 'gasto', 'Otros', 'Ellipsis', '#94a3b8', 1000],
      ['salario', 'ingreso', 'Salario', 'Wallet', '#22c55e', 0],
      ['freelance', 'ingreso', 'Freelance', 'Laptop', '#0ea5e9', 1],
      ['inversiones', 'ingreso', 'Inversiones', 'TrendingUp', '#a855f7', 2],
      ['negocio', 'ingreso', 'Negocio', 'Briefcase', '#f97316', 3],
      ['regalo', 'ingreso', 'Regalo', 'Gift', '#ec4899', 4],
      ['reembolso', 'ingreso', 'Reembolso', 'RefreshCcw', '#eab308', 5],
      ['otros_ingreso', 'ingreso', 'Otros', 'Landmark', '#94a3b8', 1000],
    ] as const;

    for (const [id, kind, label, icon, color, position] of builtins) {
      await db.runAsync(
        'INSERT OR IGNORE INTO categories (id, kind, label, icon, color, position) VALUES (?, ?, ?, ?, ?, ?)',
        id,
        kind,
        label,
        icon,
        color,
        position
      );
    }

    currentVersion = 5;
  }

  if (currentVersion === 5) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS todo_lists (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS todo_tasks (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        list_id TEXT,
        due_date TEXT,
        reminder_at TEXT,
        notification_id TEXT,
        file_uri TEXT,
        file_name TEXT,
        completed INTEGER NOT NULL DEFAULT 0,
        favorite INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_todo_tasks_due_date ON todo_tasks (due_date);
      CREATE INDEX IF NOT EXISTS idx_todo_tasks_list_id ON todo_tasks (list_id);
    `);

    currentVersion = 6;
  }

  await db.execAsync(`PRAGMA user_version = ${currentVersion}`);
}
