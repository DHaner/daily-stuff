import {
  createIncome,
  deleteTransaction,
  getIncomeById,
  listDaysWithIncomes,
  listIncomesByCategory,
  listIncomesByDateRange,
  updateIncome,
} from '@/lib/api/transactions';
import type { DayKey } from '@/lib/date';
import { queryKeys } from '@/lib/query-keys';
import type { Income, IncomeFormValues } from '@/lib/schemas/income';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useIncomesByRange(start: DayKey, end: DayKey, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.incomesByRange(start, end),
    queryFn: () => listIncomesByDateRange(start, end),
    enabled: options?.enabled ?? true,
  });
}

export function useIncomesByCategory(categoryId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.incomesByCategory(categoryId),
    queryFn: () => listIncomesByCategory(categoryId),
    enabled: options?.enabled ?? true,
  });
}

export function useIncome(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.income(id ?? ''),
    queryFn: () => getIncomeById(id as string),
    enabled: Boolean(id),
  });
}

export function useDaysWithIncomes() {
  return useQuery({
    queryKey: queryKeys.daysWithIncomes,
    queryFn: listDaysWithIncomes,
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IncomeFormValues) => createIncome(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.incomes }),
  });
}

export function useUpdateIncome(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IncomeFormValues) => updateIncome(id, values),
    onSuccess: (income: Income) => {
      queryClient.setQueryData(queryKeys.income(id), income);
      return queryClient.invalidateQueries({ queryKey: queryKeys.incomes });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.incomes }),
  });
}
