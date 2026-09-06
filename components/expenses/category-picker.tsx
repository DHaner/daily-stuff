import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { CATEGORY_LIST, getCategory, type Category, type CategoryId } from '@/lib/categories';
import { cn } from '@/lib/utils';
import { Pressable, View } from 'react-native';

type CategoryPickerProps = {
  value: string;
  onChange: (categoryId: CategoryId) => void;
  /** Defaults to the expense category list. */
  categories?: Category[];
  className?: string;
};

/** Horizontal chip picker — faster to tap on a phone than a dropdown. */
export function CategoryPicker({
  value,
  onChange,
  categories = CATEGORY_LIST,
  className,
}: CategoryPickerProps) {
  const selected = getCategory(value);

  return (
    <View className={cn('flex-row flex-wrap gap-2', className)}>
      {categories.map((category) => {
        const isSelected = category.id === selected.id;

        return (
          <Pressable
            key={category.id}
            onPress={() => onChange(category.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            className={cn(
              'flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 active:opacity-80',
              isSelected ? 'border-transparent' : 'border-border bg-card'
            )}
            style={isSelected ? { backgroundColor: category.color } : undefined}>
            <Icon
              as={category.icon}
              className="size-4"
              color={isSelected ? '#ffffff' : category.color}
            />
            <Text
              className={cn('text-sm', isSelected ? 'font-semibold' : 'text-muted-foreground')}
              style={isSelected ? { color: '#ffffff' } : undefined}>
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
