import type { CategoryId } from '@/lib/categories';
import type { Expense } from '@/lib/schemas/expense';
import type { Income } from '@/lib/schemas/income';

export type TransactionKind = 'gasto' | 'ingreso';

/** A `gasto` (expense) or `ingreso` (income), tagged so the UI can render/filter either. */
export type Transaction = (Expense | Income) & { kind: TransactionKind };

/** Type filter for the home screen: `'todos'` means both gastos and ingresos. */
export type TypeFilter = 'todos' | TransactionKind;

/** Category filter for the home screen: `'todas'` means every category. */
export type CategoryFilter = 'todas' | CategoryId;

export function mergeTransactions(expenses: Expense[], incomes: Income[]): Transaction[] {
  const tagged: Transaction[] = [
    ...expenses.map((expense) => ({ ...expense, kind: 'gasto' as const })),
    ...incomes.map((income) => ({ ...income, kind: 'ingreso' as const })),
  ];

  return tagged.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

export function filterTransactions(
  transactions: Transaction[],
  { type, categoryId }: { type: TypeFilter; categoryId: CategoryFilter }
): Transaction[] {
  return transactions.filter((transaction) => {
    if (type !== 'todos' && transaction.kind !== type) return false;
    if (categoryId !== 'todas' && transaction.categoryId !== categoryId) return false;
    return true;
  });
}

export type CategoryTotal = {
  categoryId: CategoryId;
  kind: TransactionKind;
  total: number;
  count: number;
};

/** Collapses transactions into one row per category, summing their totals. */
export function groupTransactionsByCategory(transactions: Transaction[]): CategoryTotal[] {
  const totals = new Map<CategoryId, CategoryTotal>();

  for (const transaction of transactions) {
    const amount = Number.isFinite(transaction.total) ? transaction.total : 0;
    const existing = totals.get(transaction.categoryId);

    if (existing) {
      existing.total += amount;
      existing.count += 1;
    } else {
      totals.set(transaction.categoryId, {
        categoryId: transaction.categoryId,
        kind: transaction.kind,
        total: amount,
        count: 1,
      });
    }
  }

  return [...totals.values()].sort((a, b) => b.total - a.total);
}

/** Ingresos - gastos for the given transactions (positive means net income). */
export function sumNet(transactions: Transaction[]): number {
  return transactions.reduce((total, transaction) => {
    const amount = Number.isFinite(transaction.total) ? transaction.total : 0;
    return total + (transaction.kind === 'ingreso' ? amount : -amount);
  }, 0);
}
