import { emptyFormValues, ExpenseForm } from '@/components/expenses/expense-form';
import { Text } from '@/components/ui/text';
import { useCreateExpense, useDaysWithExpenses } from '@/hooks/use-expenses';
import { dayKeySchema } from '@/lib/schemas/expense';
import { todayKey } from '@/lib/date';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function NewExpenseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const createExpense = useCreateExpense();
  const daysQuery = useDaysWithExpenses();

  // The home screen passes the day currently being viewed so the modal opens on it.
  const initialDate = dayKeySchema.safeParse(params.date).data ?? todayKey();
  const defaultValues = React.useMemo(() => emptyFormValues(initialDate), [initialDate]);

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: 'Nuevo gasto' }} />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled">
        <ExpenseForm
          defaultValues={defaultValues}
          submitLabel="Guardar gasto"
          isSubmitting={createExpense.isPending}
          markedDays={daysQuery.data ?? []}
          onSubmit={(values) =>
            createExpense.mutate(values, {
              onSuccess: () => router.back(),
            })
          }
          footer={
            createExpense.isError ? (
              <View className="bg-destructive/10 rounded-md p-3">
                <Text className="text-destructive text-sm">
                  No se pudo guardar el gasto. Inténtalo de nuevo.
                </Text>
              </View>
            ) : null
          }
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
