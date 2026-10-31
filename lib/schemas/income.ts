import { categoryIdSchema, dayKeySchema } from '@/lib/schemas/expense';
import { z } from 'zod';

export const incomeSchema = z.object({
  id: z.string(),
  concept: z.string().min(1, 'El concepto es obligatorio'),
  total: z.number().nonnegative('El ingreso total no puede ser negativo'),
  description: z.string(),
  categoryId: categoryIdSchema,
  date: dayKeySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Income = z.infer<typeof incomeSchema>;

const amountSchema = z
  .string()
  .trim()
  .min(1, 'Ingresa un monto')
  .transform((value) => Number(value.replace(',', '.')))
  .refine((value) => Number.isFinite(value), 'Monto inválido')
  .refine((value) => value >= 0, 'El monto no puede ser negativo');

export const incomeFormSchema = z.object({
  concept: z.string().trim().min(1, 'El concepto es obligatorio'),
  total: amountSchema,
  description: z.string(),
  categoryId: categoryIdSchema,
  date: dayKeySchema,
});

export type IncomeFormInput = z.input<typeof incomeFormSchema>;
export type IncomeFormValues = z.output<typeof incomeFormSchema>;
