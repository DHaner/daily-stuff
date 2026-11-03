import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type {
  Category,
  CategoryInput,
  Dashboard,
  JournalEntry,
  JournalEntryInput,
  JournalLabel,
  JournalLabelInput,
  TodoList,
  TodoListInput,
  TodoTask,
  TodoTaskInput,
  Transaction,
  TransactionInput,
} from './types';

const EMPTY: never[] = [];

/** Mutations invalidate whole query families by their root key. */
function useMutationWith<TVars, TData = unknown>(
  fn: (vars: TVars) => Promise<TData>,
  ...roots: string[]
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => Promise.all(roots.map((root) => queryClient.invalidateQueries({ queryKey: [root] }))),
  });
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export const useDashboard = (month: string) =>
  useQuery({ queryKey: ['dashboard', month], queryFn: () => api<Dashboard>(`/dashboard?month=${month}`) });

// ── Categories ─────────────────────────────────────────────────────────────

export function useCategories() {
  const query = useQuery({ queryKey: ['categories'], queryFn: () => api<Category[]>('/categories') });
  return { ...query, categories: query.data ?? (EMPTY as Category[]) };
}

export const useCreateCategory = () =>
  useMutationWith((input: CategoryInput) => api<Category>('/categories', { method: 'POST', body: input }), 'categories');

export const useUpdateCategory = () =>
  useMutationWith(
    ({ id, ...input }: CategoryInput & { id: string }) =>
      api<Category>(`/categories/${id}`, { method: 'PUT', body: input }),
    'categories',
    'dashboard',
  );

export const useDeleteCategory = () =>
  useMutationWith(
    (id: string) => api<void>(`/categories/${id}`, { method: 'DELETE' }),
    'categories',
    'transactions',
    'dashboard',
  );

// ── Transactions ───────────────────────────────────────────────────────────

export const useTransactions = (from: string, to: string) =>
  useQuery({
    queryKey: ['transactions', from, to],
    queryFn: () => api<Transaction[]>(`/transactions?from=${from}&to=${to}`),
  });

export const useCreateTransaction = () =>
  useMutationWith(
    (input: TransactionInput) => api<Transaction>('/transactions', { method: 'POST', body: input }),
    'transactions',
    'dashboard',
  );

export const useUpdateTransaction = () =>
  useMutationWith(
    ({ id, ...input }: TransactionInput & { id: string }) =>
      api<Transaction>(`/transactions/${id}`, { method: 'PUT', body: input }),
    'transactions',
    'dashboard',
  );

export const useDeleteTransaction = () =>
  useMutationWith(
    (id: string) => api<void>(`/transactions/${id}`, { method: 'DELETE' }),
    'transactions',
    'dashboard',
  );

// ── Journal ────────────────────────────────────────────────────────────────

export function useJournalLabels() {
  const query = useQuery({ queryKey: ['journal-labels'], queryFn: () => api<JournalLabel[]>('/journal/labels') });
  return { ...query, labels: query.data ?? (EMPTY as JournalLabel[]) };
}

export const useCreateJournalLabel = () =>
  useMutationWith(
    (input: JournalLabelInput) => api<JournalLabel>('/journal/labels', { method: 'POST', body: input }),
    'journal-labels',
  );

export const useUpdateJournalLabel = () =>
  useMutationWith(
    ({ id, ...input }: JournalLabelInput & { id: string }) =>
      api<JournalLabel>(`/journal/labels/${id}`, { method: 'PUT', body: input }),
    'journal-labels',
  );

export const useDeleteJournalLabel = () =>
  useMutationWith(
    (id: string) => api<void>(`/journal/labels/${id}`, { method: 'DELETE' }),
    'journal-labels',
    'journal-entries',
  );

export const useJournalEntries = (from: string, to: string) =>
  useQuery({
    queryKey: ['journal-entries', from, to],
    queryFn: () => api<JournalEntry[]>(`/journal/entries?from=${from}&to=${to}`),
  });

export const useSaveJournalEntry = () =>
  useMutationWith(
    ({ date, ...input }: JournalEntryInput & { date: string }) =>
      api<JournalEntry>(`/journal/entries/${date}`, { method: 'PUT', body: input }),
    'journal-entries',
    'dashboard',
  );

export const useDeleteJournalEntry = () =>
  useMutationWith(
    (date: string) => api<void>(`/journal/entries/${date}`, { method: 'DELETE' }),
    'journal-entries',
    'dashboard',
  );

// ── Todos ──────────────────────────────────────────────────────────────────

export function useTodoLists() {
  const query = useQuery({ queryKey: ['todo-lists'], queryFn: () => api<TodoList[]>('/todo-lists') });
  return { ...query, lists: query.data ?? (EMPTY as TodoList[]) };
}

export const useCreateTodoList = () =>
  useMutationWith((input: TodoListInput) => api<TodoList>('/todo-lists', { method: 'POST', body: input }), 'todo-lists');

export const useUpdateTodoList = () =>
  useMutationWith(
    ({ id, ...input }: TodoListInput & { id: string }) =>
      api<TodoList>(`/todo-lists/${id}`, { method: 'PUT', body: input }),
    'todo-lists',
  );

export const useDeleteTodoList = () =>
  useMutationWith(
    (id: string) => api<void>(`/todo-lists/${id}`, { method: 'DELETE' }),
    'todo-lists',
    'todo-tasks',
  );

export const useTodoTasks = () =>
  useQuery({ queryKey: ['todo-tasks'], queryFn: () => api<TodoTask[]>('/todo-tasks') });

export const useCreateTodoTask = () =>
  useMutationWith(
    (input: TodoTaskInput) => api<TodoTask>('/todo-tasks', { method: 'POST', body: input }),
    'todo-tasks',
    'dashboard',
  );

export const useUpdateTodoTask = () =>
  useMutationWith(
    ({ id, ...input }: TodoTaskInput & { id: string }) =>
      api<TodoTask>(`/todo-tasks/${id}`, { method: 'PUT', body: input }),
    'todo-tasks',
    'dashboard',
  );

export const useSetTaskCompleted = () =>
  useMutationWith(
    ({ id, completed }: { id: string; completed: boolean }) =>
      api<TodoTask>(`/todo-tasks/${id}/completed`, { method: 'PUT', body: completed }),
    'todo-tasks',
    'dashboard',
  );

export const useSetTaskFavorite = () =>
  useMutationWith(
    ({ id, favorite }: { id: string; favorite: boolean }) =>
      api<TodoTask>(`/todo-tasks/${id}/favorite`, { method: 'PUT', body: favorite }),
    'todo-tasks',
  );

export const useDeleteTodoTask = () =>
  useMutationWith(
    (id: string) => api<void>(`/todo-tasks/${id}`, { method: 'DELETE' }),
    'todo-tasks',
    'dashboard',
  );
