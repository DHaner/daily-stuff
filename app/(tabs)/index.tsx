import { ExpensesDoughnut } from '@/components/expenses/expenses-doughnut';
import { TypeCategoryFilters } from '@/components/expenses/filters-bar';
import { QuickAddSheet, type QuickAddSheetHandle } from '@/components/expenses/quick-add-sheet';
import { CategorySummaryCard, TransactionCard } from '@/components/expenses/transaction-card';
import { GoToTodayButton } from '@/components/go-to-today-button';
import { MonthNav } from '@/components/month-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useExpensesByRange } from '@/hooks/use-expenses';
import { useIncomesByRange } from '@/hooks/use-incomes';
import { useMonthScroll } from '@/hooks/use-month-scroll';
import { useCategories } from '@/lib/categories';
import { getCategoryBreakdown, getTypeBreakdown, sumExpenses } from '@/lib/breakdown';
import { formatCurrency } from '@/lib/format';
import { ALL_TIME, formatDayLabel, toMonthKey, todayKey, type DayKey } from '@/lib/date';
import { groupByDay } from '@/lib/day-groups';
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
import { InboxIcon, PlusIcon, ShapesIcon } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Every row carries the day (or, for category summaries, the month) it belongs to. */
type ListRow =
  | { type: 'header'; date: DayKey }
  | { type: 'item'; date: DayKey; item: Transaction }
  | { type: 'category'; date: DayKey; categoryTotal: CategoryTotal };

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { version: categoriesVersion } = useCategories();
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>('todos');
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilter>('todas');
  const [groupByCategory, setGroupByCategory] = React.useState(false);
  const quickAddRef = React.useRef<QuickAddSheetHandle>(null);
  const animatedIndex = useSharedValue(-1);

  const expensesQuery = useExpensesByRange(ALL_TIME.start, ALL_TIME.end, {
    enabled: typeFilter !== 'ingreso',
  });
  const incomesQuery = useIncomesByRange(ALL_TIME.start, ALL_TIME.end, {
    enabled: typeFilter !== 'gasto',
  });

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

  // The full history, newest first, with a header before each day.
  const dayRows = React.useMemo<ListRow[]>(
    () => groupByDay(filtered, (transaction) => transaction.date),
    [filtered]
  );
  const {
    listRef,
    month,
    months,
    goToMonth,
    showTop,
    onScroll,
    scrollToTop,
    onViewableItemsChanged,
    viewabilityConfig,
  } =
    useMonthScroll<ListRow>(dayRows, !groupByCategory);

  // The chart and totals summarize whichever month the header is showing.
  const monthTransactions = React.useMemo(
    () => filtered.filter((transaction) => toMonthKey(transaction.date) === month),
    [filtered, month]
  );

  const total = React.useMemo(() => {
    if (typeFilter === 'ingreso') return sumExpenses(monthTransactions);
    if (typeFilter === 'gasto') return sumExpenses(monthTransactions);
    return sumNet(monthTransactions);
  }, [monthTransactions, typeFilter]);
  const slices = React.useMemo(() => {
    if (typeFilter === 'todos') {
      return getTypeBreakdown(monthTransactions);
    }
    return getCategoryBreakdown(monthTransactions);
    // Slices carry category labels/colors, so they must be rebuilt when categories are edited.
  }, [monthTransactions, typeFilter, categoriesVersion]);

  // Category summaries are a per-month view, so they replace the day-by-day history.
  const rows = React.useMemo<ListRow[]>(
    () =>
      groupByCategory
        ? groupTransactionsByCategory(monthTransactions).map((categoryTotal) => ({
            type: 'category',
            date: `${month}-01`,
            categoryTotal,
          }))
        : dayRows,
    [groupByCategory, monthTransactions, month, dayRows]
  );

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

      const transaction = item.item;
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
          headerTitleAlign: 'center',
          headerTitle: () => <MonthNav months={months} value={month} onChange={goToMonth} />,
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
        ref={listRef}
        data={rows}
        keyExtractor={(row) => {
          if (row.type === 'header') return `header-${row.date}`;
          if (row.type === 'category') return `category-${row.categoryTotal.categoryId}`;
          return `${row.item.kind}-${row.item.id}`;
        }}
        getItemType={(row) => row.type}
        renderItem={renderItem}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
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
                Aún no hay movimientos registrados.
              </Text>
            </View>
          )
        }
      />

      <GoToTodayButton visible={showTop} onPress={scrollToTop} bottom={insets.bottom + 40} />

      <Animated.View
        className="absolute right-5"
        style={[{ bottom: insets.bottom + 24 }, fabAnimatedStyle]}
        pointerEvents="box-none">
        <Button
          size="icon"
          className="size-16 rounded-full"
          accessibilityLabel="Agregar nuevo gasto"
          onPress={() => quickAddRef.current?.present(todayKey())}>
          <Icon as={PlusIcon} className="size-7" />
        </Button>
      </Animated.View>

      <QuickAddSheet ref={quickAddRef} animatedIndex={animatedIndex} />
    </View>
  );
}
