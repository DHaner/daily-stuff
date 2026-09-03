import { getCategory, type CategoryId } from '@/lib/categories';
import type { Expense, ExpenseItem } from '@/lib/schemas/expense';

export type CategorySlice = {
  categoryId: CategoryId;
  label: string;
  color: string;
  amount: number;
  percentage: number;
};

export function sumItems(items: Pick<ExpenseItem, 'amount'>[]) {
  return items.reduce((total, item) => total + (Number.isFinite(item.amount) ? item.amount : 0), 0);
}

export function sumExpenses(expenses: Pick<Expense, 'total'>[]) {
  return expenses.reduce(
    (total, expense) => total + (Number.isFinite(expense.total) ? expense.total : 0),
    0
  );
}

/**
 * Splits a day's spending into category slices for the doughnut chart.
 *
 * A composed expense (e.g. one Amazon order with three products) is broken down by
 * its items' own categories; whatever the items don't cover — shipping, taxes,
 * rounding — falls back to the parent expense's category.
 */
export function getCategoryBreakdown(expenses: Expense[]): CategorySlice[] {
  const totals = new Map<CategoryId, number>();

  function add(categoryId: string, amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }
    const id = getCategory(categoryId).id;
    totals.set(id, (totals.get(id) ?? 0) + amount);
  }

  for (const expense of expenses) {
    if (expense.items.length === 0) {
      add(expense.categoryId, expense.total);
      continue;
    }

    for (const item of expense.items) {
      add(item.categoryId, item.amount);
    }

    add(expense.categoryId, expense.total - sumItems(expense.items));
  }

  const grandTotal = [...totals.values()].reduce((sum, amount) => sum + amount, 0);

  return [...totals.entries()]
    .map(([categoryId, amount]) => {
      const category = getCategory(categoryId);
      return {
        categoryId,
        label: category.label,
        color: category.color,
        amount,
        percentage: grandTotal > 0 ? (amount / grandTotal) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}
