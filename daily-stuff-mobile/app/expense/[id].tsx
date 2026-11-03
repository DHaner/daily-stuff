import { ExpenseForm, ExpenseFormHandle, toFormValues } from '@/components/expenses/expense-form';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useDeleteExpense, useExpense, useUpdateExpense } from '@/hooks/use-expenses';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CircleAlertIcon } from 'lucide-react-native';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';

export default function ExpenseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const formRef = React.useRef<ExpenseFormHandle>(null);

  const expenseQuery = useExpense(id);
  const updateExpense = useUpdateExpense(id);
  const deleteExpense = useDeleteExpense();

  const expense = expenseQuery.data;

  function confirmDelete() {
    Alert.alert('Eliminar gasto', '¿Seguro que quieres eliminar este gasto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => deleteExpense.mutate(id, { onSuccess: () => router.back() }),
      },
    ]);
  }

  const headerRight = React.useCallback(
    () => (
      <View className="flex-row items-center">
        <Button
          variant="ghost"
          accessibilityLabel="Guardar cambios"
          disabled={updateExpense.isPending}
          onPress={() => formRef.current?.submit()}>
          <Text className="font-semibold">
            {updateExpense.isPending ? 'Guardando…' : 'Guardar'}
          </Text>
        </Button>
      </View>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, updateExpense.isPending]
  );

  if (expenseQuery.isPending) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Stack.Screen options={{ title: 'Detalle del gasto' }} />
        <ActivityIndicator />
      </View>
    );
  }

  if (!expense) {
    return (
      <View className="bg-background flex-1 items-center justify-center gap-3 p-6">
        <Stack.Screen options={{ title: 'Gasto no encontrado' }} />
        <Icon as={CircleAlertIcon} className="text-muted-foreground size-10" />
        <Text className="text-muted-foreground text-center">
          Este gasto ya no existe. Puede que lo hayas eliminado.
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
      <Stack.Screen options={{ title: '', headerRight }} />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled">
        <ExpenseForm
          ref={formRef}
          defaultValues={toFormValues(expense)}
          submitLabel="Guardar cambios"
          isSubmitting={updateExpense.isPending}
          onDelete={confirmDelete}
          onSubmit={(values) => updateExpense.mutate(values)}
          footer={
            updateExpense.isError ? (
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
