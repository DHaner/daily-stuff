import type { DayKey } from '@/lib/date';
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
} from '@/lib/db/journal';
import { deleteJournalPhoto, persistJournalPhoto } from '@/lib/journal-photos';
import { queryKeys } from '@/lib/query-keys';
import type {
  JournalEntry,
  JournalEntryFormValues,
  JournalLabelFormValues,
} from '@/lib/schemas/journal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

export function useJournalLabels() {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: queryKeys.journalLabels,
    queryFn: () => listJournalLabels(db),
  });
}

export function useJournalEntriesByRange(start: DayKey, end: DayKey) {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: queryKeys.journalEntriesByRange(start, end),
    queryFn: () => listJournalEntriesByDateRange(db, start, end),
  });
}

export function useJournalEntry(date: DayKey) {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: queryKeys.journalEntry(date),
    queryFn: () => getJournalEntryByDate(db, date),
  });
}

export function useDaysWithJournalEntries() {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: queryKeys.daysWithJournalEntries,
    queryFn: () => listDaysWithJournalEntries(db),
  });
}

/** Every journal mutation can change entries and labels, so invalidate the whole `journal` tree. */
function useInvalidateJournal() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: queryKeys.journal });
}

export function useSaveJournalEntry() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateJournal();

  return useMutation({
    mutationFn: async (values: JournalEntryFormValues) => {
      const previous = await getJournalEntryByDate(db, values.date);
      const photoUri = values.photoUri ? await persistJournalPhoto(values.photoUri) : null;
      const saved = await saveJournalEntry(db, { ...values, photoUri });

      if (previous?.photoUri && previous.photoUri !== photoUri) {
        deleteJournalPhoto(previous.photoUri);
      }

      return saved;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteJournalEntry() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateJournal();

  return useMutation({
    mutationFn: async (entry: JournalEntry) => {
      await deleteJournalEntry(db, entry.id);
      deleteJournalPhoto(entry.photoUri);
    },
    onSuccess: invalidate,
  });
}

export function useCreateJournalLabel() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateJournal();

  return useMutation({
    mutationFn: (values: JournalLabelFormValues) => createJournalLabel(db, values),
    onSuccess: invalidate,
  });
}

export function useUpdateJournalLabel() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateJournal();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: JournalLabelFormValues }) =>
      updateJournalLabel(db, id, values),
    onSuccess: invalidate,
  });
}

export function useDeleteJournalLabel() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateJournal();

  return useMutation({
    mutationFn: (id: string) => deleteJournalLabel(db, id),
    onSuccess: invalidate,
  });
}
