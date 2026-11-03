import { api } from '@/lib/api/client';
import type { CategoryKind, CategoryRecord } from '@/lib/categories';

export type CategoryFormValues = {
  label: string;
  iconName: string;
  color: string;
};

type ApiCategory = {
  id: string;
  kind: 'expense' | 'income';
  label: string;
  icon: string;
  color: string;
  position: number;
};

export const toApiKind = (kind: CategoryKind) => (kind === 'gasto' ? 'expense' : 'income');

function toRecord(category: ApiCategory): CategoryRecord {
  return {
    id: category.id,
    kind: category.kind === 'expense' ? 'gasto' : 'ingreso',
    label: category.label,
    iconName: category.icon,
    color: category.color,
    position: category.position,
  };
}

export async function listCategories(): Promise<CategoryRecord[]> {
  return (await api<ApiCategory[]>('/categories')).map(toRecord);
}

export async function createCategory(kind: CategoryKind, values: CategoryFormValues) {
  await api('/categories', {
    method: 'POST',
    body: { kind: toApiKind(kind), label: values.label, icon: values.iconName, color: values.color },
  });
}

/** A category never changes kind, so the server ignores `kind` on update. */
export async function updateCategory(id: string, values: CategoryFormValues) {
  await api(`/categories/${id}`, {
    method: 'PUT',
    body: { kind: 'expense', label: values.label, icon: values.iconName, color: values.color },
  });
}

/** The server moves everything that used the category to the default category of its kind. */
export async function deleteCategory(id: string) {
  await api(`/categories/${id}`, { method: 'DELETE' });
}
