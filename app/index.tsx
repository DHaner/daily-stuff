import { DatePicker } from '@/components/expenses/date-picker';
import { ExpensesDoughnut } from '@/components/expenses/expenses-doughnut';
import { PeriodTabs, TypeCategoryFilters } from '@/components/expenses/filters-bar';
import { QuickAddSheet, type QuickAddSheetHandle } from '@/components/expenses/quick-add-sheet';
import { TransactionCard } from '@/components/expenses/transaction-card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useDaysWithExpenses, useExpensesByRange } from '@/hooks/use-expenses';
import { useDaysWithIncomes, useIncomesByRange } from '@/hooks/use-incomes';
import { getCategoryBreakdown, sumExpenses } from '@/lib/breakdown';
import { getPeriodRange, shiftPeriod, todayKey, type Period } from '@/lib/date';
import { formatCurrency } from '@/lib/format';
import { filterTransactions, mergeTransactions, sumNet, type CategoryFilter, type Transaction, type TypeFilter } from '@/lib/transactions';
import { FlashList } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeftIcon, ChevronRightIcon, InboxIcon, PlusIcon } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_OPTIONS = {
  title: 'Finanzas',
  headerRight: () => <ThemeToggle />,
};

const PERIOD_NOUN: Record<Period, string> = {
  dia: 'día',
  semana: 'semana',
  mes: 'mes',
  anio: 'año',
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [day, setDay] = React.useState(todayKey);
  const [period, setPeriod] = React.useState<Period>('dia');
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>('todos');
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilter>('todas');
  const quickAddRef = React.useRef<QuickAddSheetHandle>(null);
  const animatedIndex = useSharedValue(-1);

  const range = React.useMemo(() => getPeriodRange(day, period), [day, period]);

  const expensesQuery = useExpensesByRange(range.start, range.end, {
    enabled: typeFilter !== 'ingreso',
  });
  const incomesQuery = useIncomesByRange(range.start, range.end, {
    enabled: typeFilter !== 'gasto',
  });
  const daysWithExpensesQuery = useDaysWithExpenses();
  const daysWithIncomesQuery = useDaysWithIncomes();
  const isCurrentDayToday = day === todayKey();

  const markedDays = React.useMemo(
    () => [...new Set([...(daysWithExpensesQuery.data ?? []), ...(daysWithIncomesQuery.data ?? [])])],
    [daysWithExpensesQuery.data, daysWithIncomesQuery.data]
  );

  const isPending =
    (typeFilter !== 'ingreso' && expensesQuery.isPending) ||
    (typeFilter !== 'gasto' && incomesQuery.isPending);
  const isRefetching = expensesQuery.isRefetching || incomesQuery.isRefetching;

  const transactions = React.useMemo(
    () => mergeTransactions(expensesQuery.data ?? [], incomesQuery.data ?? []),
    [expensesQuery.data, incomesQuery.data]
  );
  const filtered = React.useMemo(
    () => filterTransactions(transactions, { type: typeFilter, categoryId: categoryFilter }),
    [transactions, typeFilter, categoryFilter]
  );

  const total = React.useMemo(() => {
    if (typeFilter === 'ingreso') return sumExpenses(filtered);
    if (typeFilter === 'gasto') return sumExpenses(filtered);
    return sumNet(filtered);
  }, [filtered, typeFilter]);
  const slices = React.useMemo(() => getCategoryBreakdown(filtered), [filtered]);

  const renderItem = React.useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionCard
        transaction={item}
        onPress={() =>
          router.push(
            item.kind === 'gasto'
              ? { pathname: '/expense/[id]', params: { id: item.id } }
              : { pathname: '/income/[id]', params: { id: item.id } }
          )
        }
      />
    ),
    [router]
  );

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(animatedIndex.value, [-1, 0], [0, 160], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <View className="bg-background flex-1">
      <Stack.Screen options={SCREEN_OPTIONS} />

      <FlashList
        data={filtered}
        keyExtractor={(item) => `${item.kind}-${item.id}`}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 96,
        }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              expensesQuery.refetch();
              incomesQuery.refetch();
            }}
          />
        }
        ListHeaderComponent={
          <View className="mb-4 gap-4">
            <View className="flex-row items-center justify-between gap-2 w-full">
              <Button
                variant="outline"
                size="icon"
                accessibilityLabel="Período anterior"
                onPress={() => setDay((current) => shiftPeriod(current, period, -1))}>
                <Icon as={ChevronLeftIcon} className="size-5" />
              </Button>

              <View className="flex-1">
                <DatePicker value={day} onChange={setDay} markedDays={markedDays} period={period} />
              </View>

              {isCurrentDayToday && period === 'dia' ? (
                <View className="size-10 sm:size-9" />
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  accessibilityLabel="Período siguiente"
                  onPress={() => setDay((current) => shiftPeriod(current, period, 1))}>
                  <Icon as={ChevronRightIcon} className="size-5" />
                </Button>
              )}
            </View>

            <PeriodTabs period={period} onPeriodChange={setPeriod} />

            <Card className="items-center py-6">
              {isPending ? (
                <View className="h-[210px] justify-center">
                  <ActivityIndicator />
                </View>
              ) : (
                <ExpensesDoughnut slices={slices} total={total} />
              )}
            </Card>

            <TypeCategoryFilters
              type={typeFilter}
              onTypeChange={setTypeFilter}
              categoryId={categoryFilter}
              onCategoryChange={setCategoryFilter}
            />
          </View>
        }
        ListEmptyComponent={
          isPending ? null : (
            <View className="items-center gap-3 px-6 py-12">
              <Icon as={InboxIcon} className="text-muted-foreground size-10" />
              <Text className="text-muted-foreground text-center">
                Sin movimientos registrados en este período.
              </Text>
            </View>
          )
        }
      />

      <Animated.View
        className="absolute right-5"
        style={[{ bottom: insets.bottom + 24 }, fabAnimatedStyle]}
        pointerEvents="box-none">
        <Button
          size="icon"
          className="size-16 rounded-full shadow-lg shadow-black/25"
          accessibilityLabel="Agregar nuevo gasto"
          onPress={() => quickAddRef.current?.present(day)}>
          <Icon as={PlusIcon} className="size-7" />
        </Button>
      </Animated.View>

      <QuickAddSheet ref={quickAddRef} animatedIndex={animatedIndex} />
    </View>
  );
}
