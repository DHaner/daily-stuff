import { CategoryBadge } from '@/components/expenses/category-badge';
import { IncomeForm, toFormValues } from '@/components/expenses/income-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useDaysWithIncomes, useDeleteIncome, useIncome, useUpdateIncome } from '@/hooks/use-incomes';
import { sumItems } from '@/lib/breakdown';
import { formatDayLabel } from '@/lib/date';
import { formatCurrency } from '@/lib/format';
import type { Income } from '@/lib/schemas/income';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CircleAlertIcon, PencilIcon, Trash2Icon, XIcon } from 'lucide-react-native';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';

export default function IncomeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isEditing, setIsEditing] = React.useState(false);

  const incomeQuery = useIncome(id);
  const daysQuery = useDaysWithIncomes();
  const updateIncome = useUpdateIncome(id);
  const deleteIncome = useDeleteIncome();

  const income = incomeQuery.data;

  function confirmDelete() {
    Alert.alert('Eliminar ingreso', '¿Seguro que quieres eliminar este ingreso?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => deleteIncome.mutate(id, { onSuccess: () => router.back() }),
      },
    ]);
  }

  const headerRight = React.useCallback(
    () => (
      <View className="flex-row items-center">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          accessibilityLabel={isEditing ? 'Cancelar edición' : 'Editar ingreso'}
          onPress={() => setIsEditing((editing) => !editing)}>
          <Icon as={isEditing ? XIcon : PencilIcon} className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          accessibilityLabel="Eliminar ingreso"
          onPress={confirmDelete}>
          <Icon as={Trash2Icon} className="text-destructive size-5" />
        </Button>
      </View>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isEditing, id]
  );

  if (incomeQuery.isPending) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Stack.Screen options={{ title: 'Detalle del ingreso' }} />
        <ActivityIndicator />
      </View>
    );
  }

  if (!income) {
    return (
      <View className="bg-background flex-1 items-center justify-center gap-3 p-6">
        <Stack.Screen options={{ title: 'Ingreso no encontrado' }} />
        <Icon as={CircleAlertIcon} className="text-muted-foreground size-10" />
        <Text className="text-muted-foreground text-center">
          Este ingreso ya no existe. Puede que lo hayas eliminado.
        </Text>
        <Button variant="outline" onPress={() => router.back()}>
          <Text>Volver</Text>
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: income.concept, headerRight }} />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled">
        {isEditing ? (
          <IncomeForm
            defaultValues={toFormValues(income)}
            submitLabel="Guardar cambios"
            isSubmitting={updateIncome.isPending}
            markedDays={daysQuery.data ?? []}
            onSubmit={(values) =>
              updateIncome.mutate(values, { onSuccess: () => setIsEditing(false) })
            }
            footer={
              updateIncome.isError ? (
                <View className="bg-destructive/10 rounded-md p-3">
                  <Text className="text-destructive text-sm">
                    No se pudieron guardar los cambios. Inténtalo de nuevo.
                  </Text>
                </View>
              ) : null
            }
          />
        ) : (
          <IncomeSummary income={income} onEdit={() => setIsEditing(true)} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function IncomeSummary({ income, onEdit }: { income: Income; onEdit: () => void }) {
  const itemsTotal = sumItems(income.items);
  const remainder = income.total - itemsTotal;

  return (
    <View className="gap-4">
      <Card className="gap-4">
        <View className="items-center gap-1 px-6">
          <Text className="text-muted-foreground text-xs tracking-wide uppercase">
            Ingreso total
          </Text>
          <Text className="text-4xl font-bold text-green-600">{formatCurrency(income.total)}</Text>
          <Text className="text-muted-foreground text-sm capitalize">
            {formatDayLabel(income.date)}
          </Text>
        </View>

        <Separator />

        <View className="gap-3 px-6">
          <Field label="Concepto" value={income.concept} />
          <View className="gap-1.5">
            <Text className="text-muted-foreground text-xs uppercase">Categoría</Text>
            <View className="flex-row">
              <CategoryBadge categoryId={income.categoryId} />
            </View>
          </View>
          <Field
            label="Descripción"
            value={income.description.length > 0 ? income.description : '—'}
          />
        </View>
      </Card>

      {income.items.length > 0 ? (
        <Card className="gap-3">
          <View className="flex-row items-center justify-between px-6">
            <Text className="font-semibold">Sub-ingresos ({income.items.length})</Text>
            <Text className="text-muted-foreground text-sm">{formatCurrency(itemsTotal)}</Text>
          </View>

          <Separator />

          <View className="gap-4 px-6">
            {income.items.map((item) => (
              <View key={item.id} className="gap-1.5">
                <View className="flex-row items-start justify-between gap-3">
                  <Text className="flex-1 font-medium">{item.concept}</Text>
                  <Text className="font-semibold">{formatCurrency(item.amount)}</Text>
                </View>
                {item.description.length > 0 ? (
                  <Text className="text-muted-foreground text-sm">{item.description}</Text>
                ) : null}
                <View className="flex-row">
                  <CategoryBadge categoryId={item.categoryId} />
                </View>
              </View>
            ))}

            {Math.abs(remainder) >= 0.01 ? (
              <View className="flex-row items-center justify-between">
                <Text className="text-muted-foreground text-sm">Otros conceptos</Text>
                <Text className="text-muted-foreground text-sm">{formatCurrency(remainder)}</Text>
              </View>
            ) : null}
          </View>
        </Card>
      ) : null}

      <Button size="lg" onPress={onEdit}>
        <Icon as={PencilIcon} className="size-4" />
        <Text>Editar ingreso</Text>
      </Button>
    </View>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-1">
      <Text className="text-muted-foreground text-xs uppercase">{label}</Text>
      <Text className="text-base">{value}</Text>
    </View>
  );
}
