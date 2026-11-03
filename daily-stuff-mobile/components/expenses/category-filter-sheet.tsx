import { Icon } from '@/components/ui/icon';
import { RipplePressable } from '@/components/ui/ripple-pressable';
import { Text } from '@/components/ui/text';
import { useCategories, type Category } from '@/lib/categories';
import { PALETTE } from '@/lib/theme';
import type { CategoryFilter, TypeFilter } from '@/lib/transactions';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { CheckIcon, LayersIcon, ShapesIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

export type CategoryFilterSheetHandle = {
  present: () => void;
};

type CategoryListProps = {
  type: TypeFilter;
  value: CategoryFilter;
  onSelect: (categoryId: CategoryFilter) => void;
  /** Show the "all categories" row (filters). Pickers that must choose one set it to false. */
  showAll?: boolean;
};

/** Rows for every category of the given type; render it inside a scrollable sheet. */
export function CategoryList({ type, value, onSelect, showAll = true }: CategoryListProps) {
  const { theme } = useUniwind();
  const palette = PALETTE[theme ?? 'light'];
  const categories = useCategories();

  function renderRow(id: CategoryFilter, label: string, icon: Category['icon'], color?: string) {
    const selected = value === id;

    return (
      <RipplePressable
        key={id}
        onPress={() => onSelect(id)}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        className="flex-row items-center gap-3 rounded-xl px-3 py-3">
        <View
          className="size-9 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color ?? palette.mutedForeground}22` }}>
          <Icon as={icon} className="size-5" color={color ?? palette.mutedForeground} />
        </View>
        <Text className="flex-1 text-base font-medium">{label}</Text>
        {selected ? <Icon as={CheckIcon} className="text-primary size-5" /> : null}
      </RipplePressable>
    );
  }

  function renderGroup(title: string, items: Category[]) {
    return (
      <View key={title}>
        <Text className="text-muted-foreground px-3 pt-3 pb-1 text-sm font-semibold">{title}</Text>
        {items.map((item) => renderRow(item.id, item.label, item.icon, item.color))}
      </View>
    );
  }

  return (
    <>
      {showAll ? renderRow('todas', 'Todas las categorías', LayersIcon) : null}
      {type !== 'ingreso' ? renderGroup('Gastos', categories.expense) : null}
      {type !== 'gasto' ? renderGroup('Ingresos', categories.income) : null}
    </>
  );
}

type CategoryFilterSheetProps = {
  type: TypeFilter;
  value: CategoryFilter;
  onChange: (categoryId: CategoryFilter) => void;
  /** Show the "all categories" row (filters). Pickers that must choose one set it to false. */
  showAll?: boolean;
  /** Fires once the sheet has fully closed, whether or not a category was picked. */
  onDismiss?: () => void;
  /** Runs just before navigating to the category editor (e.g. to close a sheet underneath). */
  onManage?: () => void;
};

/** Bottom sheet with every category of the current type, so the filter is easy to tap. */
export const CategoryFilterSheet = React.forwardRef<
  CategoryFilterSheetHandle,
  CategoryFilterSheetProps
>(function CategoryFilterSheet(
  { type, value, onChange, showAll = true, onDismiss, onManage },
  ref
) {
  const { theme } = useUniwind();
  const palette = PALETTE[theme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const sheetRef = React.useRef<BottomSheetModal>(null);

  React.useImperativeHandle(ref, () => ({
    present: () => sheetRef.current?.present(),
  }));

  const renderBackdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      maxDynamicContentSize={520}
      enablePanDownToClose
      // `push` keeps a sheet underneath (the quick-add form) where it is; the default `switch`
      // would minimise it.
      stackBehavior="push"
      onDismiss={onDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: palette.card }}
      handleIndicatorStyle={{ backgroundColor: palette.border }}>
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: insets.bottom + 16 }}>
        <CategoryList
          type={type}
          value={value}
          showAll={showAll}
          onSelect={(categoryId) => {
            onChange(categoryId);
            sheetRef.current?.dismiss();
          }}
        />

        <RipplePressable
          onPress={() => {
            sheetRef.current?.dismiss();
            onManage?.();
            router.push('/categories');
          }}
          accessibilityRole="button"
          className="border-border mt-2 flex-row items-center gap-3 rounded-xl border-t px-3 py-3">
          <View className="size-9 items-center justify-center">
            <Icon as={ShapesIcon} className="text-muted-foreground size-5" />
          </View>
          <Text className="text-muted-foreground flex-1 text-base font-medium">
            Editar categorías
          </Text>
        </RipplePressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});
