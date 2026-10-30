import { TransactionCard } from '@/components/expenses/transaction-card';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useExpensesByCategory } from '@/hooks/use-expenses';
import { useIncomesByCategory } from '@/hooks/use-incomes';
import { getCategory, useCategories } from '@/lib/categories';
import { formatDayLabel, type DayKey } from '@/lib/date';
import { formatCurrency } from '@/lib/format';
import { mergeTransactions, sumNet, type Transaction } from '@/lib/transactions';
import { FlashList } from '@shopify/flash-list';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { InboxIcon } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

type ListRow =
  | { type: 'header'; date: DayKey }
  | { type: 'transaction'; transaction: Transaction };

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  useCategories();
  const category = getCategory(id);
  const isExpenseCategory = category.kind === 'gasto';

  const expensesQuery = useExpensesByCategory(id, { enabled: isExpenseCategory });
  const incomesQuery = useIncomesByCategory(id, { enabled: !isExpenseCategory });

  const isPending = isExpenseCategory ? expensesQuery.isPending : incomesQuery.isPending;

  const transactions = React.useMemo(
    () =>
      isExpenseCategory
        ? mergeTransactions(expensesQuery.data ?? [], [])
        : mergeTransactions([], incomesQuery.data ?? []),
    [isExpenseCategory, expensesQuery.data, incomesQuery.data]
  );

  const total = React.useMemo(() => sumNet(transactions), [transactions]);

  const rows = React.useMemo<ListRow[]>(() => {
    const result: ListRow[] = [];
    let lastDate: DayKey | null = null;

    for (const transaction of transactions) {
      if (transaction.date !== lastDate) {
        result.push({ type: 'header', date: transaction.date });
        lastDate = transaction.date;
      }
      result.push({ type: 'transaction', transaction });
    }

    return result;
  }, [transactions]);

  const renderItem = React.useCallback(
    ({ item }: { item: ListRow }) => {
      if (item.type === 'header') {
        return (
          <Text className="text-muted-foreground mb-2 text-sm font-semibold capitalize">
            {formatDayLabel(item.date)}
          </Text>
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

  return (
    <View className="bg-background flex-1">
      <Stack.Screen options={{ title: category.label }} />

      <FlashList
        data={rows}
        keyExtractor={(row) =>
          row.type === 'header' ? `header-${row.date}` : `${row.transaction.kind}-${row.transaction.id}`
        }
        getItemType={(row) => row.type}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={
          <Card className="mb-4 items-center gap-1 py-6">
            <Icon as={category.icon} className="size-6" color={category.color} />
            <Text className="text-muted-foreground text-xs tracking-wide uppercase">
              Total {isExpenseCategory ? 'gastado' : 'recibido'}
            </Text>
            {isPending ? (
              <ActivityIndicator />
            ) : (
              <Text className="text-3xl font-bold">{formatCurrency(Math.abs(total))}</Text>
            )}
          </Card>
        }
        ListEmptyComponent={
          isPending ? null : (
            <View className="items-center gap-3 px-6 py-12">
              <Icon as={InboxIcon} className="text-muted-foreground size-10" />
              <Text className="text-muted-foreground text-center">
                No hay movimientos registrados en esta categoría.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
