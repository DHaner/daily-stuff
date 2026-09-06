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

type ExpenseItemRow = {
  id: string;
  expense_id: string;
  concept: string;
  amount: number;
  description: string;
  category_id: string;
  position: number;
};

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function toExpense(row: ExpenseRow, itemRows: ExpenseItemRow[]): Expense {
  return expenseSchema.parse({
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

function groupItemsByExpense(rows: ExpenseItemRow[]) {
  return rows.reduce<Record<string, ExpenseItemRow[]>>((acc, row) => {
    (acc[row.expense_id] ??= []).push(row);
    return acc;
  }, {});
}

export async function listExpensesByDate(db: SQLiteDatabase, date: string): Promise<Expense[]> {
  const rows = await db.getAllAsync<ExpenseRow>(
    'SELECT * FROM expenses WHERE date = ? ORDER BY created_at DESC',
    date
  );

  if (rows.length === 0) {
    return [];
  }

  const placeholders = rows.map(() => '?').join(', ');
  const itemRows = await db.getAllAsync<ExpenseItemRow>(
    `SELECT * FROM expense_items WHERE expense_id IN (${placeholders}) ORDER BY position ASC`,
    ...rows.map((row) => row.id)
  );
  const itemsByExpense = groupItemsByExpense(itemRows);

  return rows.map((row) => toExpense(row, itemsByExpense[row.id] ?? []));
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

  if (rows.length === 0) {
    return [];
  }

  const placeholders = rows.map(() => '?').join(', ');
  const itemRows = await db.getAllAsync<ExpenseItemRow>(
    `SELECT * FROM expense_items WHERE expense_id IN (${placeholders}) ORDER BY position ASC`,
    ...rows.map((row) => row.id)
  );
  const itemsByExpense = groupItemsByExpense(itemRows);

  return rows.map((row) => toExpense(row, itemsByExpense[row.id] ?? []));
}

export async function getExpenseById(db: SQLiteDatabase, id: string): Promise<Expense | null> {
  const row = await db.getFirstAsync<ExpenseRow>('SELECT * FROM expenses WHERE id = ?', id);

  if (!row) {
    return null;
  }

  const itemRows = await db.getAllAsync<ExpenseItemRow>(
    'SELECT * FROM expense_items WHERE expense_id = ? ORDER BY position ASC',
    id
  );

  return toExpense(row, itemRows);
}

async function replaceItems(db: SQLiteDatabase, expenseId: string, values: ExpenseFormValues) {
  await db.runAsync('DELETE FROM expense_items WHERE expense_id = ?', expenseId);

  for (const [index, item] of values.items.entries()) {
    await db.runAsync(
      `INSERT INTO expense_items (id, expense_id, concept, amount, description, category_id, position)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      item.id || createId(),
      expenseId,
      item.concept,
      item.amount,
      item.description,
      item.categoryId,
      index
    );
  }
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
    await replaceItems(db, id, values);
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
    await replaceItems(db, id, values);
  });

  const updated = await getExpenseById(db, id);

  if (!updated) {
    throw new Error('No se encontró el gasto que intentas actualizar');
  }

  return updated;
}

export async function deleteExpense(db: SQLiteDatabase, id: string): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM expense_items WHERE expense_id = ?', id);
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
