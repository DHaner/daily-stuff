import {
  CategoryFilterSheet,
  type CategoryFilterSheetHandle,
} from '@/components/expenses/category-filter-sheet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { getCategory, useCategories } from '@/lib/categories';
import type { CategoryFilter, TypeFilter } from '@/lib/transactions';
import { cn } from '@/lib/utils';
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  ChevronDownIcon,
  LayersIcon,
  ListIcon,
  TagIcon,
  type LucideIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

const TYPE_OPTIONS: {
  value: TypeFilter;
  label: string;
  icon: LucideIcon;
  iconClassName: string;
}[] = [
  { value: 'todos', label: 'Todos', icon: ListIcon, iconClassName: 'text-muted-foreground' },
  { value: 'gasto', label: 'Gastos', icon: ArrowDownCircleIcon, iconClassName: 'text-destructive' },
  { value: 'ingreso', label: 'Ingresos', icon: ArrowUpCircleIcon, iconClassName: 'text-green-600' },
];

type TypeCategoryFiltersProps = {
  type: TypeFilter;
  onTypeChange: (type: TypeFilter) => void;
  categoryId: CategoryFilter;
  onCategoryChange: (categoryId: CategoryFilter) => void;
  groupByCategory: boolean;
  onGroupByCategoryChange: (grouped: boolean) => void;
};

export function TypeCategoryFilters({
  type,
  onTypeChange,
  categoryId,
  onCategoryChange,
  groupByCategory,
  onGroupByCategoryChange,
}: TypeCategoryFiltersProps) {
  useCategories();
  const categorySheetRef = React.useRef<CategoryFilterSheetHandle>(null);

  function handleTypeChange(nextType: TypeFilter) {
    onTypeChange(nextType);
    // The previously selected category may not exist for the new type.
    onCategoryChange('todas');
  }

  const selectedType = TYPE_OPTIONS.find((option) => option.value === type) ?? TYPE_OPTIONS[0];
  const selectedCategory = categoryId === 'todas' ? null : getCategory(categoryId);
  const categoryLabel = selectedCategory?.label ?? 'Categoría';

  return (
    <View className="flex-row gap-2">
      <View className="flex-1">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <View className="flex-1 flex-row items-center gap-2">
              <Icon as={selectedType.icon} className={cn('size-4', selectedType.iconClassName)} />
              <Text variant="small" numberOfLines={1}>
                {selectedType.label}
              </Text>
            </View>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              value={type}
              onValueChange={(value) => handleTypeChange(value as TypeFilter)}>
              {TYPE_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  <Icon as={option.icon} className={cn('size-4', option.iconClassName)} />
                  <Text>{option.label}</Text>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </View>

      <View className="flex-1">
        <Button
          variant="outline"
          className="w-full justify-between"
          accessibilityLabel="Filtrar por categoría"
          onPress={() => categorySheetRef.current?.present()}>
          <View className="flex-1 flex-row items-center gap-2">
            {selectedCategory ? (
              <Icon as={selectedCategory.icon} className="size-4" color={selectedCategory.color} />
            ) : (
              <Icon as={TagIcon} className="text-muted-foreground size-4" />
            )}
            <Text variant="small" numberOfLines={1}>
              {categoryLabel}
            </Text>
          </View>
          <Icon as={ChevronDownIcon} className="text-muted-foreground size-4" />
        </Button>
      </View>

      <Button
        variant={groupByCategory ? 'default' : 'outline'}
        size="icon"
        accessibilityLabel="Agrupar por categoría"
        accessibilityState={{ selected: groupByCategory }}
        onPress={() => onGroupByCategoryChange(!groupByCategory)}>
        <Icon
          as={LayersIcon}
          className={cn(
            'size-4',
            groupByCategory ? 'text-primary-foreground' : 'text-muted-foreground'
          )}
        />
      </Button>

      <CategoryFilterSheet
        ref={categorySheetRef}
        type={type}
        value={categoryId}
        onChange={onCategoryChange}
      />
    </View>
  );
}
