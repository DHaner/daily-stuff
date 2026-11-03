import type { Category } from '@/api/types';

export const Categories = {
  fallbackExpense: 'otros',
  fallbackIncome: 'otros_ingreso',
  isFallback: (id: string) => id === 'otros' || id === 'otros_ingreso',
};

/** Category lookup that never fails: unknown ids render as a neutral "Otros". */
export function categoryLookup(categories: Category[]) {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const unknown: Category = { id: '', kind: 'expense', label: 'Otros', icon: 'Ellipsis', color: '#94a3b8', position: 1000 };
  return (id: string) => byId.get(id) ?? unknown;
}
