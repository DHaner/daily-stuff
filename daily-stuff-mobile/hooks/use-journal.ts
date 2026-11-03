import {
  createJournalLabel,
  deleteJournalEntry,
  deleteJournalLabel,
  getJournalEntryByDate,
  listDaysWithJournalEntries,
  listJournalEntriesByDateRange,
  listJournalLabels,
  saveJournalEntry,
  updateJournalLabel,
} from '@/lib/api/journal';
import type { DayKey } from '@/lib/date';
import { queryKeys } from '@/lib/query-keys';
import type {
  JournalEntry,
  JournalEntryFormValues,
  JournalLabelFormValues,
} from '@/lib/schemas/journal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useJournalLabels() {
  return useQuery({
    queryKey: queryKeys.journalLabels,
    queryFn: listJournalLabels,
  });
}

export function useJournalEntriesByRange(start: DayKey, end: DayKey) {
  return useQuery({
    queryKey: queryKeys.journalEntriesByRange(start, end),
    queryFn: () => listJournalEntriesByDateRange(start, end),
  });
}

export function useJournalEntry(date: DayKey) {
  return useQuery({
    queryKey: queryKeys.journalEntry(date),
    queryFn: () => getJournalEntryByDate(date),
  });
}

export function useDaysWithJournalEntries() {
  return useQuery({
    queryKey: queryKeys.daysWithJournalEntries,
    queryFn: listDaysWithJournalEntries,
  });
}

/** Every journal mutation can change entries and labels, so invalidate the whole `journal` tree. */
function useInvalidateJournal() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: queryKeys.journal });
}

export function useSaveJournalEntry() {
  const invalidate = useInvalidateJournal();

  return useMutation({
    mutationFn: (values: JournalEntryFormValues) => saveJournalEntry(values),
    onSuccess: invalidate,
  });
}

export function useDeleteJournalEntry() {
  const invalidate = useInvalidateJournal();

  return useMutation({
    // The server also removes the entry's photo.
    mutationFn: (entry: JournalEntry) => deleteJournalEntry(entry.date),
    onSuccess: invalidate,
  });
}

export function useCreateJournalLabel() {
  const invalidate = useInvalidateJournal();

  return useMutation({
    mutationFn: (values: JournalLabelFormValues) => createJournalLabel(values),
    onSuccess: invalidate,
  });
}

export function useUpdateJournalLabel() {
  const invalidate = useInvalidateJournal();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: JournalLabelFormValues }) =>
      updateJournalLabel(id, values),
    onSuccess: invalidate,
  });
}

export function useDeleteJournalLabel() {
  const invalidate = useInvalidateJournal();

  return useMutation({
    mutationFn: (id: string) => deleteJournalLabel(id),
    onSuccess: invalidate,
  });
}
