import { createIncome } from '@/lib/db/incomes';
import { queryKeys } from '@/lib/query-keys';
import type { IncomeFormValues } from '@/lib/schemas/income';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

export function useCreateIncome() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: IncomeFormValues) => createIncome(db, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.incomes }),
  });
}
