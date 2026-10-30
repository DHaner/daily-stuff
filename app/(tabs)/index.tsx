import { DatePicker } from '@/components/expenses/date-picker';
import { ExpensesDoughnut } from '@/components/expenses/expenses-doughnut';
import { PeriodTabs, TypeCategoryFilters } from '@/components/expenses/filters-bar';
import { QuickAddSheet, type QuickAddSheetHandle } from '@/components/expenses/quick-add-sheet';
import { CategorySummaryCard, TransactionCard } from '@/components/expenses/transaction-card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useDaysWithExpenses, useExpensesByRange } from '@/hooks/use-expenses';
import { useDaysWithIncomes, useIncomesByRange } from '@/hooks/use-incomes';
import { useCategories } from '@/lib/categories';
import { getCategoryBreakdown, getTypeBreakdown, sumExpenses } from '@/lib/breakdown';
import {
  formatDayLabel,
  getPeriodRange,
  isCurrentPeriod,
  shiftPeriod,
  todayKey,
  type DayKey,
  type Period,
} from '@/lib/date';
import { formatCurrency } from '@/lib/format';
import {
  filterTransactions,
  groupTransactionsByCategory,
  mergeTransactions,
  sumNet,
  type CategoryFilter,
  type CategoryTotal,
  type Transaction,
  type TypeFilter,
} from '@/lib/transactions';
import { FlashList } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  InboxIcon,
  PlusIcon,
  ShapesIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PERIOD_NOUN: Record<Period, string> = {
  dia: 'día',
  semana: 'semana',
  mes: 'mes',
  anio: 'año',
};

type ListRow =
  | { type: 'header'; date: DayKey }
  | { type: 'transaction'; transaction: Transaction }
  | { type: 'category'; categoryTotal: CategoryTotal };

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { version: categoriesVersion } = useCategories();
  const [day, setDay] = React.useState(todayKey);
  const [period, setPeriod] = React.useState<Period>('dia');
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>('todos');
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilter>('todas');
  const [groupByCategory, setGroupByCategory] = React.useState(false);
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
  const isCurrentPeriodSelected = isCurrentPeriod(day, period);

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
  const slices = React.useMemo(() => {
    if (typeFilter === 'todos') {
      return getTypeBreakdown(filtered);
    }
    return getCategoryBreakdown(filtered);
    // Slices carry category labels/colors, so they must be rebuilt when categories are edited.
  }, [filtered, typeFilter, categoriesVersion]);

  const rows = React.useMemo<ListRow[]>(() => {
    if (groupByCategory) {
      return groupTransactionsByCategory(filtered).map((categoryTotal) => ({
        type: 'category',
        categoryTotal,
      }));
    }

    if (period === 'dia') {
      return filtered.map((transaction) => ({ type: 'transaction', transaction }));
    }

    const result: ListRow[] = [];
    let lastDate: DayKey | null = null;

    for (const transaction of filtered) {
      if (transaction.date !== lastDate) {
        result.push({ type: 'header', date: transaction.date });
        lastDate = transaction.date;
      }
      result.push({ type: 'transaction', transaction });
    }

    return result;
  }, [filtered, period, groupByCategory]);

  const renderItem = React.useCallback(
    ({ item }: { item: ListRow }) => {
      if (item.type === 'header') {
        return (
          <Text className="text-muted-foreground mb-2 text-sm font-semibold capitalize">
            {formatDayLabel(item.date)}
          </Text>
        );
      }

      if (item.type === 'category') {
        return (
          <CategorySummaryCard
            categoryTotal={item.categoryTotal}
            onPress={() =>
              router.push({
                pathname: '/category/[id]',
                params: { id: item.categoryTotal.categoryId },
              })
            }
          />
        );
      }

      const transaction = item.transaction;
      return (
        <TransactionCard
          transaction={transaction}
          onPress={() =>
            router.push(
              transaction.kind === 'gasto'
                ? { pathname: '/expense/[id]', params: { id: transaction.id } }
                : { pathname: '/income/[id]', params: { id: transaction.id } }
            )
          }
        />
      );
    },
    [router]
  );

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(animatedIndex.value, [-1, 0], [0, 160], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <View className="bg-background flex-1">
      <Stack.Screen
        options={{
          title: 'Finanzas',
          headerRight: () => (
            <View className="flex-row items-center">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                accessibilityLabel="Gestionar categorías"
                onPress={() => router.push('/categories')}>
                <Icon as={ShapesIcon} className="size-5" />
              </Button>
              <ThemeToggle />
            </View>
          ),
        }}
      />

      <FlashList
        data={rows}
        keyExtractor={(row) => {
          if (row.type === 'header') return `header-${row.date}`;
          if (row.type === 'category') return `category-${row.categoryTotal.categoryId}`;
          return `${row.transaction.kind}-${row.transaction.id}`;
        }}
        getItemType={(row) => row.type}
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

              {isCurrentPeriodSelected ? (
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
              groupByCategory={groupByCategory}
              onGroupByCategoryChange={setGroupByCategory}
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
