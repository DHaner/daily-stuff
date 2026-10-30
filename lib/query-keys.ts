import type { DayKey } from '@/lib/date';

export const queryKeys = {
  expenses: ['expenses'] as const,
  expensesByDay: (day: DayKey) => ['expenses', 'day', day] as const,
  expensesByRange: (start: DayKey, end: DayKey) => ['expenses', 'range', start, end] as const,
  expensesByCategory: (categoryId: string) => ['expenses', 'category', categoryId] as const,
  expense: (id: string) => ['expenses', 'detail', id] as const,
  daysWithExpenses: ['expenses', 'days'] as const,
  incomes: ['incomes'] as const,
  incomesByRange: (start: DayKey, end: DayKey) => ['incomes', 'range', start, end] as const,
  incomesByCategory: (categoryId: string) => ['incomes', 'category', categoryId] as const,
  income: (id: string) => ['incomes', 'detail', id] as const,
  daysWithIncomes: ['incomes', 'days'] as const,
  journal: ['journal'] as const,
  journalLabels: ['journal', 'labels'] as const,
  journalEntriesByRange: (start: DayKey, end: DayKey) =>
    ['journal', 'entries', 'range', start, end] as const,
  journalEntry: (date: DayKey) => ['journal', 'entries', 'day', date] as const,
  daysWithJournalEntries: ['journal', 'days'] as const,
  todos: ['todos'] as const,
  todoLists: ['todos', 'lists'] as const,
  todoTasks: ['todos', 'tasks'] as const,
};
