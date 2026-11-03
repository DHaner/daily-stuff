import {
  CategoryFilterSheet,
  type CategoryFilterSheetHandle,
} from '@/components/expenses/category-filter-sheet';
import { FormField } from '@/components/expenses/form-field';
import { Text } from '@/components/ui/text';
import { getCategory, useCategories, type CategoryId } from '@/lib/categories';
import * as React from 'react';
import { Keyboard } from 'react-native';

type CategoryFieldProps = {
  /** Which categories the sheet lists. */
  kind: 'gasto' | 'ingreso';
  value: string;
  onChange: (categoryId: CategoryId) => void;
  error?: string;
  last?: boolean;
};

/** Form row showing the chosen category; pressing it opens the category bottom sheet. */
export function CategoryField({ kind, value, onChange, error, last }: CategoryFieldProps) {
  useCategories();
  const sheetRef = React.useRef<CategoryFilterSheetHandle>(null);
  const category = getCategory(value);

  return (
    <>
      <FormField
        label="Categoría"
        caption="Categoría"
        icon={category.icon}
        iconColor={category.color}
        last={last}
        error={error}
        onPress={() => {
          Keyboard.dismiss();
          sheetRef.current?.present();
        }}>
        <Text className="h-8 text-base leading-8 font-medium">{category.label}</Text>
      </FormField>

      <CategoryFilterSheet
        ref={sheetRef}
        type={kind}
        value={value}
        showAll={false}
        onChange={(next) => onChange(next as CategoryId)}
      />
    </>
  );
}
