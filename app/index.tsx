import { DatePickerDialog } from '@/components/expenses/date-picker-dialog';
import { ExpenseCard } from '@/components/expenses/expense-card';
import { ExpensesDoughnut } from '@/components/expenses/expenses-doughnut';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useDaysWithExpenses, useExpensesByDay } from '@/hooks/use-expenses';
import { getCategoryBreakdown, sumExpenses } from '@/lib/breakdown';
import { todayKey } from '@/lib/date';
import { formatCurrency } from '@/lib/format';
import type { Expense } from '@/lib/schemas/expense';
import { FlashList } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import { InboxIcon, PlusIcon } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_OPTIONS = {
  title: 'Finanzas',
  headerRight: () => <ThemeToggle />,
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [day, setDay] = React.useState(todayKey);

  const expensesQuery = useExpensesByDay(day);
  const daysQuery = useDaysWithExpenses();

  const expenses = expensesQuery.data ?? [];
  const total = React.useMemo(() => sumExpenses(expenses), [expenses]);
  const slices = React.useMemo(() => getCategoryBreakdown(expenses), [expenses]);

  const renderItem = React.useCallback(
    ({ item }: { item: Expense }) => (
      <ExpenseCard
        expense={item}
        onPress={() => router.push({ pathname: '/expense/[id]', params: { id: item.id } })}
      />
    ),
    [router]
  );

  return (
    <View className="bg-background flex-1">
      <Stack.Screen options={SCREEN_OPTIONS} />

      <FlashList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 96,
        }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        refreshControl={
          <RefreshControl
            refreshing={expensesQuery.isRefetching}
            onRefresh={() => expensesQuery.refetch()}
          />
        }
        ListHeaderComponent={
          <View className="mb-4 gap-4">
            <DatePickerDialog value={day} onChange={setDay} markedDays={daysQuery.data ?? []} />

            <Card className="items-center py-6">
              {expensesQuery.isPending ? (
                <View className="h-[210px] justify-center">
                  <ActivityIndicator />
                </View>
              ) : (
                <ExpensesDoughnut slices={slices} total={total} />
              )}
            </Card>

            <View className="flex-row items-baseline justify-between px-1">
              <Text className="text-lg font-semibold">Gastos del día</Text>
              <Text className="text-muted-foreground text-sm">
                {expenses.length === 1 ? '1 gasto' : `${expenses.length} gastos`} ·{' '}
                {formatCurrency(total)}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          expensesQuery.isPending ? null : (
            <View className="items-center gap-3 px-6 py-12">
              <Icon as={InboxIcon} className="text-muted-foreground size-10" />
              <Text className="text-muted-foreground text-center">
                Sin gastos registrados este día.{'\n'}Toca el botón + para agregar el primero.
              </Text>
            </View>
          )
        }
      />

      <View
        className="absolute right-5"
        style={{ bottom: insets.bottom + 24 }}
        pointerEvents="box-none">
        <Button
          size="icon"
          className="size-16 rounded-full shadow-lg shadow-black/25"
          accessibilityLabel="Agregar nuevo gasto"
          onPress={() => router.push({ pathname: '/expense/new', params: { date: day } })}>
          <Icon as={PlusIcon} className="size-7" />
        </Button>
      </View>
    </View>
  );
}
