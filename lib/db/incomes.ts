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

    for (const [index, item] of values.items.entries()) {
      await db.runAsync(
        `INSERT INTO income_items (id, income_id, concept, amount, description, category_id, position)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        item.id || createId(),
        id,
        item.concept,
        item.amount,
        item.description,
        item.categoryId,
        index
      );
    }
  });

  const created = await getIncomeById(db, id);

  if (!created) {
    throw new Error('No se pudo crear el ingreso');
  }

  return created;
}
