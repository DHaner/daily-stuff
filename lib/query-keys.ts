import type { DayKey } from '@/lib/date';

export const queryKeys = {
  expenses: ['expenses'] as const,
  expensesByDay: (day: DayKey) => ['expenses', 'day', day] as const,
  expense: (id: string) => ['expenses', 'detail', id] as const,
  daysWithExpenses: ['expenses', 'days'] as const,
};
