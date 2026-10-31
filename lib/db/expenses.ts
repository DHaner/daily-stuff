import { expenseSchema, type Expense, type ExpenseFormValues } from '@/lib/schemas/expense';
import type { SQLiteDatabase } from 'expo-sqlite';

type ExpenseRow = {
  id: string;
  concept: string;
  total: number;
  description: string;
  category_id: string;
  date: string;
  created_at: string;
  updated_at: string;
};

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function toExpense(row: ExpenseRow): Expense {
  return expenseSchema.parse({
    id: row.id,
    concept: row.concept,
    total: row.total,
    description: row.description,
    categoryId: row.category_id,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export async function listExpensesByDate(db: SQLiteDatabase, date: string): Promise<Expense[]> {
  const rows = await db.getAllAsync<ExpenseRow>(
    'SELECT * FROM expenses WHERE date = ? ORDER BY created_at DESC',
    date
  );

  return rows.map(toExpense);
}

export async function listExpensesByDateRange(
  db: SQLiteDatabase,
  start: string,
  end: string
): Promise<Expense[]> {
  const rows = await db.getAllAsync<ExpenseRow>(
    'SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date DESC, created_at DESC',
    start,
    end
  );

  return rows.map(toExpense);
}

export async function listExpensesByCategory(
  db: SQLiteDatabase,
  categoryId: string
): Promise<Expense[]> {
  const rows = await db.getAllAsync<ExpenseRow>(
    'SELECT * FROM expenses WHERE category_id = ? ORDER BY date DESC, created_at DESC',
    categoryId
  );

  return rows.map(toExpense);
}

export async function getExpenseById(db: SQLiteDatabase, id: string): Promise<Expense | null> {
  const row = await db.getFirstAsync<ExpenseRow>('SELECT * FROM expenses WHERE id = ?', id);

  if (!row) {
    return null;
  }

  return toExpense(row);
}

export async function createExpense(
  db: SQLiteDatabase,
  values: ExpenseFormValues
): Promise<Expense> {
  const id = createId();
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO expenses (id, concept, total, description, category_id, date, created_at, updated_at)
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
  });

  const created = await getExpenseById(db, id);

  if (!created) {
    throw new Error('No se pudo crear el gasto');
  }

  return created;
}

export async function updateExpense(
  db: SQLiteDatabase,
  id: string,
  values: ExpenseFormValues
): Promise<Expense> {
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE expenses
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
  });

  const updated = await getExpenseById(db, id);

  if (!updated) {
    throw new Error('No se encontró el gasto que intentas actualizar');
  }

  return updated;
}

export async function deleteExpense(db: SQLiteDatabase, id: string): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM expenses WHERE id = ?', id);
  });
}

/** Days that already have at least one expense, used to dot the calendar. */
export async function listDaysWithExpenses(db: SQLiteDatabase): Promise<string[]> {
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT DISTINCT date FROM expenses ORDER BY date DESC'
  );

  return rows.map((row) => row.date);
}
