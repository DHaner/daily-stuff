import { CategoryBadge } from '@/components/expenses/category-badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { getCategory, useCategories } from '@/lib/categories';
import { formatCurrency } from '@/lib/format';
import type { Expense } from '@/lib/schemas/expense';
import { ChevronRightIcon, LayersIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export function ExpenseCard({ expense, onPress }: { expense: Expense; onPress: () => void }) {
  useCategories();
  const category = getCategory(expense.categoryId);
  const itemCount = expense.items.length;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="active:opacity-70">
      <Card className="gap-3 overflow-hidden py-4">
        {/* Category colour rail */}
        <View
          className="absolute top-0 bottom-0 left-0 w-1.5"
          style={{ backgroundColor: category.color }}
        />

        <View className="flex-row items-start gap-3 px-5">
          <View className="flex-1 gap-1">
            <Text className="text-base font-semibold" numberOfLines={1}>
              {expense.concept}
            </Text>
            {expense.description.length > 0 ? (
              <Text className="text-muted-foreground text-sm" numberOfLines={2}>
                {expense.description}
              </Text>
            ) : null}
          </View>

          <View className="items-end gap-1">
            <Text className="text-base font-bold">{formatCurrency(expense.total)}</Text>
            <Icon as={ChevronRightIcon} className="text-muted-foreground size-4" />
          </View>
        </View>

        <View className="flex-row items-center gap-2 px-5">
          <CategoryBadge categoryId={expense.categoryId} />
          {itemCount > 0 ? (
            <View className="bg-muted flex-row items-center gap-1.5 rounded-full px-2.5 py-1">
              <Icon as={LayersIcon} className="text-muted-foreground size-3.5" />
              <Text className="text-muted-foreground text-xs font-medium">
                {itemCount === 1 ? '1 sub-gasto' : `${itemCount} sub-gastos`}
              </Text>
            </View>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}
