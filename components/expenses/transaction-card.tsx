import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { getCategory } from '@/lib/categories';
import { formatCurrency } from '@/lib/format';
import type { Transaction } from '@/lib/transactions';
import { cn } from '@/lib/utils';
import { ChevronRightIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export function TransactionCard({
  transaction,
  onPress,
}: {
  transaction: Transaction;
  onPress?: () => void;
}) {
  const category = getCategory(transaction.categoryId);
  const itemCount = transaction.items.length;
  const isIncome = transaction.kind === 'ingreso';

  const subtitle =
    itemCount > 0
      ? `${category.label} · ${itemCount === 1 ? '1 sub-ítem' : `${itemCount} sub-ítems`}`
      : transaction.description.length > 0
        ? `${category.label} · ${transaction.description}`
        : category.label;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      className="active:opacity-70">
      <Card
        className="flex-row items-center gap-3 px-4 py-3"
        style={{ borderLeftWidth: 4, borderLeftColor: category.color }}>
        <View
          className="size-11 items-center justify-center rounded-full"
          style={{ backgroundColor: `${category.color}22` }}>
          <Icon as={category.icon} className="size-5" color={category.color} />
        </View>

        <View className="flex-1 gap-0.5">
          <Text className="text-base font-semibold" numberOfLines={1}>
            {transaction.concept}
          </Text>
          <Text className="text-muted-foreground text-xs" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text
            className={cn('text-base font-bold', isIncome ? 'text-green-600' : 'text-destructive')}
            numberOfLines={1}>
            {isIncome ? '+' : '-'}
          </Text>
          <Text
            className='text-base font-semibold'
            numberOfLines={1}>
            {formatCurrency(transaction.total)}
          </Text>
        </View>

        {onPress ? <Icon as={ChevronRightIcon} className="text-muted-foreground size-4" /> : null}
      </Card>
    </Pressable>
  );
}
