import { ColorPicker } from '@/components/journal/color-picker';
import { IconPicker } from '@/components/journal/icon-picker';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import {
  useCreateTodoList,
  useDeleteTodoList,
  useTodoLists,
  useUpdateTodoList,
} from '@/hooks/use-todos';
import { DEFAULT_LABEL_COLOR } from '@/lib/journal-colors';
import { getLabelIcon } from '@/lib/journal-icons';
import { todoListFormSchema } from '@/lib/schemas/todo';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2Icon } from 'lucide-react-native';
import * as React from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

const DEFAULT_LIST_ICON = 'List';

/** Creates a list, or edits one when an `id` param is passed. */
export default function TodoListScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const listsQuery = useTodoLists();
  const createList = useCreateTodoList();
  const updateList = useUpdateTodoList();
  const deleteList = useDeleteTodoList();

  const list = id ? listsQuery.data?.find((item) => item.id === id) : undefined;

  const [name, setName] = React.useState('');
  const [icon, setIcon] = React.useState(DEFAULT_LIST_ICON);
  const [color, setColor] = React.useState(DEFAULT_LABEL_COLOR);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  // Fill the form once when editing, as soon as the list is available.
  const hydrated = React.useRef(false);
  React.useEffect(() => {
    if (!list || hydrated.current) return;

    hydrated.current = true;
    setName(list.name);
    setIcon(list.icon);
    setColor(list.color);
  }, [list]);

  const parsed = todoListFormSchema.safeParse({ name, icon, color });
  const isSaving = createList.isPending || updateList.isPending;
  const isError = createList.isError || updateList.isError;

  function handleSave() {
    if (!parsed.success || isSaving) return;

    const onSuccess = () => router.back();

    if (list) {
      updateList.mutate({ id: list.id, values: parsed.data }, { onSuccess });
    } else {
      createList.mutate(parsed.data, { onSuccess });
    }
  }

  function confirmDelete() {
    if (!list) return;

    Alert.alert('Eliminar lista', `"${list.name}" se eliminará; sus tareas se conservan sin lista.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => deleteList.mutate(list.id, { onSuccess: () => router.back() }),
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{
          title: list ? 'Editar lista' : 'Nueva lista',
          headerRight: () =>
            list ? (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                accessibilityLabel="Eliminar lista"
                onPress={confirmDelete}>
                <Icon as={Trash2Icon} className="text-destructive size-5" />
              </Button>
            ) : null,
        }}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 20 }}
        keyboardShouldPersistTaps="handled">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => setPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Elegir icono"
            className="border-input bg-card size-10 items-center justify-center rounded-md border active:opacity-70">
            <Icon as={getLabelIcon(icon)} className="size-5" color={color} />
          </Pressable>

          <View className="flex-1">
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Nombre de la lista"
              maxLength={30}
              autoFocus={!list}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>
        </View>

        <ColorPicker value={color} onChange={setColor} />

        {isError ? (
          <Text className="text-destructive text-xs">
            No se pudo guardar la lista. Inténtalo de nuevo.
          </Text>
        ) : null}

        <Button size="lg" disabled={!parsed.success || isSaving} onPress={handleSave}>
          <Text>{isSaving ? 'Guardando…' : 'Guardar'}</Text>
        </Button>
      </ScrollView>

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
