import { CategoryField } from '@/components/expenses/category-field';
import { DateField } from '@/components/expenses/date-picker';
import { FormField, PLAIN_INPUT } from '@/components/expenses/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_CATEGORY } from '@/lib/categories';
import { todayKey, type DayKey } from '@/lib/date';
import {
  formatAmountInput,
  parseAmountInput,
  sanitizeAmountInput,
  toAmountInput,
} from '@/lib/format';
import {
  expenseFormSchema,
  type Expense,
  type ExpenseFormInput,
  type ExpenseFormValues,
} from '@/lib/schemas/expense';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlignLeftIcon, CalendarIcon, ArrowDownCircleIcon, Trash2Icon } from 'lucide-react-native';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

export function toFormValues(expense: Expense): ExpenseFormInput {
  return {
    concept: expense.concept,
    total: toAmountInput(expense.total),
    description: expense.description,
    categoryId: expense.categoryId,
    date: expense.date,
  };
}

export function emptyFormValues(date: DayKey = todayKey()): ExpenseFormInput {
  return {
    concept: '',
    total: '',
    description: '',
    categoryId: DEFAULT_CATEGORY,
    date,
  };
}

type ExpenseFormProps = {
  defaultValues: ExpenseFormInput;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: ExpenseFormValues) => void;
  /** When set (editing), shows a delete button under the save button. */
  onDelete?: () => void;
  footer?: React.ReactNode;
};

/** Lets a parent screen (e.g. a header button) trigger the same submit as the in-form button. */
export type ExpenseFormHandle = {
  submit: () => void;
};

export const ExpenseForm = React.forwardRef<ExpenseFormHandle, ExpenseFormProps>(
  function ExpenseForm(
    { defaultValues, submitLabel, isSubmitting = false, onSubmit, onDelete, footer },
    ref
  ) {
    const form = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
      resolver: zodResolver(expenseFormSchema),
      defaultValues,
      mode: 'onTouched',
    });

    const { control, handleSubmit, formState } = form;

    React.useImperativeHandle(ref, () => ({
      submit: () => handleSubmit(onSubmit)(),
    }));

    return (
      <View>
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
              label="Gasto total"
              caption="Cantidad"
              icon={ArrowDownCircleIcon}
              iconClassName="text-destructive"
              error={formState.errors.total?.message}>
              <View className="flex-row items-center gap-1">
                <Text className="text-muted-foreground bottom-0.5 text-lg font-semibold">$</Text>
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
                className={cn(PLAIN_INPUT, 'h-auto min-h-12 pt-1 pb-0')}
                placeholder="Notas, método de pago, etc."
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
            <CategoryField
              kind="gasto"
              value={field.value}
              onChange={field.onChange}
              last
              error={formState.errors.categoryId?.message}
            />
          )}
        />

        <Button size="lg" className="mt-4" onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
          <Text>{isSubmitting ? 'Guardando…' : submitLabel}</Text>
        </Button>

        {onDelete ? (
          <Button
            variant="ghost"
            size="lg"
            className="mt-1"
            onPress={onDelete}
            disabled={isSubmitting}>
            <Icon as={Trash2Icon} className="text-destructive size-5" />
            <Text className="text-destructive">Eliminar gasto</Text>
          </Button>
        ) : null}

        {footer ? <View className="mt-1">{footer}</View> : null}
      </View>
    );
  }
);
