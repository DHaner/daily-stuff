import { setCategories, type CategoryKind } from '@/lib/categories';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  type CategoryFormValues,
} from '@/lib/db/categories';
import { queryKeys } from '@/lib/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

/**
 * After any change, reload the category registry (which re-renders every component using
 * `useCategories`) and refetch transactions, since a deleted category reassigns them.
 */
function useAfterCategoryChange() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return async () => {
    setCategories(await listCategories(db));
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses }),
      queryClient.invalidateQueries({ queryKey: queryKeys.incomes }),
    ]);
  };
}

export function useCreateCategory() {
  const db = useSQLiteContext();
  const afterChange = useAfterCategoryChange();

  return useMutation({
    mutationFn: ({ kind, values }: { kind: CategoryKind; values: CategoryFormValues }) =>
      createCategory(db, kind, values),
    onSuccess: afterChange,
  });
}

export function useUpdateCategory() {
  const db = useSQLiteContext();
  const afterChange = useAfterCategoryChange();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: CategoryFormValues }) =>
      updateCategory(db, id, values),
    onSuccess: afterChange,
  });
}

export function useDeleteCategory() {
  const db = useSQLiteContext();
  const afterChange = useAfterCategoryChange();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(db, id),
    onSuccess: afterChange,
  });
}
