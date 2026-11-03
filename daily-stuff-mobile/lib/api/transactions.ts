import { api, apiOrNull } from '@/lib/api/client';
import type { Expense, ExpenseFormValues } from '@/lib/schemas/expense';
import { expenseSchema } from '@/lib/schemas/expense';
import type { Income, IncomeFormValues } from '@/lib/schemas/income';
import { incomeSchema } from '@/lib/schemas/income';

/** The API keeps expenses and incomes in one table; the app still models them separately. */
type ApiKind = 'expense' | 'income';

type ApiTransaction = {
  id: string;
  kind: ApiKind;
  concept: string;
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

type Values = ExpenseFormValues | IncomeFormValues;

function toRecord(transaction: ApiTransaction) {
  return {
    id: transaction.id,
    concept: transaction.concept,
    total: transaction.amount,
    description: transaction.description,
    categoryId: transaction.categoryId,
    date: transaction.date,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  };
}

const toExpense = (transaction: ApiTransaction): Expense => expenseSchema.parse(toRecord(transaction));
const toIncome = (transaction: ApiTransaction): Income => incomeSchema.parse(toRecord(transaction));

function toBody(kind: ApiKind, values: Values) {
  return {
    kind,
    concept: values.concept,
    amount: values.total,
    description: values.description,
    categoryId: values.categoryId,
    date: values.date,
  };
}

function query(kind: ApiKind, filters: { from?: string; to?: string; categoryId?: string }) {
  const params = new URLSearchParams({ kind });

  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }

  return `/transactions?${params}`;
}

// ── Expenses ───────────────────────────────────────────────────────────────

export async function listExpensesByDate(date: string): Promise<Expense[]> {
  return (await api<ApiTransaction[]>(query('expense', { from: date, to: date }))).map(toExpense);
}

export async function listExpensesByDateRange(start: string, end: string): Promise<Expense[]> {
  return (await api<ApiTransaction[]>(query('expense', { from: start, to: end }))).map(toExpense);
}

export async function listExpensesByCategory(categoryId: string): Promise<Expense[]> {
  return (await api<ApiTransaction[]>(query('expense', { categoryId }))).map(toExpense);
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  const transaction = await apiOrNull<ApiTransaction>(`/transactions/${id}`);

  return transaction && transaction.kind === 'expense' ? toExpense(transaction) : null;
}

export async function createExpense(values: ExpenseFormValues): Promise<Expense> {
  return toExpense(
    await api<ApiTransaction>('/transactions', { method: 'POST', body: toBody('expense', values) })
  );
}

export async function updateExpense(id: string, values: ExpenseFormValues): Promise<Expense> {
  return toExpense(
    await api<ApiTransaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: toBody('expense', values),
    })
  );
}

/** Days that already have at least one expense, used to dot the calendar. */
export function listDaysWithExpenses(): Promise<string[]> {
  return api<string[]>('/transactions/days?kind=expense');
}

// ── Incomes ────────────────────────────────────────────────────────────────

export async function listIncomesByDateRange(start: string, end: string): Promise<Income[]> {
  return (await api<ApiTransaction[]>(query('income', { from: start, to: end }))).map(toIncome);
}

export async function listIncomesByCategory(categoryId: string): Promise<Income[]> {
  return (await api<ApiTransaction[]>(query('income', { categoryId }))).map(toIncome);
}

export async function getIncomeById(id: string): Promise<Income | null> {
  const transaction = await apiOrNull<ApiTransaction>(`/transactions/${id}`);

  return transaction && transaction.kind === 'income' ? toIncome(transaction) : null;
}

export async function createIncome(values: IncomeFormValues): Promise<Income> {
  return toIncome(
    await api<ApiTransaction>('/transactions', { method: 'POST', body: toBody('income', values) })
  );
}

export async function updateIncome(id: string, values: IncomeFormValues): Promise<Income> {
  return toIncome(
    await api<ApiTransaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: toBody('income', values),
    })
  );
}

export function listDaysWithIncomes(): Promise<string[]> {
  return api<string[]>('/transactions/days?kind=income');
}

// ── Shared ─────────────────────────────────────────────────────────────────

export async function deleteTransaction(id: string): Promise<void> {
  await api(`/transactions/${id}`, { method: 'DELETE' });
}
