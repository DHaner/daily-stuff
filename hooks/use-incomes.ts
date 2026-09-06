import {
  createIncome,
  deleteIncome,
  getIncomeById,
  listDaysWithIncomes,
  listIncomesByCategory,
  listIncomesByDateRange,
  updateIncome,
} from '@/lib/db/incomes';
import type { DayKey } from '@/lib/date';
import { queryKeys } from '@/lib/query-keys';
import type { Income, IncomeFormValues } from '@/lib/schemas/income';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

export function useIncomesByRange(start: DayKey, end: DayKey, options?: { enabled?: boolean }) {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: queryKeys.incomesByRange(start, end),
    queryFn: () => listIncomesByDateRange(db, start, end),
    enabled: options?.enabled ?? true,
  });
}

export function useIncomesByCategory(categoryId: string, options?: { enabled?: boolean }) {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: queryKeys.incomesByCategory(categoryId),
    queryFn: () => listIncomesByCategory(db, categoryId),
    enabled: options?.enabled ?? true,
  });
}

export function useIncome(id: string | undefined) {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: queryKeys.income(id ?? ''),
    queryFn: () => getIncomeById(db, id as string),
    enabled: Boolean(id),
  });
}

export function useDaysWithIncomes() {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: queryKeys.daysWithIncomes,
    queryFn: () => listDaysWithIncomes(db),
  });
}

export function useCreateIncome() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IncomeFormValues) => createIncome(db, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.incomes }),
  });
}

export function useUpdateIncome(id: string) {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IncomeFormValues) => updateIncome(db, id, values),
    onSuccess: (income: Income) => {
      queryClient.setQueryData(queryKeys.income(id), income);
      return queryClient.invalidateQueries({ queryKey: queryKeys.incomes });
    },
  });
}

export function useDeleteIncome() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteIncome(db, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.incomes }),
  });
}
