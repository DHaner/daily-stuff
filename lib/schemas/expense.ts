import { DEFAULT_CATEGORY } from '@/lib/categories';
import { z } from 'zod';

/** Categories are user-defined, so any non-empty id is valid; `getCategory` handles unknown ids. */
export const categoryIdSchema = z.string().min(1).catch(DEFAULT_CATEGORY);

/** `yyyy-MM-dd`, the key used to group expenses by day. */
export const dayKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida');

/** A sub-expense: one of the products/lines that make up a larger expense. */
export const expenseItemSchema = z.object({
  id: z.string(),
  concept: z.string().min(1, 'El concepto es obligatorio'),
  amount: z.number().nonnegative('El gasto no puede ser negativo'),
  description: z.string(),
  categoryId: categoryIdSchema,
});

export const expenseSchema = z.object({
  id: z.string(),
  concept: z.string().min(1, 'El concepto es obligatorio'),
  total: z.number().nonnegative('El gasto total no puede ser negativo'),
  description: z.string(),
  categoryId: categoryIdSchema,
  date: dayKeySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  items: z.array(expenseItemSchema),
});

export type Expense = z.infer<typeof expenseSchema>;
export type ExpenseItem = z.infer<typeof expenseItemSchema>;

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

export const expenseItemFormSchema = z.object({
  id: z.string(),
  concept: z.string().trim().min(1, 'El concepto es obligatorio'),
  amount: amountSchema,
  description: z.string(),
  categoryId: categoryIdSchema,
});

export const expenseFormSchema = z.object({
  concept: z.string().trim().min(1, 'El concepto es obligatorio'),
  total: amountSchema,
  description: z.string(),
  categoryId: categoryIdSchema,
  date: dayKeySchema,
  items: z.array(expenseItemFormSchema),
});

export type ExpenseFormInput = z.input<typeof expenseFormSchema>;
export type ExpenseFormValues = z.output<typeof expenseFormSchema>;
export type ExpenseItemFormInput = z.input<typeof expenseItemFormSchema>;
