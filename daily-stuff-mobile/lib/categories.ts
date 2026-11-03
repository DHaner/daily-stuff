import { getLabelIcon } from '@/lib/journal-icons';
import type { LucideIcon } from 'lucide-react-native';
import * as React from 'react';

/** Categories are user-editable and stored on the server, so ids are plain strings. */
export type CategoryId = string;

/** `gasto` categories apply to expenses, `ingreso` categories to incomes. */
export type CategoryKind = 'gasto' | 'ingreso';

/** A category as stored on the server. */
export type CategoryRecord = {
  id: CategoryId;
  kind: CategoryKind;
  label: string;
  /** Key of the Lucide icon, e.g. `Car`. */
  iconName: string;
  /** Hex color: consumed by react-native-chart-kit, which cannot read Tailwind classes. */
  color: string;
  position: number;
};

export type Category = CategoryRecord & { icon: LucideIcon };

/** Fallback categories: they can be edited but never deleted. */
export const DEFAULT_CATEGORY: CategoryId = 'otros';
export const DEFAULT_INCOME_CATEGORY: CategoryId = 'otros_ingreso';

export function getDefaultCategoryId(kind: CategoryKind): CategoryId {
  return kind === 'gasto' ? DEFAULT_CATEGORY : DEFAULT_INCOME_CATEGORY;
}

export function isDefaultCategory(id: CategoryId) {
  return id === DEFAULT_CATEGORY || id === DEFAULT_INCOME_CATEGORY;
}

/**
 * The fallback rows the server always has. It is only what the app shows before the categories
 * are loaded (`CategoriesGate` waits for them before the first screen).
 */
const FALLBACK_RECORDS: CategoryRecord[] = [
  {
    id: 'otros',
    kind: 'gasto',
    label: 'Otros',
    iconName: 'Ellipsis',
    color: '#94a3b8',
    position: 1000,
  },
  {
    id: 'otros_ingreso',
    kind: 'ingreso',
    label: 'Otros',
    iconName: 'Landmark',
    color: '#94a3b8',
    position: 1000,
  },
];

function toCategory(record: CategoryRecord): Category {
  return { ...record, icon: getLabelIcon(record.iconName) };
}

// A module-level registry keeps `getCategory` synchronous for pure helpers (breakdown,
// cards); `useCategories` subscribes components so they re-render when it changes.
let registry: Category[] = FALLBACK_RECORDS.map(toCategory);
let registryById = new Map(registry.map((category) => [category.id, category]));
let version = 0;
const listeners = new Set<() => void>();

/** Replaces every known category (called after loading from, or writing to, the API). */
export function setCategories(records: CategoryRecord[]) {
  registry = [...records].sort((a, b) => a.position - b.position).map(toCategory);
  registryById = new Map(registry.map((category) => [category.id, category]));
  version += 1;
  listeners.forEach((listener) => listener());
}

export function getCategory(id: string): Category {
  const category = registryById.get(id);

  if (category) return category;

  return registryById.get(DEFAULT_CATEGORY) ?? registry[0];
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * The current categories, split by kind. Components that render a category should call
 * this (even if they only use `getCategory`) so they update when categories are edited.
 * `version` changes on every edit, for use in memo dependencies.
 */
export function useCategories() {
  const currentVersion = React.useSyncExternalStore(subscribe, () => version);

  return React.useMemo(
    () => ({
      expense: registry.filter((category) => category.kind === 'gasto'),
      income: registry.filter((category) => category.kind === 'ingreso'),
      version: currentVersion,
    }),
    [currentVersion]
  );
}
