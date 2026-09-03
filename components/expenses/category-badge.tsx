import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { getCategory } from '@/lib/categories';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

export function CategoryBadge({
  categoryId,
  className,
}: {
  categoryId: string;
  className?: string;
}) {
  const category = getCategory(categoryId);

  return (
    <View
      className={cn('flex-row items-center gap-1.5 rounded-full px-2.5 py-1', className)}
      style={{ backgroundColor: `${category.color}22` }}>
      <Icon as={category.icon} className="size-3.5" color={category.color} />
      <Text className="text-xs font-medium" style={{ color: category.color }}>
        {category.label}
      </Text>
    </View>
  );
}
