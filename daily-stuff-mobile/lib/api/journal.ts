import { API_URL, api, apiOrNull, guessMimeType, isRemoteUri, uploadFile } from '@/lib/api/client';
import {
  journalEntrySchema,
  journalLabelSchema,
  type JournalEntry,
  type JournalEntryFormValues,
  type JournalLabel,
  type JournalLabelFormValues,
} from '@/lib/schemas/journal';

type ApiLabel = { id: string; name: string; icon: string; color: string; createdAt: string };

type ApiEntry = {
  id: string;
  date: string;
  mood: string;
  note: string;
  labelIds: string[];
  hasPhoto: boolean;
  createdAt: string;
  updatedAt: string;
};

const toLabel = (label: ApiLabel): JournalLabel => journalLabelSchema.parse(label);

/** `updatedAt` is part of the URL so a replaced photo is never served from the image cache. */
const photoUrl = (entry: ApiEntry) =>
  `${API_URL}/api/journal/entries/${entry.date}/photo?v=${encodeURIComponent(entry.updatedAt)}`;

function toEntry(entry: ApiEntry): JournalEntry {
  return journalEntrySchema.parse({
    id: entry.id,
    date: entry.date,
    mood: entry.mood,
    note: entry.note,
    photoUri: entry.hasPhoto ? photoUrl(entry) : null,
    labelIds: entry.labelIds,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  });
}

// ── Labels ─────────────────────────────────────────────────────────────────

export async function listJournalLabels(): Promise<JournalLabel[]> {
  return (await api<ApiLabel[]>('/journal/labels')).map(toLabel);
}

export async function createJournalLabel(values: JournalLabelFormValues): Promise<JournalLabel> {
  return toLabel(await api<ApiLabel>('/journal/labels', { method: 'POST', body: values }));
}

export async function updateJournalLabel(
  id: string,
  values: JournalLabelFormValues
): Promise<JournalLabel> {
  return toLabel(await api<ApiLabel>(`/journal/labels/${id}`, { method: 'PUT', body: values }));
}

export async function deleteJournalLabel(id: string): Promise<void> {
  await api(`/journal/labels/${id}`, { method: 'DELETE' });
}

// ── Entries ────────────────────────────────────────────────────────────────

export async function listJournalEntriesByDateRange(
  start: string,
  end: string
): Promise<JournalEntry[]> {
  return (await api<ApiEntry[]>(`/journal/entries?from=${start}&to=${end}`)).map(toEntry);
}

export async function getJournalEntryByDate(date: string): Promise<JournalEntry | null> {
  const entry = await apiOrNull<ApiEntry>(`/journal/entries/${date}`);

  return entry ? toEntry(entry) : null;
}

/** Days that already have an entry, used to dot the calendar. */
export function listDaysWithJournalEntries(): Promise<string[]> {
  return api<string[]>('/journal/entries/days');
}

/**
 * A day holds at most one entry, so saving either creates it or overwrites the existing one.
 * The photo travels separately: a picked local file is uploaded, `null` removes the stored one,
 * and a URL that already points at the API means "unchanged".
 */
export async function saveJournalEntry(values: JournalEntryFormValues): Promise<JournalEntry> {
  const { date, mood, note, labelIds, photoUri } = values;
  let saved = await api<ApiEntry>(`/journal/entries/${date}`, {
    method: 'PUT',
    body: { mood, note, labelIds },
  });

  if (photoUri === null && saved.hasPhoto) {
    saved = await api<ApiEntry>(`/journal/entries/${date}/photo`, { method: 'DELETE' });
  } else if (photoUri !== null && !isRemoteUri(photoUri)) {
    const name = `photo.${photoUri.split('?')[0].split('.').pop() || 'jpg'}`;

    saved = await uploadFile<ApiEntry>(`/journal/entries/${date}/photo`, {
      uri: photoUri,
      name,
      type: guessMimeType(name),
    });
  }

  return toEntry(saved);
}

export async function deleteJournalEntry(date: string): Promise<void> {
  await api(`/journal/entries/${date}`, { method: 'DELETE' });
}
