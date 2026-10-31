import { getDefaultCategoryId, type CategoryKind, type CategoryRecord } from '@/lib/categories';
import type { SQLiteDatabase } from 'expo-sqlite';

type CategoryRow = {
  id: string;
  kind: CategoryKind;
  label: string;
  icon: string;
  color: string;
  position: number;
};

export type CategoryFormValues = {
  label: string;
  iconName: string;
  color: string;
};

function createId() {
  return `cat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function toRecord(row: CategoryRow): CategoryRecord {
  return {
    id: row.id,
    kind: row.kind,
    label: row.label,
    iconName: row.icon,
    color: row.color,
    position: row.position,
  };
}

export async function listCategories(db: SQLiteDatabase): Promise<CategoryRecord[]> {
  const rows = await db.getAllAsync<CategoryRow>(
    'SELECT * FROM categories ORDER BY position ASC, label COLLATE NOCASE ASC'
  );

  return rows.map(toRecord);
}

export async function createCategory(
  db: SQLiteDatabase,
  kind: CategoryKind,
  values: CategoryFormValues
): Promise<void> {
  // New categories go after the existing ones but before the "Otros" fallback (position 1000).
  const last = await db.getFirstAsync<{ position: number | null }>(
    'SELECT MAX(position) AS position FROM categories WHERE kind = ? AND position < 1000',
    kind
  );

  await db.runAsync(
    'INSERT INTO categories (id, kind, label, icon, color, position) VALUES (?, ?, ?, ?, ?, ?)',
    createId(),
    kind,
    values.label,
    values.iconName,
    values.color,
    (last?.position ?? -1) + 1
  );
}

export async function updateCategory(
  db: SQLiteDatabase,
  id: string,
  values: CategoryFormValues
): Promise<void> {
  await db.runAsync(
    'UPDATE categories SET label = ?, icon = ?, color = ? WHERE id = ?',
    values.label,
    values.iconName,
    values.color,
    id
  );
}

/** Deletes a category, moving everything that used it to the default category of its kind. */
export async function deleteCategory(db: SQLiteDatabase, id: string): Promise<void> {
  const category = await db.getFirstAsync<{ kind: CategoryKind }>(
    'SELECT kind FROM categories WHERE id = ?',
    id
  );

  if (!category) return;

  const fallbackId = getDefaultCategoryId(category.kind);
  const table = category.kind === 'gasto' ? 'expenses' : 'incomes';

  await db.withTransactionAsync(async () => {
    await db.runAsync(`UPDATE ${table} SET category_id = ? WHERE category_id = ?`, fallbackId, id);

    await db.runAsync('DELETE FROM categories WHERE id = ?', id);
  });
}
