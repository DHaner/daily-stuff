import { categoryIdSchema, dayKeySchema } from '@/lib/schemas/expense';
import { z } from 'zod';

/** A sub-income: one of the sources that make up a larger income. */
export const incomeItemSchema = z.object({
  id: z.string(),
  concept: z.string().min(1, 'El concepto es obligatorio'),
  amount: z.number().nonnegative('El ingreso no puede ser negativo'),
  description: z.string(),
  categoryId: categoryIdSchema,
});

export const incomeSchema = z.object({
  id: z.string(),
  concept: z.string().min(1, 'El concepto es obligatorio'),
  total: z.number().nonnegative('El ingreso total no puede ser negativo'),
  description: z.string(),
  categoryId: categoryIdSchema,
  date: dayKeySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  items: z.array(incomeItemSchema),
});

export type Income = z.infer<typeof incomeSchema>;
export type IncomeItem = z.infer<typeof incomeItemSchema>;

const amountSchema = z
  .string()
  .trim()
  .min(1, 'Ingresa un monto')
  .transform((value) => Number(value.replace(',', '.')))
  .refine((value) => Number.isFinite(value), 'Monto inválido')
  .refine((value) => value >= 0, 'El monto no puede ser negativo');

export const incomeItemFormSchema = z.object({
  id: z.string(),
  concept: z.string().trim().min(1, 'El concepto es obligatorio'),
  amount: amountSchema,
  description: z.string(),
  categoryId: categoryIdSchema,
});

export const incomeFormSchema = z.object({
  concept: z.string().trim().min(1, 'El concepto es obligatorio'),
  total: amountSchema,
  description: z.string(),
  categoryId: categoryIdSchema,
  date: dayKeySchema,
  items: z.array(incomeItemFormSchema),
});

export type IncomeFormInput = z.input<typeof incomeFormSchema>;
export type IncomeFormValues = z.output<typeof incomeFormSchema>;
export type IncomeItemFormInput = z.input<typeof incomeItemFormSchema>;
