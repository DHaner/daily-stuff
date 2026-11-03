import { dayKeySchema } from '@/lib/schemas/expense';
import { MOOD_IDS } from '@/lib/journal-moods';
import { z } from 'zod';

const moodSchema = z.enum(MOOD_IDS);

export const journalLabelSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  /** Key of the Lucide icon, e.g. `Dumbbell`. */
  icon: z.string().min(1),
  /** Hex color, e.g. `#3b82f6`. */
  color: z.string().min(1),
  createdAt: z.string(),
});

export const journalEntrySchema = z.object({
  id: z.string(),
  date: dayKeySchema,
  mood: moodSchema,
  note: z.string(),
  photoUri: z.string().nullable(),
  labelIds: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const journalEntryFormSchema = z.object({
  date: dayKeySchema,
  mood: moodSchema,
  note: z.string().trim(),
  photoUri: z.string().nullable(),
  labelIds: z.array(z.string()),
});

export const journalLabelFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(24, 'Máximo 24 caracteres'),
  icon: z.string().min(1, 'Elige un icono'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido'),
});

export type JournalLabel = z.infer<typeof journalLabelSchema>;
export type JournalEntry = z.infer<typeof journalEntrySchema>;
export type JournalEntryFormValues = z.infer<typeof journalEntryFormSchema>;
export type JournalLabelFormValues = z.infer<typeof journalLabelFormSchema>;
