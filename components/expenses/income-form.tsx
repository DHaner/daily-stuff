import { CategoryPicker } from '@/components/expenses/category-picker';
import { DatePicker } from '@/components/expenses/date-picker';
import { FormField } from '@/components/expenses/form-field';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_INCOME_CATEGORY, useCategories } from '@/lib/categories';
import { todayKey, type DayKey } from '@/lib/date';
import {
  formatAmountInput,
  formatCurrency,
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
import { LayersIcon, PlusIcon, Trash2Icon } from 'lucide-react-native';
import * as React from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { View } from 'react-native';

function createItemId() {
  return `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function toFormValues(income: Income): IncomeFormInput {
  return {
    concept: income.concept,
    total: toAmountInput(income.total),
    description: income.description,
    categoryId: income.categoryId,
    date: income.date,
    items: income.items.map((item) => ({
      id: item.id,
      concept: item.concept,
      amount: toAmountInput(item.amount),
      description: item.description,
      categoryId: item.categoryId,
    })),
  };
}

export function emptyFormValues(date: DayKey = todayKey()): IncomeFormInput {
  return {
    concept: '',
    total: '',
    description: '',
    categoryId: DEFAULT_INCOME_CATEGORY,
    date,
    items: [],
  };
}

type IncomeFormProps = {
  defaultValues: IncomeFormInput;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: IncomeFormValues) => void;
  markedDays?: DayKey[];
  footer?: React.ReactNode;
};

/** Lets a parent screen (e.g. a header button) trigger the same submit as the in-form button. */
export type IncomeFormHandle = {
  submit: () => void;
};

export const IncomeForm = React.forwardRef<IncomeFormHandle, IncomeFormProps>(
  function IncomeForm(
    { defaultValues, submitLabel, isSubmitting = false, onSubmit, markedDays, footer },
    ref
  ) {
    const { income: incomeCategories } = useCategories();
    const form = useForm<IncomeFormInput, unknown, IncomeFormValues>({
      resolver: zodResolver(incomeFormSchema),
      defaultValues,
      mode: 'onTouched',
    });

    const { control, handleSubmit, setValue, formState } = form;
    const { fields, append, remove } = useFieldArray({ control, name: 'items' });

    React.useImperativeHandle(ref, () => ({
      submit: () => handleSubmit(onSubmit)(),
    }));

    const items = useWatch({ control, name: 'items' });
    const isComposed = fields.length > 0;

    const itemsTotal = React.useMemo(
      () => (items ?? []).reduce((sum, item) => sum + parseAmountInput(item?.amount ?? ''), 0),
      [items]
    );

    // A composed income is worth exactly the sum of its parts, so the total becomes read-only.
    React.useEffect(() => {
      if (isComposed) {
        setValue('total', itemsTotal.toFixed(2), { shouldValidate: true });
      }
    }, [isComposed, itemsTotal, setValue]);

    function addItem() {
      append({
        id: createItemId(),
        concept: '',
        amount: '',
        description: '',
        categoryId: DEFAULT_INCOME_CATEGORY,
      });
    }

    return (
      <View className="gap-5">
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <FormField label="Fecha" error={formState.errors.date?.message}>
              <DatePicker value={field.value} onChange={field.onChange} markedDays={markedDays} />
            </FormField>
          )}
        />

        <Controller
          control={control}
          name="concept"
          render={({ field }) => (
            <FormField label="Concepto" error={formState.errors.concept?.message}>
              <Input
                placeholder="Pago de nómina"
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
              hint={isComposed ? 'Suma de los sub-ingresos' : undefined}
              error={formState.errors.total?.message}>
              <Input
                placeholder="$0.00"
                keyboardType="decimal-pad"
                value={formatAmountInput(field.value)}
                onChangeText={(text) => field.onChange(sanitizeAmountInput(text))}
                onBlur={() => {
                  field.onBlur();
                  if (field.value) {
                    field.onChange(toAmountInput(parseAmountInput(field.value)));
                  }
                }}
                editable={!isComposed}
                className={isComposed ? 'opacity-70' : undefined}
              />
            </FormField>
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <FormField label="Descripción" error={formState.errors.description?.message}>
              <Textarea
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
          name="categoryId"
          render={({ field }) => (
            <FormField label="Categoría" error={formState.errors.categoryId?.message}>
              <CategoryPicker
                value={field.value}
                onChange={field.onChange}
                categories={incomeCategories}
              />
            </FormField>
          )}
        />

        <Separator />

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Icon as={LayersIcon} className="text-muted-foreground size-4" />
              <Text className="font-semibold">Sub-ingresos</Text>
            </View>
            <Text className="text-muted-foreground text-xs">
              {isComposed ? formatCurrency(itemsTotal) : 'Opcional'}
            </Text>
          </View>

          <Text className="text-muted-foreground text-xs">
            Desglosa un ingreso compuesto — por ejemplo, varias fuentes de un mismo pago.
          </Text>

          {fields.map((fieldItem, index) => (
            <Card key={fieldItem.id} className="gap-4 py-4">
              <View className="flex-row items-center justify-between px-4">
                <Text className="text-muted-foreground text-xs font-semibold uppercase">
                  Sub-ingreso {index + 1}
                </Text>
                <Button
                  variant="ghost"
                  size="icon"
                  onPress={() => remove(index)}
                  accessibilityLabel={'Eliminar sub-ingreso ' + (index + 1)}>
                  <Icon as={Trash2Icon} className="text-destructive size-4" />
                </Button>
              </View>

              <View className="gap-4 px-4">
                <Controller
                  control={control}
                  name={`items.${index}.concept`}
                  render={({ field }) => (
                    <FormField
                      label="Concepto"
                      error={formState.errors.items?.[index]?.concept?.message}>
                      <Input
                        placeholder="Bono"
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FormField>
                  )}
                />

                <Controller
                  control={control}
                  name={`items.${index}.amount`}
                  render={({ field }) => (
                    <FormField
                      label="Ingreso"
                      error={formState.errors.items?.[index]?.amount?.message}>
                      <Input
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FormField>
                  )}
                />

                <Controller
                  control={control}
                  name={`items.${index}.categoryId`}
                  render={({ field }) => (
                    <FormField label="Categoría">
                      <CategoryPicker
                        value={field.value}
                        onChange={field.onChange}
                        categories={incomeCategories}
                      />
                    </FormField>
                  )}
                />

                <Controller
                  control={control}
                  name={`items.${index}.description`}
                  render={({ field }) => (
                    <FormField label="Descripción">
                      <Textarea
                        placeholder="Detalle de la fuente"
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FormField>
                  )}
                />
              </View>
            </Card>
          ))}

          <Button variant="outline" onPress={addItem}>
            <Icon as={PlusIcon} className="size-4" />
            <Text>Agregar sub-ingreso</Text>
          </Button>
        </View>

        <Separator />

        <Button size="lg" onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
          <Text>{isSubmitting ? 'Guardando…' : submitLabel}</Text>
        </Button>

        {footer}
      </View>
    );
  }
);
