import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { getCategory, useCategories } from '@/lib/categories';
import type { Period } from '@/lib/date';
import type { CategoryFilter, TypeFilter } from '@/lib/transactions';
import { cn } from '@/lib/utils';
import { ArrowDownCircleIcon, ArrowUpCircleIcon, LayersIcon, TagIcon } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'dia', label: 'Día' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
  { value: 'anio', label: 'Año' },
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'gasto', label: 'Gastos' },
  { value: 'ingreso', label: 'Ingresos' },
];

type PeriodTabsProps = {
  period: Period;
  onPeriodChange: (period: Period) => void;
};

export function PeriodTabs({ period, onPeriodChange }: PeriodTabsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
      {PERIOD_OPTIONS.map((option) => (
        <Button
          key={option.value}
          variant={period === option.value ? 'default' : 'outline'}
          size="sm"
          onPress={() => onPeriodChange(option.value)}>
          <Text
            className={cn('text-sm', period === option.value ? 'text-primary-foreground' : undefined)}>
            {option.label}
          </Text>
        </Button>
      ))}
    </ScrollView>
  );
}

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
  const categories = useCategories();

  function handleTypeChange(nextType: TypeFilter) {
    onTypeChange(nextType);
    // The previously selected category may not exist for the new type.
    onCategoryChange('todas');
  }

  const typeLabel = TYPE_OPTIONS.find((option) => option.value === type)?.label ?? 'Todos';
  const categoryLabel = categoryId === 'todas' ? 'Categoría' : getCategory(categoryId).label;

  return (
    <View className="flex-row gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger size="sm" className="flex-1">
          <Icon
            as={type === 'gasto' ? ArrowDownCircleIcon : ArrowUpCircleIcon}
            className={cn(
              'size-4',
              type === 'todos' && 'text-muted-foreground',
              type === 'gasto' && 'text-destructive',
              type === 'ingreso' && 'text-green-600'
            )}
          />
          <Text variant="small">{typeLabel}</Text>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup
            value={type}
            onValueChange={(value) => handleTypeChange(value as TypeFilter)}>
            {TYPE_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                <Text>{option.label}</Text>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger size="sm" className="flex-1">
          <Icon as={TagIcon} className="text-muted-foreground size-4" />
          <Text variant="small" numberOfLines={1}>
            {categoryLabel}
          </Text>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup
            value={categoryId}
            onValueChange={(value) => onCategoryChange(value as CategoryFilter)}>
            <DropdownMenuRadioItem value="todas">
              <Text>Todas</Text>
            </DropdownMenuRadioItem>

            {type !== 'ingreso' ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Gastos</DropdownMenuLabel>
                {categories.expense.map((category) => (
                  <DropdownMenuRadioItem key={category.id} value={category.id}>
                    <Icon as={category.icon} className="size-4" color={category.color} />
                    <Text>{category.label}</Text>
                  </DropdownMenuRadioItem>
                ))}
              </>
            ) : null}

            {type !== 'gasto' ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Ingresos</DropdownMenuLabel>
                {categories.income.map((category) => (
                  <DropdownMenuRadioItem key={category.id} value={category.id}>
                    <Icon as={category.icon} className="size-4" color={category.color} />
                    <Text>{category.label}</Text>
                  </DropdownMenuRadioItem>
                ))}
              </>
            ) : null}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant={groupByCategory ? 'default' : 'outline'}
        size="icon"
        accessibilityLabel="Agrupar por categoría"
        accessibilityState={{ selected: groupByCategory }}
        onPress={() => onGroupByCategoryChange(!groupByCategory)}>
        <Icon
          as={LayersIcon}
          className={cn('size-4', groupByCategory ? 'text-primary-foreground' : 'text-muted-foreground')}
        />
      </Button>
    </View>
  );
}
