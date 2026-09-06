import { IncomeForm, IncomeFormHandle, toFormValues } from '@/components/expenses/income-form';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useDaysWithIncomes, useDeleteIncome, useIncome, useUpdateIncome } from '@/hooks/use-incomes';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CircleAlertIcon, Trash2Icon } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function IncomeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const formRef = React.useRef<IncomeFormHandle>(null);

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
          accessibilityLabel="Eliminar ingreso"
          onPress={confirmDelete}>
          <Icon as={Trash2Icon} className="text-destructive size-5" />
        </Button>
        <Button
          variant="ghost"
          accessibilityLabel="Guardar cambios"
          disabled={updateIncome.isPending}
          onPress={() => formRef.current?.submit()}>
          <Text className="font-semibold">
            {updateIncome.isPending ? 'Guardando…' : 'Guardar'}
          </Text>
        </Button>
      </View>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, updateIncome.isPending]
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
        <IncomeForm
          ref={formRef}
          defaultValues={toFormValues(income)}
          submitLabel="Guardar cambios"
          isSubmitting={updateIncome.isPending}
          markedDays={daysQuery.data ?? []}
          onSubmit={(values) => updateIncome.mutate(values)}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
