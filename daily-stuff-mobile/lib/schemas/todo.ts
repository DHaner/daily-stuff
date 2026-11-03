import { dayKeySchema } from '@/lib/schemas/expense';
import { z } from 'zod';

export const todoListSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  /** Key of the Lucide icon, e.g. `Briefcase`. */
  icon: z.string().min(1),
  /** Hex color, e.g. `#3b82f6`. */
  color: z.string().min(1),
  createdAt: z.string(),
});

export const todoTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  listId: z.string().nullable(),
  dueDate: dayKeySchema.nullable(),
  /** Local date-time of the reminder, `yyyy-MM-dd'T'HH:mm`. */
  reminderAt: z.string().nullable(),
  notificationId: z.string().nullable(),
  fileUri: z.string().nullable(),
  fileName: z.string().nullable(),
  completed: z.boolean(),
  favorite: z.boolean(),
  createdAt: z.string(),
});

export const todoListFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(30, 'Máximo 30 caracteres'),
  icon: z.string().min(1, 'Elige un icono'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido'),
});

export const todoTaskFormSchema = z.object({
  title: z.string().trim().min(1, 'El nombre es obligatorio'),
  description: z.string().trim(),
  listId: z.string().nullable(),
  dueDate: dayKeySchema.nullable(),
  reminderAt: z.string().nullable(),
  fileUri: z.string().nullable(),
  fileName: z.string().nullable(),
  favorite: z.boolean(),
});

export type TodoList = z.infer<typeof todoListSchema>;
export type TodoTask = z.infer<typeof todoTaskSchema>;
export type TodoListFormValues = z.infer<typeof todoListFormSchema>;
export type TodoTaskFormValues = z.infer<typeof todoTaskFormSchema>;
