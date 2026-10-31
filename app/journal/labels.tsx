import { ColorPicker } from '@/components/journal/color-picker';
import { IconPicker } from '@/components/journal/icon-picker';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { RipplePressable } from '@/components/ui/ripple-pressable';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import {
  useCreateJournalLabel,
  useDeleteJournalLabel,
  useJournalLabels,
  useUpdateJournalLabel,
} from '@/hooks/use-journal';
import { DEFAULT_LABEL_COLOR } from '@/lib/journal-colors';
import { DEFAULT_LABEL_ICON, getLabelIcon } from '@/lib/journal-icons';
import { journalLabelFormSchema, type JournalLabel } from '@/lib/schemas/journal';
import { FlashList } from '@shopify/flash-list';
import { CheckIcon, PlusIcon, TagsIcon, Trash2Icon, XIcon } from 'lucide-react-native';
import * as React from 'react';
import { Alert, KeyboardAvoidingView, Platform, View } from 'react-native';

export default function JournalLabelsScreen() {
  const labelsQuery = useJournalLabels();
  const createLabel = useCreateJournalLabel();
  const updateLabel = useUpdateJournalLabel();
  const deleteLabel = useDeleteJournalLabel();

  // `editingId` is null while the form creates a new label.
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [icon, setIcon] = React.useState(DEFAULT_LABEL_ICON);
  const [color, setColor] = React.useState(DEFAULT_LABEL_COLOR);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const parsed = journalLabelFormSchema.safeParse({ name, icon, color });
  const isSaving = createLabel.isPending || updateLabel.isPending;
  const isError = createLabel.isError || updateLabel.isError;

  function resetForm() {
    setEditingId(null);
    setName('');
    setIcon(DEFAULT_LABEL_ICON);
    setColor(DEFAULT_LABEL_COLOR);
  }

  function startEditing(label: JournalLabel) {
    setEditingId(label.id);
    setName(label.name);
    setIcon(label.icon);
    setColor(label.color);
  }

  function handleSave() {
    if (!parsed.success || isSaving) return;

    if (editingId) {
      updateLabel.mutate({ id: editingId, values: parsed.data }, { onSuccess: resetForm });
    } else {
      createLabel.mutate(parsed.data, { onSuccess: resetForm });
    }
  }

  function confirmDelete(label: JournalLabel) {
    Alert.alert(
      'Eliminar etiqueta',
      `"${label.name}" se quitará de todas las entradas que la usan.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () =>
            deleteLabel.mutate(label.id, {
              onSuccess: () => {
                if (label.id === editingId) resetForm();
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
        data={labelsQuery.data ?? []}
        extraData={editingId}
        keyExtractor={(label) => label.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        ItemSeparatorComponent={() => <View className="h-2" />}
        ListHeaderComponent={
          <View className="mb-6 gap-3">
            <Text className="text-sm font-semibold">
              {editingId ? 'Editar etiqueta' : 'Nueva etiqueta'}
            </Text>

            <View className="flex-row items-center gap-2">
              <RipplePressable
                onPress={() => setPickerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Elegir icono"
                className="border-input bg-card size-10 items-center justify-center rounded-md border">
                <Icon as={getLabelIcon(icon)} className="size-5" color={color} />
              </RipplePressable>

              <View className="flex-1">
                <Input
                  value={name}
                  onChangeText={setName}
                  placeholder="Nombre (ej. Gimnasio)"
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
                accessibilityLabel={editingId ? 'Guardar etiqueta' : 'Crear etiqueta'}
                disabled={!parsed.success || isSaving}
                onPress={handleSave}>
                <Icon as={editingId ? CheckIcon : PlusIcon} className="size-5" />
              </Button>
            </View>

            <ColorPicker value={color} onChange={setColor} />

            {isError ? (
              <Text className="text-destructive text-xs">
                No se pudo guardar la etiqueta. Inténtalo de nuevo.
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <RipplePressable
            onPress={() => startEditing(item)}
            accessibilityRole="button"
            accessibilityLabel={`Editar etiqueta ${item.name}`}
            className="bg-card border-border flex-row items-center gap-3 rounded-xl border py-2 pr-2 pl-4"
            style={item.id === editingId ? { borderColor: item.color } : undefined}>
            <View className="flex-1 flex-row items-center gap-3 py-1">
              <View
                className="size-9 items-center justify-center rounded-full"
                style={{ backgroundColor: `${item.color}26` }}>
                <Icon as={getLabelIcon(item.icon)} className="size-5" color={item.color} />
              </View>
              <Text className="flex-1 text-base" numberOfLines={1}>
                {item.name}
              </Text>
            </View>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              accessibilityLabel={`Eliminar etiqueta ${item.name}`}
              onPress={() => confirmDelete(item)}>
              <Icon as={Trash2Icon} className="text-destructive size-5" />
            </Button>
          </RipplePressable>
        )}
        ListEmptyComponent={
          labelsQuery.isPending ? null : (
            <View className="items-center gap-3 px-6 py-12">
              <Icon as={TagsIcon} className="text-muted-foreground size-10" />
              <Text className="text-muted-foreground text-center">
                Aún no tienes etiquetas. Crea la primera arriba.
              </Text>
            </View>
          )
        }
      />

      <IconPicker
        visible={pickerOpen}
        value={icon}
        onSelect={(selected) => {
          setIcon(selected);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}
