import { CategoryPicker } from '@/components/expenses/category-picker';
import { DateField } from '@/components/expenses/date-picker';
import { FormField, PLAIN_INPUT } from '@/components/expenses/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_INCOME_CATEGORY, useCategories } from '@/lib/categories';
import { todayKey, type DayKey } from '@/lib/date';
import {
  formatAmountInput,
  parseAmountInput,
  sanitizeAmountInput,
  toAmountInput,
} from '@/lib/format';
import {
  incomeFormSchema,
  type Income,
  type IncomeFormInput,
  type IncomeFormValues,
} from '@/lib/schemas/income';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlignLeftIcon, CalendarIcon, ArrowUpCircleIcon, Trash2Icon } from 'lucide-react-native';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

export function toFormValues(income: Income): IncomeFormInput {
  return {
    concept: income.concept,
    total: toAmountInput(income.total),
    description: income.description,
    categoryId: income.categoryId,
    date: income.date,
  };
}

export function emptyFormValues(date: DayKey = todayKey()): IncomeFormInput {
  return {
    concept: '',
    total: '',
    description: '',
    categoryId: DEFAULT_INCOME_CATEGORY,
    date,
  };
}

type IncomeFormProps = {
  defaultValues: IncomeFormInput;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: IncomeFormValues) => void;
  /** When set (editing), shows a delete button under the save button. */
  onDelete?: () => void;
  footer?: React.ReactNode;
};

/** Lets a parent screen (e.g. a header button) trigger the same submit as the in-form button. */
export type IncomeFormHandle = {
  submit: () => void;
};

export const IncomeForm = React.forwardRef<IncomeFormHandle, IncomeFormProps>(function IncomeForm(
  { defaultValues, submitLabel, isSubmitting = false, onSubmit, onDelete, footer },
  ref
) {
  const { income: incomeCategories } = useCategories();
  const form = useForm<IncomeFormInput, unknown, IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const { control, handleSubmit, formState } = form;

  React.useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(onSubmit)(),
  }));

  return (
    <View className="gap-1">
      <Controller
        control={control}
        name="concept"
        render={({ field }) => (
          <FormField label="Concepto" error={formState.errors.concept?.message}>
            <Input
              placeholder="Concepto"
              className={cn(PLAIN_INPUT, 'h-14 text-2xl leading-8 font-bold')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="sentences"
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="total"
        render={({ field }) => (
          <FormField
            label="Ingreso total"
            caption="Cantidad"
            icon={ArrowUpCircleIcon}
            iconClassName="text-green-600"
            error={formState.errors.total?.message}>
            <View className="flex-row items-center gap-1">
              <Text className="text-muted-foreground text-lg font-semibold">$</Text>
              <Input
                className={cn(PLAIN_INPUT, 'flex-1 text-lg font-semibold')}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={formatAmountInput(field.value)}
                onChangeText={(text) => field.onChange(sanitizeAmountInput(text))}
                onBlur={() => {
                  field.onBlur();
                  if (field.value) {
                    field.onChange(toAmountInput(parseAmountInput(field.value)));
                  }
                }}
              />
            </View>
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <FormField
            label="Descripción"
            caption="Descripción"
            icon={AlignLeftIcon}
            alignTop
            error={formState.errors.description?.message}>
            <Textarea
              className={cn(PLAIN_INPUT, 'h-auto min-h-12 py-0')}
              placeholder="Notas, fuente, etc."
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="date"
        render={({ field }) => (
          <DateField
            label="Fecha de creación"
            caption="Fecha de creación"
            icon={CalendarIcon}
            value={field.value}
            onChange={field.onChange}
            error={formState.errors.date?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="categoryId"
        render={({ field }) => (
          <FormField label="Categoría" last error={formState.errors.categoryId?.message}>
            <CategoryPicker
              value={field.value}
              onChange={field.onChange}
              categories={incomeCategories}
            />
          </FormField>
        )}
      />

      <Button size="lg" className="mt-4" onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        <Text>{isSubmitting ? 'Guardando…' : submitLabel}</Text>
      </Button>

      {onDelete ? (
        <Button variant="ghost" size="lg" onPress={onDelete} disabled={isSubmitting}>
          <Icon as={Trash2Icon} className="text-destructive size-5" />
          <Text className="text-destructive">Eliminar ingreso</Text>
        </Button>
      ) : null}

      {footer}
    </View>
  );
});
