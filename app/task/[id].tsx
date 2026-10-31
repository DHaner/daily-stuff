import { DatePicker } from '@/components/expenses/date-picker';
import { LabelChip } from '@/components/journal/label-chip';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { RipplePressable } from '@/components/ui/ripple-pressable';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import {
  useDeleteTodoTask,
  useTodoLists,
  useTodoTasks,
  useToggleTodoFavorite,
  useUpdateTodoTask,
} from '@/hooks/use-todos';
import { todayKey, type DayKey } from '@/lib/date';
import { todoTaskFormSchema } from '@/lib/schemas/todo';
import { cn } from '@/lib/utils';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  BellIcon,
  CalendarIcon,
  PaperclipIcon,
  StarIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

const REMINDER_TIMES = ['08:00', '09:00', '12:00', '18:00', '20:00'];
const DEFAULT_REMINDER_TIME = '09:00';

/** A reminder is stored as `yyyy-MM-dd'T'HH:mm`; the screen edits its day and time apart. */
function splitReminder(reminderAt: string | null) {
  return reminderAt
    ? { day: reminderAt.slice(0, 10), time: reminderAt.slice(11, 16) }
    : null;
}

export default function TaskScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tasksQuery = useTodoTasks();
  const listsQuery = useTodoLists();
  const updateTask = useUpdateTodoTask();
  const deleteTask = useDeleteTodoTask();
  const toggleFavorite = useToggleTodoFavorite();

  const task = tasksQuery.data?.find((item) => item.id === id);
  const lists = listsQuery.data ?? [];

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [listId, setListId] = React.useState<string | null>(null);
  const [dueDate, setDueDate] = React.useState<DayKey | null>(null);
  const [reminder, setReminder] = React.useState<{ day: DayKey; time: string } | null>(null);
  const [file, setFile] = React.useState<{ uri: string; name: string } | null>(null);

  // Fill the form once, when the task first becomes available.
  const hydrated = React.useRef(false);
  React.useEffect(() => {
    if (!task || hydrated.current) return;

    hydrated.current = true;
    setTitle(task.title);
    setDescription(task.description);
    setListId(task.listId);
    setDueDate(task.dueDate);
    setReminder(splitReminder(task.reminderAt));
    setFile(task.fileUri && task.fileName ? { uri: task.fileUri, name: task.fileName } : null);
  }, [task]);

  async function pickFile() {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });

    if (!result.canceled) {
      setFile({ uri: result.assets[0].uri, name: result.assets[0].name });
    }
  }

  async function openFile() {
    if (file && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(file.uri, { dialogTitle: file.name });
    }
  }

  function handleSave() {
    if (!task) return;

    const parsed = todoTaskFormSchema.safeParse({
      title,
      description,
      listId,
      dueDate,
      reminderAt: reminder ? `${reminder.day}T${reminder.time}` : null,
      fileUri: file?.uri ?? null,
      fileName: file?.name ?? null,
      favorite: task.favorite,
    });

    if (!parsed.success) return;

    updateTask.mutate({ task, values: parsed.data }, { onSuccess: () => router.back() });
  }

  function confirmDelete() {
    if (!task) return;

    Alert.alert('Eliminar tarea', `"${task.title}" se eliminará definitivamente.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => deleteTask.mutate(task, { onSuccess: () => router.back() }),
      },
    ]);
  }

  if (!task) {
    return <View className="bg-background flex-1" />;
  }

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View className="flex-row items-center">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                accessibilityLabel={task.favorite ? 'Quitar de favoritas' : 'Marcar como favorita'}
                onPress={() => toggleFavorite.mutate(task)}>
                <Icon
                  as={StarIcon}
                  className={cn('size-5', task.favorite && 'text-amber-500')}
                  fill={task.favorite ? '#f59e0b' : 'none'}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                accessibilityLabel="Eliminar tarea"
                onPress={confirmDelete}>
                <Icon as={Trash2Icon} className="text-destructive size-5" />
              </Button>
            </View>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 20 }}
        keyboardShouldPersistTaps="handled">
        <Input value={title} onChangeText={setTitle} placeholder="Nombre de la tarea" />

        <Textarea
          value={description}
          onChangeText={setDescription}
          placeholder="Descripción (opcional)"
          numberOfLines={4}
        />

        {lists.length > 0 ? (
          <View className="gap-2">
            <Text className="text-sm font-semibold">Lista</Text>
            <View className="flex-row flex-wrap gap-2">
              <RipplePressable
                onPress={() => setListId(null)}
                accessibilityRole="button"
                accessibilityState={{ selected: listId === null }}
                className={cn(
                  'rounded-full border px-3 py-1.5',
                  listId === null ? 'bg-primary border-transparent' : 'border-border bg-card'
                )}>
                <Text
                  className={cn(
                    'text-sm',
                    listId === null ? 'text-primary-foreground font-semibold' : 'text-muted-foreground'
                  )}>
                  Sin lista
                </Text>
              </RipplePressable>
              {lists.map((list) => (
                <LabelChip
                  key={list.id}
                  label={list}
                  selected={listId === list.id}
                  onPress={() => setListId(list.id)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View className="gap-2">
          <Text className="text-sm font-semibold">Fecha de vencimiento</Text>
          {dueDate ? (
            <View className="flex-row items-center gap-2">
              <View className="flex-1">
                <DatePicker value={dueDate} onChange={setDueDate} />
              </View>
              <Button
                size="icon"
                variant="outline"
                accessibilityLabel="Quitar fecha de vencimiento"
                onPress={() => setDueDate(null)}>
                <Icon as={XIcon} className="size-5" />
              </Button>
            </View>
          ) : (
            <Button variant="outline" size="lg" onPress={() => setDueDate(todayKey())}>
              <Icon as={CalendarIcon} className="size-5" />
              <Text>Agregar fecha</Text>
            </Button>
          )}
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold">Recordatorio</Text>
          {reminder ? (
            <View className="gap-3">
              <View className="flex-row items-center gap-2">
                <View className="flex-1">
                  <DatePicker
                    value={reminder.day}
                    onChange={(day) => setReminder({ ...reminder, day })}
                  />
                </View>
                <Button
                  size="icon"
                  variant="outline"
                  accessibilityLabel="Quitar recordatorio"
                  onPress={() => setReminder(null)}>
                  <Icon as={XIcon} className="size-5" />
                </Button>
              </View>

              <View className="flex-row flex-wrap gap-2">
                {REMINDER_TIMES.map((time) => {
                  const isActive = reminder.time === time;

                  return (
                    <RipplePressable
                      key={time}
                      onPress={() => setReminder({ ...reminder, time })}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                      className={cn(
                        'rounded-full border px-3 py-1.5',
                        isActive ? 'bg-primary border-transparent' : 'border-border bg-card'
                      )}>
                      <Text
                        className={cn(
                          'text-sm',
                          isActive ? 'text-primary-foreground font-semibold' : 'text-muted-foreground'
                        )}>
                        {time}
                      </Text>
                    </RipplePressable>
                  );
                })}
              </View>
            </View>
          ) : (
            <Button
              variant="outline"
              size="lg"
              onPress={() =>
                setReminder({ day: dueDate ?? todayKey(), time: DEFAULT_REMINDER_TIME })
              }>
              <Icon as={BellIcon} className="size-5" />
              <Text>Recordarme</Text>
            </Button>
          )}
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold">Archivo</Text>
          {file ? (
            <View className="flex-row items-center gap-2">
              <RipplePressable
                onPress={openFile}
                accessibilityRole="button"
                accessibilityLabel={`Abrir ${file.name}`}
                className="border-border bg-card flex-1 flex-row items-center gap-2 rounded-md border px-3 py-2.5">
                <Icon as={PaperclipIcon} className="text-muted-foreground size-5" />
                <Text className="flex-1" numberOfLines={1}>
                  {file.name}
                </Text>
              </RipplePressable>
              <Button
                size="icon"
                variant="outline"
                accessibilityLabel="Quitar archivo"
                onPress={() => setFile(null)}>
                <Icon as={XIcon} className="size-5" />
              </Button>
            </View>
          ) : (
            <Button variant="outline" size="lg" onPress={pickFile}>
              <Icon as={PaperclipIcon} className="size-5" />
              <Text>Adjuntar archivo</Text>
            </Button>
          )}
        </View>

        {updateTask.isError ? (
          <Text className="text-destructive text-xs">
            No se pudo guardar la tarea. Inténtalo de nuevo.
          </Text>
        ) : null}

        <Button
          size="lg"
          disabled={title.trim().length === 0 || updateTask.isPending}
          onPress={handleSave}>
          <Text>{updateTask.isPending ? 'Guardando…' : 'Guardar'}</Text>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
