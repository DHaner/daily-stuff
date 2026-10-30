import {
  journalEntrySchema,
  journalLabelSchema,
  type JournalEntry,
  type JournalEntryFormValues,
  type JournalLabel,
  type JournalLabelFormValues,
} from '@/lib/schemas/journal';
import type { SQLiteDatabase } from 'expo-sqlite';

type LabelRow = {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
};

type EntryRow = {
  id: string;
  date: string;
  mood: string;
  note: string;
  photo_uri: string | null;
  created_at: string;
  updated_at: string;
};

type EntryLabelRow = {
  entry_id: string;
  label_id: string;
};

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function toLabel(row: LabelRow): JournalLabel {
  return journalLabelSchema.parse({
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    createdAt: row.created_at,
  });
}

function toEntry(row: EntryRow, labelIds: string[]): JournalEntry {
  return journalEntrySchema.parse({
    id: row.id,
    date: row.date,
    mood: row.mood,
    note: row.note,
    photoUri: row.photo_uri,
    labelIds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

async function listLabelIdsByEntry(db: SQLiteDatabase, entryIds: string[]) {
  if (entryIds.length === 0) {
    return {} as Record<string, string[]>;
  }

  const placeholders = entryIds.map(() => '?').join(', ');
  const rows = await db.getAllAsync<EntryLabelRow>(
    `SELECT entry_id, label_id FROM journal_entry_labels WHERE entry_id IN (${placeholders})`,
    ...entryIds
  );

  return rows.reduce<Record<string, string[]>>((acc, row) => {
    (acc[row.entry_id] ??= []).push(row.label_id);
    return acc;
  }, {});
}

export async function listJournalLabels(db: SQLiteDatabase): Promise<JournalLabel[]> {
  const rows = await db.getAllAsync<LabelRow>(
    'SELECT * FROM journal_labels ORDER BY name COLLATE NOCASE ASC'
  );

  return rows.map(toLabel);
}

export async function createJournalLabel(
  db: SQLiteDatabase,
  values: JournalLabelFormValues
): Promise<JournalLabel> {
  const row: LabelRow = {
    id: createId(),
    name: values.name,
    icon: values.icon,
    color: values.color,
    created_at: new Date().toISOString(),
  };

  await db.runAsync(
    'INSERT INTO journal_labels (id, name, icon, color, created_at) VALUES (?, ?, ?, ?, ?)',
    row.id,
    row.name,
    row.icon,
    row.color,
    row.created_at
  );

  return toLabel(row);
}

export async function updateJournalLabel(
  db: SQLiteDatabase,
  id: string,
  values: JournalLabelFormValues
): Promise<JournalLabel> {
  await db.runAsync(
    'UPDATE journal_labels SET name = ?, icon = ?, color = ? WHERE id = ?',
    values.name,
    values.icon,
    values.color,
    id
  );

  const row = await db.getFirstAsync<LabelRow>('SELECT * FROM journal_labels WHERE id = ?', id);

  if (!row) {
    throw new Error('No se encontró la etiqueta que intentas actualizar');
  }

  return toLabel(row);
}

export async function deleteJournalLabel(db: SQLiteDatabase, id: string): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM journal_entry_labels WHERE label_id = ?', id);
    await db.runAsync('DELETE FROM journal_labels WHERE id = ?', id);
  });
}

export async function listJournalEntriesByDateRange(
  db: SQLiteDatabase,
  start: string,
  end: string
): Promise<JournalEntry[]> {
  const rows = await db.getAllAsync<EntryRow>(
    'SELECT * FROM journal_entries WHERE date BETWEEN ? AND ? ORDER BY date DESC',
    start,
    end
  );
  const labelIdsByEntry = await listLabelIdsByEntry(
    db,
    rows.map((row) => row.id)
  );

  return rows.map((row) => toEntry(row, labelIdsByEntry[row.id] ?? []));
}

export async function getJournalEntryByDate(
  db: SQLiteDatabase,
  date: string
): Promise<JournalEntry | null> {
  const row = await db.getFirstAsync<EntryRow>(
    'SELECT * FROM journal_entries WHERE date = ?',
    date
  );

  if (!row) {
    return null;
  }

  const labelIdsByEntry = await listLabelIdsByEntry(db, [row.id]);

  return toEntry(row, labelIdsByEntry[row.id] ?? []);
}

/** Days that already have an entry, used to dot the calendar. */
export async function listDaysWithJournalEntries(db: SQLiteDatabase): Promise<string[]> {
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM journal_entries ORDER BY date DESC'
  );

  return rows.map((row) => row.date);
}

/** A day holds at most one entry, so saving either creates it or overwrites the existing one. */
export async function saveJournalEntry(
  db: SQLiteDatabase,
  values: JournalEntryFormValues
): Promise<JournalEntry> {
  const now = new Date().toISOString();
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM journal_entries WHERE date = ?',
    values.date
  );
  const id = existing?.id ?? createId();

  await db.withTransactionAsync(async () => {
    if (existing) {
      await db.runAsync(
        'UPDATE journal_entries SET mood = ?, note = ?, photo_uri = ?, updated_at = ? WHERE id = ?',
        values.mood,
        values.note,
        values.photoUri,
        now,
        id
      );
    } else {
      await db.runAsync(
        `INSERT INTO journal_entries (id, date, mood, note, photo_uri, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        id,
        values.date,
        values.mood,
        values.note,
        values.photoUri,
        now,
        now
      );
    }

    await db.runAsync('DELETE FROM journal_entry_labels WHERE entry_id = ?', id);

    for (const labelId of new Set(values.labelIds)) {
      await db.runAsync(
        'INSERT INTO journal_entry_labels (entry_id, label_id) VALUES (?, ?)',
        id,
        labelId
      );
    }
  });

  const saved = await getJournalEntryByDate(db, values.date);

  if (!saved) {
    throw new Error('No se pudo guardar la entrada del diario');
  }

  return saved;
}

export async function deleteJournalEntry(db: SQLiteDatabase, id: string): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM journal_entry_labels WHERE entry_id = ?', id);
    await db.runAsync('DELETE FROM journal_entries WHERE id = ?', id);
  });
}
