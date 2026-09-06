import { incomeSchema, type Income, type IncomeFormValues } from '@/lib/schemas/income';
import type { SQLiteDatabase } from 'expo-sqlite';

type IncomeRow = {
  id: string;
  concept: string;
  total: number;
  description: string;
  category_id: string;
  date: string;
  created_at: string;
  updated_at: string;
};

type IncomeItemRow = {
  id: string;
  income_id: string;
  concept: string;
  amount: number;
  description: string;
  category_id: string;
  position: number;
};

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function toIncome(row: IncomeRow, itemRows: IncomeItemRow[]): Income {
  return incomeSchema.parse({
    id: row.id,
    concept: row.concept,
    total: row.total,
    description: row.description,
    categoryId: row.category_id,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: itemRows.map((item) => ({
      id: item.id,
      concept: item.concept,
      amount: item.amount,
      description: item.description,
      categoryId: item.category_id,
    })),
  });
}

function groupItemsByIncome(rows: IncomeItemRow[]) {
  return rows.reduce<Record<string, IncomeItemRow[]>>((acc, row) => {
    (acc[row.income_id] ??= []).push(row);
    return acc;
  }, {});
}

export async function listIncomesByDateRange(
  db: SQLiteDatabase,
  start: string,
  end: string
): Promise<Income[]> {
  const rows = await db.getAllAsync<IncomeRow>(
    'SELECT * FROM incomes WHERE date BETWEEN ? AND ? ORDER BY date DESC, created_at DESC',
    start,
    end
  );

  if (rows.length === 0) {
    return [];
  }

  const placeholders = rows.map(() => '?').join(', ');
  const itemRows = await db.getAllAsync<IncomeItemRow>(
    `SELECT * FROM income_items WHERE income_id IN (${placeholders}) ORDER BY position ASC`,
    ...rows.map((row) => row.id)
  );
  const itemsByIncome = groupItemsByIncome(itemRows);

  return rows.map((row) => toIncome(row, itemsByIncome[row.id] ?? []));
}

/** Days that already have at least one income, used to dot the calendar. */
export async function listDaysWithIncomes(db: SQLiteDatabase): Promise<string[]> {
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT DISTINCT date FROM incomes ORDER BY date DESC'
  );

  return rows.map((row) => row.date);
}

export async function listIncomesByCategory(
  db: SQLiteDatabase,
  categoryId: string
): Promise<Income[]> {
  const rows = await db.getAllAsync<IncomeRow>(
    'SELECT * FROM incomes WHERE category_id = ? ORDER BY date DESC, created_at DESC',
    categoryId
  );

  if (rows.length === 0) {
    return [];
  }

  const placeholders = rows.map(() => '?').join(', ');
  const itemRows = await db.getAllAsync<IncomeItemRow>(
    `SELECT * FROM income_items WHERE income_id IN (${placeholders}) ORDER BY position ASC`,
    ...rows.map((row) => row.id)
  );
  const itemsByIncome = groupItemsByIncome(itemRows);

  return rows.map((row) => toIncome(row, itemsByIncome[row.id] ?? []));
}

export async function getIncomeById(db: SQLiteDatabase, id: string): Promise<Income | null> {
  const row = await db.getFirstAsync<IncomeRow>('SELECT * FROM incomes WHERE id = ?', id);

  if (!row) {
    return null;
  }

  const itemRows = await db.getAllAsync<IncomeItemRow>(
    'SELECT * FROM income_items WHERE income_id = ? ORDER BY position ASC',
    id
  );

  return toIncome(row, itemRows);
}

async function replaceItems(db: SQLiteDatabase, incomeId: string, values: IncomeFormValues) {
  await db.runAsync('DELETE FROM income_items WHERE income_id = ?', incomeId);

  for (const [index, item] of values.items.entries()) {
    await db.runAsync(
      `INSERT INTO income_items (id, income_id, concept, amount, description, category_id, position)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      item.id || createId(),
      incomeId,
      item.concept,
      item.amount,
      item.description,
      item.categoryId,
      index
    );
  }
}

export async function createIncome(
  db: SQLiteDatabase,
  values: IncomeFormValues
): Promise<Income> {
  const id = createId();
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO incomes (id, concept, total, description, category_id, date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      values.concept,
      values.total,
      values.description,
      values.categoryId,
      values.date,
      now,
      now
    );

    await replaceItems(db, id, values);
  });

  const created = await getIncomeById(db, id);

  if (!created) {
    throw new Error('No se pudo crear el ingreso');
  }

  return created;
}

export async function updateIncome(
  db: SQLiteDatabase,
  id: string,
  values: IncomeFormValues
): Promise<Income> {
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE incomes
       SET concept = ?, total = ?, description = ?, category_id = ?, date = ?, updated_at = ?
       WHERE id = ?`,
      values.concept,
      values.total,
      values.description,
      values.categoryId,
      values.date,
      now,
      id
    );
    await replaceItems(db, id, values);
  });

  const updated = await getIncomeById(db, id);

  if (!updated) {
    throw new Error('No se encontró el ingreso que intentas actualizar');
  }

  return updated;
}

export async function deleteIncome(db: SQLiteDatabase, id: string): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM income_items WHERE income_id = ?', id);
    await db.runAsync('DELETE FROM incomes WHERE id = ?', id);
  });
}
