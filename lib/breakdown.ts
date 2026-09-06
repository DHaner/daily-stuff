import { getCategory, type CategoryId } from '@/lib/categories';
import type { Expense, ExpenseItem } from '@/lib/schemas/expense';
import type { Transaction } from '@/lib/transactions';

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
 * Splits transactions by type (income/expense) for the doughnut chart.
 * Used when typeFilter is 'todos': green for income, red for expenses.
 */
export function getTypeBreakdown(transactions: Transaction[]): CategorySlice[] {
  let incomeTotal = 0;
  let expenseTotal = 0;

  for (const transaction of transactions) {
    const amount = Number.isFinite(transaction.total) ? transaction.total : 0;
    if (amount <= 0) continue;

    if (transaction.kind === 'ingreso') {
      incomeTotal += amount;
    } else {
      expenseTotal += amount;
    }
  }

  const grandTotal = incomeTotal + expenseTotal;
  const slices: CategorySlice[] = [];

  if (incomeTotal > 0) {
    slices.push({
      categoryId: 'salario' as CategoryId,
      label: 'Ingresos',
      color: '#22c55e',
      amount: incomeTotal,
      percentage: grandTotal > 0 ? (incomeTotal / grandTotal) * 100 : 0,
    });
  }

  if (expenseTotal > 0) {
    slices.push({
      categoryId: 'otros' as CategoryId,
      label: 'Gastos',
      color: '#ef4444',
      amount: expenseTotal,
      percentage: grandTotal > 0 ? (expenseTotal / grandTotal) * 100 : 0,
    });
  }

  return slices;
}

/**
 * Splits a day's spending into category slices for the doughnut chart.
 *
 * A composed expense (e.g. one Amazon order with three products) is broken down by
 * its items' own categories; whatever the items don't cover — shipping, taxes,
 * rounding — falls back to the parent expense's category.
 */
export function getCategoryBreakdown(expenses: (Expense | Transaction)[]): CategorySlice[] {
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
