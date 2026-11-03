import { DEFAULT_CATEGORY } from '@/lib/categories';
import { z } from 'zod';

/** Categories are user-defined, so any non-empty id is valid; `getCategory` handles unknown ids. */
export const categoryIdSchema = z.string().min(1).catch(DEFAULT_CATEGORY);

/** `yyyy-MM-dd`, the key used to group expenses by day. */
export const dayKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida');

export const expenseSchema = z.object({
  id: z.string(),
  concept: z.string().min(1, 'El concepto es obligatorio'),
  total: z.number().nonnegative('El gasto total no puede ser negativo'),
  description: z.string(),
  categoryId: categoryIdSchema,
  date: dayKeySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Expense = z.infer<typeof expenseSchema>;

/**
 * Text inputs hand us strings, so the form schema parses/validates money as text
 * and transforms it into a number. Use `z.input` for the form values and
 * `z.output` for what `handleSubmit` receives.
 */
const amountSchema = z
  .string()
  .trim()
  .min(1, 'Ingresa un monto')
  .transform((value) => Number(value.replace(',', '.')))
  .refine((value) => Number.isFinite(value), 'Monto inválido')
  .refine((value) => value >= 0, 'El monto no puede ser negativo');

export const expenseFormSchema = z.object({
  concept: z.string().trim().min(1, 'El concepto es obligatorio'),
  total: amountSchema,
  description: z.string(),
  categoryId: categoryIdSchema,
  date: dayKeySchema,
});

export type ExpenseFormInput = z.input<typeof expenseFormSchema>;
export type ExpenseFormValues = z.output<typeof expenseFormSchema>;
