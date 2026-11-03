import {
  createExpense,
  deleteTransaction,
  getExpenseById,
  listDaysWithExpenses,
  listExpensesByCategory,
  listExpensesByDate,
  listExpensesByDateRange,
  updateExpense,
} from '@/lib/api/transactions';
import type { DayKey } from '@/lib/date';
import { queryKeys } from '@/lib/query-keys';
import type { Expense, ExpenseFormValues } from '@/lib/schemas/expense';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useExpensesByDay(day: DayKey) {
  return useQuery({
    queryKey: queryKeys.expensesByDay(day),
    queryFn: () => listExpensesByDate(day),
  });
}

export function useExpensesByRange(start: DayKey, end: DayKey, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.expensesByRange(start, end),
    queryFn: () => listExpensesByDateRange(start, end),
    enabled: options?.enabled ?? true,
  });
}

export function useExpensesByCategory(categoryId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.expensesByCategory(categoryId),
    queryFn: () => listExpensesByCategory(categoryId),
    enabled: options?.enabled ?? true,
  });
}

export function useExpense(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.expense(id ?? ''),
    queryFn: () => getExpenseById(id as string),
    enabled: Boolean(id),
  });
}

export function useDaysWithExpenses() {
  return useQuery({
    queryKey: queryKeys.daysWithExpenses,
    queryFn: listDaysWithExpenses,
  });
}

/** Every mutation touches the same day buckets, so invalidate the whole `expenses` tree. */
function useInvalidateExpenses() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
}

export function useCreateExpense() {
  const invalidate = useInvalidateExpenses();

  return useMutation({
    mutationFn: (values: ExpenseFormValues) => createExpense(values),
    onSuccess: invalidate,
  });
}

export function useUpdateExpense(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ExpenseFormValues) => updateExpense(id, values),
    onSuccess: (expense: Expense) => {
      queryClient.setQueryData(queryKeys.expense(id), expense);
      return queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
    },
  });
}

export function useDeleteExpense() {
  const invalidate = useInvalidateExpenses();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: invalidate,
  });
}
