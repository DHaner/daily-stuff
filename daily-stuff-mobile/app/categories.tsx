import { ColorPicker } from '@/components/journal/color-picker';
import { IconPicker } from '@/components/journal/icon-picker';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { RipplePressable } from '@/components/ui/ripple-pressable';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useCreateCategory, useDeleteCategory, useUpdateCategory } from '@/hooks/use-categories';
import {
  isDefaultCategory,
  useCategories,
  type Category,
  type CategoryKind,
} from '@/lib/categories';
import { DEFAULT_LABEL_COLOR } from '@/lib/journal-colors';
import { DEFAULT_LABEL_ICON, getLabelIcon } from '@/lib/journal-icons';
import { cn } from '@/lib/utils';
import { FlashList } from '@shopify/flash-list';
import { CheckIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react-native';
import * as React from 'react';
import { Alert, KeyboardAvoidingView, Platform, View } from 'react-native';
import { z } from 'zod';

const KIND_OPTIONS: { value: CategoryKind; label: string }[] = [
  { value: 'gasto', label: 'Gastos' },
  { value: 'ingreso', label: 'Ingresos' },
];

const categoryFormSchema = z.object({
  label: z.string().trim().min(1, 'El nombre es obligatorio').max(24, 'Máximo 24 caracteres'),
  iconName: z.string().min(1, 'Elige un icono'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido'),
});

export default function CategoriesScreen() {
  const categories = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [kind, setKind] = React.useState<CategoryKind>('gasto');
  // `editingId` is null while the form creates a new category.
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [label, setLabel] = React.useState('');
  const [iconName, setIconName] = React.useState(DEFAULT_LABEL_ICON);
  const [color, setColor] = React.useState(DEFAULT_LABEL_COLOR);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const parsed = categoryFormSchema.safeParse({ label, iconName, color });
  const isSaving = createCategory.isPending || updateCategory.isPending;
  const isError = createCategory.isError || updateCategory.isError;
  const list = kind === 'gasto' ? categories.expense : categories.income;

  function resetForm() {
    setEditingId(null);
    setLabel('');
    setIconName(DEFAULT_LABEL_ICON);
    setColor(DEFAULT_LABEL_COLOR);
  }

  function handleKindChange(nextKind: CategoryKind) {
    setKind(nextKind);
    resetForm();
  }

  function startEditing(category: Category) {
    setEditingId(category.id);
    setLabel(category.label);
    setIconName(category.iconName);
    setColor(category.color);
  }

  function handleSave() {
    if (!parsed.success || isSaving) return;

    if (editingId) {
      updateCategory.mutate({ id: editingId, values: parsed.data }, { onSuccess: resetForm });
    } else {
      createCategory.mutate({ kind, values: parsed.data }, { onSuccess: resetForm });
    }
  }

  function confirmDelete(category: Category) {
    const noun = category.kind === 'gasto' ? 'gastos' : 'ingresos';

    Alert.alert(
      'Eliminar categoría',
      `Los ${noun} de "${category.label}" pasarán a la categoría "Otros".`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () =>
            deleteCategory.mutate(category.id, {
              onSuccess: () => {
                if (category.id === editingId) resetForm();
              },
            }),
        },
      ]
    );
  }

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlashList
        data={list}
        extraData={editingId}
        keyExtractor={(category) => category.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        ItemSeparatorComponent={() => <View className="h-2" />}
        ListHeaderComponent={
          <View className="mb-6 gap-4">
            <View className="flex-row gap-2">
              {KIND_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={kind === option.value ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onPress={() => handleKindChange(option.value)}>
                  <Text
                    className={cn(
                      'text-sm',
                      kind === option.value ? 'text-primary-foreground' : undefined
                    )}>
                    {option.label}
                  </Text>
                </Button>
              ))}
            </View>

            <View className="gap-3">
              <Text className="text-sm font-semibold">
                {editingId ? 'Editar categoría' : 'Nueva categoría'}
              </Text>

              <View className="flex-row items-center gap-2">
                <RipplePressable
                  onPress={() => setPickerOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Elegir icono"
                  className="border-input bg-card size-10 items-center justify-center rounded-md border">
                  <Icon as={getLabelIcon(iconName)} className="size-5" color={color} />
                </RipplePressable>

                <View className="flex-1">
                  <Input
                    value={label}
                    onChangeText={setLabel}
                    placeholder="Nombre (ej. Mascotas)"
                    maxLength={24}
                    returnKeyType="done"
                    onSubmitEditing={handleSave}
                  />
                </View>

                {editingId ? (
                  <Button
                    size="icon"
                    variant="outline"
                    accessibilityLabel="Cancelar edición"
                    onPress={resetForm}>
                    <Icon as={XIcon} className="size-5" />
                  </Button>
                ) : null}

                <Button
                  size="icon"
                  accessibilityLabel={editingId ? 'Guardar categoría' : 'Crear categoría'}
                  disabled={!parsed.success || isSaving}
                  onPress={handleSave}>
                  <Icon as={editingId ? CheckIcon : PlusIcon} className="size-5" />
                </Button>
              </View>

              <ColorPicker value={color} onChange={setColor} />

              {isError ? (
                <Text className="text-destructive text-xs">
                  No se pudo guardar la categoría. Inténtalo de nuevo.
                </Text>
              ) : null}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <RipplePressable
            onPress={() => startEditing(item)}
            accessibilityRole="button"
            accessibilityLabel={`Editar categoría ${item.label}`}
            className="bg-card border-border flex-row items-center gap-3 rounded-xl border py-2 pr-2 pl-4"
            style={item.id === editingId ? { borderColor: item.color } : undefined}>
            <View className="flex-1 flex-row items-center gap-3 py-1">
              <View
                className="size-9 items-center justify-center rounded-full"
                style={{ backgroundColor: `${item.color}26` }}>
                <Icon as={item.icon} className="size-5" color={item.color} />
              </View>
              <Text className="flex-1 text-base" numberOfLines={1}>
                {item.label}
              </Text>
            </View>

            {/* "Otros" is where deleted categories fall back to, so it can only be edited. */}
            {isDefaultCategory(item.id) ? (
              <View className="size-10" />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                accessibilityLabel={`Eliminar categoría ${item.label}`}
                onPress={() => confirmDelete(item)}>
                <Icon as={Trash2Icon} className="text-destructive size-5" />
              </Button>
            )}
          </RipplePressable>
        )}
      />

      <IconPicker
        visible={pickerOpen}
        value={iconName}
        onSelect={(selected) => {
          setIconName(selected);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}
