import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  type CategoryFormValues,
} from '@/lib/api/categories';
import { setCategories, type CategoryKind } from '@/lib/categories';
import { queryKeys } from '@/lib/query-keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

/**
 * Loads the categories from the API and mirrors them into the in-memory registry that
 * `getCategory` / `useCategories` read. Mount it once, near the root.
 */
export function useCategoriesSync() {
  const query = useQuery({ queryKey: queryKeys.categories, queryFn: listCategories });

  React.useEffect(() => {
    if (query.data) {
      setCategories(query.data);
    }
  }, [query.data]);

  return query;
}

/**
 * After any change, reload the category registry (which re-renders every component using
 * `useCategories`) and refetch transactions, since a deleted category reassigns them.
 */
function useAfterCategoryChange() {
  const queryClient = useQueryClient();

  return async () => {
    setCategories(
      await queryClient.fetchQuery({
        queryKey: queryKeys.categories,
        queryFn: listCategories,
        staleTime: 0,
      })
    );
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses }),
      queryClient.invalidateQueries({ queryKey: queryKeys.incomes }),
    ]);
  };
}

export function useCreateCategory() {
  const afterChange = useAfterCategoryChange();

  return useMutation({
    mutationFn: ({ kind, values }: { kind: CategoryKind; values: CategoryFormValues }) =>
      createCategory(kind, values),
    onSuccess: afterChange,
  });
}

export function useUpdateCategory() {
  const afterChange = useAfterCategoryChange();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: CategoryFormValues }) =>
      updateCategory(id, values),
    onSuccess: afterChange,
  });
}

export function useDeleteCategory() {
  const afterChange = useAfterCategoryChange();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: afterChange,
  });
}
