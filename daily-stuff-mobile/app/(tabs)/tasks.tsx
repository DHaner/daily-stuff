import { LabelChip } from '@/components/journal/label-chip';
import { GoToTodayButton } from '@/components/go-to-today-button';
import { MonthNav } from '@/components/month-nav';
import { TaskRow } from '@/components/todos/task-row';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { RipplePressable } from '@/components/ui/ripple-pressable';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { ProfileButton } from '@/components/profile-button';
import { useMonthScroll } from '@/hooks/use-month-scroll';
import {
  useCreateTodoTask,
  useTodoLists,
  useTodoTasks,
  useToggleTodoCompleted,
  useToggleTodoFavorite,
} from '@/hooks/use-todos';
import { formatDayLabel, toDayKey, type DayKey } from '@/lib/date';
import { groupByDay, type DayRow } from '@/lib/day-groups';
import type { TodoTask } from '@/lib/schemas/todo';
import { cn } from '@/lib/utils';
import { FlashList } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import { ListChecksIcon, PencilIcon, PlusIcon, StarIcon } from 'lucide-react-native';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

/** `todas` and `importantes` are built in; anything else is a list id. */
type TaskView = 'todas' | 'importantes' | (string & {});

const BUILTIN_VIEWS = [
  { id: 'todas', label: 'Todas', icon: ListChecksIcon },
  { id: 'importantes', label: 'Importantes', icon: StarIcon },
] as const;

/** A task sits on its due day, or on the day it was created when it has none. */
function taskDay(task: TodoTask): DayKey {
  return task.dueDate ?? toDayKey(new Date(task.createdAt));
}

export default function TasksScreen() {
  const router = useRouter();
  const tasksQuery = useTodoTasks();
  const listsQuery = useTodoLists();
  const createTask = useCreateTodoTask();
  const toggleCompleted = useToggleTodoCompleted();
  const toggleFavorite = useToggleTodoFavorite();

  const [view, setView] = React.useState<TaskView>('todas');
  const [title, setTitle] = React.useState('');

  const lists = listsQuery.data ?? [];
  const activeList = lists.find((list) => list.id === view);
  // A deleted list leaves `view` dangling; fall back to showing everything.
  const effectiveView: TaskView =
    BUILTIN_VIEWS.some((item) => item.id === view) || activeList ? view : 'todas';

  const listsById = React.useMemo(() => new Map(lists.map((list) => [list.id, list])), [lists]);

  const rows = React.useMemo(() => {
    const visible = (tasksQuery.data ?? [])
      .filter((task) => {
        if (effectiveView === 'importantes') return task.favorite;
        if (effectiveView === 'todas') return true;
        return task.listId === effectiveView;
      })
      .sort((a, b) => {
        const dayA = taskDay(a);
        const dayB = taskDay(b);

        if (dayA !== dayB) return dayA < dayB ? 1 : -1;
        return a.createdAt < b.createdAt ? 1 : -1;
      });

    return groupByDay(visible, taskDay);
  }, [tasksQuery.data, effectiveView]);

  const {
    listRef,
    month,
    months,
    goToMonth,
    showTop,
    onScroll,
    scrollToTop,
    onViewableItemsChanged,
    viewabilityConfig,
  } =
    useMonthScroll(rows);

  function handleAdd() {
    const trimmed = title.trim();

    if (!trimmed || createTask.isPending) return;

    createTask.mutate(
      {
        title: trimmed,
        description: '',
        listId: activeList?.id ?? null,
        dueDate: null,
        reminderAt: null,
        fileUri: null,
        fileName: null,
        favorite: effectiveView === 'importantes',
      },
      { onSuccess: () => setTitle('') }
    );
  }

  const openTask = React.useCallback(
    (id: string) => router.push({ pathname: '/task/[id]', params: { id } }),
    [router]
  );

  const renderItem = React.useCallback(
    ({ item }: { item: DayRow<TodoTask> }) => {
      if (item.type === 'header') {
        return (
          <Text className="text-muted-foreground mt-2 text-sm font-semibold capitalize">
            {formatDayLabel(item.date)}
          </Text>
        );
      }

      const task = item.item;

      return (
        <TaskRow
          task={task}
          list={activeList || !task.listId ? undefined : listsById.get(task.listId)}
          onPress={() => openTask(task.id)}
          onToggleCompleted={() => toggleCompleted.mutate(task)}
          onToggleFavorite={() => toggleFavorite.mutate(task)}
        />
      );
    },
    [activeList, listsById, openTask, toggleCompleted, toggleFavorite]
  );

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <Stack.Screen
        options={{
          headerTitleAlign: 'center',
          headerTitle: () => <MonthNav months={months} value={month} onChange={goToMonth} />,
          headerLeft: () => <ProfileButton />,
        }}
      />

      <View className="py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="items-center gap-2 px-4">
          {BUILTIN_VIEWS.map((item) => {
            const isActive = effectiveView === item.id;

            return (
              <RipplePressable
                key={item.id}
                onPress={() => setView(item.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                className={cn(
                  'flex-row items-center gap-1.5 rounded-full border px-3 py-1.5',
                  isActive ? 'bg-primary border-transparent' : 'border-border bg-card'
                )}>
                <Icon
                  as={item.icon}
                  className={cn(
                    'size-4',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}
                />
                <Text
                  className={cn(
                    'text-sm',
                    isActive ? 'text-primary-foreground font-semibold' : 'text-muted-foreground'
                  )}>
                  {item.label}
                </Text>
              </RipplePressable>
            );
          })}

          {lists.map((list) => (
            <LabelChip
              key={list.id}
              label={list}
              selected={effectiveView === list.id}
              onPress={() => setView(list.id)}
            />
          ))}

          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            accessibilityLabel="Crear lista"
            onPress={() => router.push('/task/list')}>
            <Icon as={PlusIcon} className="size-4" />
            <Text variant="small">Lista</Text>
          </Button>
        </ScrollView>
      </View>

      <FlashList
        ref={listRef}
        data={rows}
        keyExtractor={(row) => (row.type === 'header' ? `header-${row.date}` : row.item.id)}
        getItemType={(row) => row.type}
        renderItem={renderItem}
        extraData={[listsById, activeList]}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        ItemSeparatorComponent={() => <View className="h-2" />}
        ListHeaderComponent={
          activeList ? (
            <View className="mb-1 flex-row items-center gap-2">
              <Text className="flex-1 text-lg font-semibold" numberOfLines={1}>
                {activeList.name}
              </Text>
              <Button
                variant="outline"
                size="sm"
                onPress={() =>
                  router.push({ pathname: '/task/list', params: { id: activeList.id } })
                }>
                <Icon as={PencilIcon} className="size-4" />
                <Text variant="small">Editar lista</Text>
              </Button>
            </View>
          ) : null
        }
        ListEmptyComponent={
          tasksQuery.isPending ? null : (
            <View className="items-center gap-3 px-6 py-12">
              <Icon as={ListChecksIcon} className="text-muted-foreground size-10" />
              <Text className="text-muted-foreground text-center">
                {effectiveView === 'importantes'
                  ? 'Marca una tarea con la estrella para verla aquí.'
                  : 'No hay tareas. Escribe una abajo para empezar.'}
              </Text>
            </View>
          )
        }
      />

      <GoToTodayButton visible={showTop} onPress={scrollToTop} bottom={84} />

      <View
        className="border-border bg-background flex-row items-center gap-2 border-t px-4 pt-3"
        style={{ paddingBottom: 12 }}>
        <View className="flex-1">
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="Agregar una tarea"
            returnKeyType="done"
            blurOnSubmit={false}
            onSubmitEditing={handleAdd}
          />
        </View>
        <Button
          size="icon"
          accessibilityLabel="Agregar tarea"
          disabled={title.trim().length === 0 || createTask.isPending}
          onPress={handleAdd}>
          <Icon as={PlusIcon} className="size-5" />
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
