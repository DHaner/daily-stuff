import {
  createExpense,
  deleteExpense,
  getExpenseById,
  listDaysWithExpenses,
  listExpensesByDate,
  updateExpense,
} from '@/lib/db/expenses';
import type { DayKey } from '@/lib/date';
import { queryKeys } from '@/lib/query-keys';
import type { Expense, ExpenseFormValues } from '@/lib/schemas/expense';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

export function useExpensesByDay(day: DayKey) {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: queryKeys.expensesByDay(day),
    queryFn: () => listExpensesByDate(db, day),
  });
}

export function useExpense(id: string | undefined) {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: queryKeys.expense(id ?? ''),
    queryFn: () => getExpenseById(db, id as string),
    enabled: Boolean(id),
  });
}

export function useDaysWithExpenses() {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: queryKeys.daysWithExpenses,
    queryFn: () => listDaysWithExpenses(db),
  });
}

/** Every mutation touches the same day buckets, so invalidate the whole `expenses` tree. */
function useInvalidateExpenses() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
}

export function useCreateExpense() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateExpenses();

  return useMutation({
    mutationFn: (values: ExpenseFormValues) => createExpense(db, values),
    onSuccess: invalidate,
  });
}

export function useUpdateExpense(id: string) {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ExpenseFormValues) => updateExpense(db, id, values),
    onSuccess: (expense: Expense) => {
      queryClient.setQueryData(queryKeys.expense(id), expense);
      return queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
    },
  });
}

export function useDeleteExpense() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateExpenses();

  return useMutation({
    mutationFn: (id: string) => deleteExpense(db, id),
    onSuccess: invalidate,
  });
}
