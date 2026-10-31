import { Icon } from '@/components/ui/icon';
import { RipplePressable } from '@/components/ui/ripple-pressable';
import { Text } from '@/components/ui/text';
import { formatDayShort, todayKey } from '@/lib/date';
import { getLabelIcon } from '@/lib/journal-icons';
import type { TodoList, TodoTask } from '@/lib/schemas/todo';
import { cn } from '@/lib/utils';
import { BellIcon, CheckIcon, PaperclipIcon, StarIcon } from 'lucide-react-native';
import { View } from 'react-native';

type TaskRowProps = {
  task: TodoTask;
  /** Shown as a chip-less hint under the title; omitted when the view is already that list. */
  list?: TodoList;
  onPress: () => void;
  onToggleCompleted: () => void;
  onToggleFavorite: () => void;
};

export function TaskRow({ task, list, onPress, onToggleCompleted, onToggleFavorite }: TaskRowProps) {
  const accent = list?.color ?? '#64748b';
  const isOverdue = !task.completed && task.dueDate !== null && task.dueDate < todayKey();
  const hasMeta = list || task.dueDate || task.reminderAt || task.fileUri;

  return (
    <RipplePressable
      onPress={onPress}
      accessibilityRole="button"
      className="bg-card border-border flex-row items-center rounded-xl border pl-1">
      <RipplePressable
        onPress={onToggleCompleted}
        hitSlop={4}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        accessibilityLabel={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
        className="size-11 items-center justify-center rounded-full">
        <View
          className="size-6 items-center justify-center rounded-full border-2"
          style={{ borderColor: accent, backgroundColor: task.completed ? accent : undefined }}>
          {task.completed ? <Icon as={CheckIcon} className="size-4" color="#ffffff" /> : null}
        </View>
      </RipplePressable>

      <View className="flex-1 gap-0.5 py-3">
        <Text
          className={cn('text-base', task.completed && 'text-muted-foreground line-through')}
          numberOfLines={2}>
          {task.title}
        </Text>

        {hasMeta ? (
          <View className="flex-row flex-wrap items-center gap-x-3 gap-y-0.5">
            {list ? (
              <View className="flex-row items-center gap-1">
                <Icon as={getLabelIcon(list.icon)} className="size-3.5" color={list.color} />
                <Text className="text-muted-foreground text-xs">{list.name}</Text>
              </View>
            ) : null}
            {task.dueDate ? (
              <Text className={cn('text-xs', isOverdue ? 'text-destructive' : 'text-muted-foreground')}>
                {formatDayShort(task.dueDate)}
              </Text>
            ) : null}
            {task.reminderAt ? (
              <Icon as={BellIcon} className="text-muted-foreground size-3.5" />
            ) : null}
            {task.fileUri ? (
              <Icon as={PaperclipIcon} className="text-muted-foreground size-3.5" />
            ) : null}
          </View>
        ) : null}
      </View>

      <RipplePressable
        onPress={onToggleFavorite}
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel={task.favorite ? 'Quitar de favoritas' : 'Marcar como favorita'}
        className="size-11 items-center justify-center rounded-full">
        <Icon
          as={StarIcon}
          className={cn('size-5', task.favorite ? 'text-amber-500' : 'text-muted-foreground')}
          fill={task.favorite ? '#f59e0b' : 'none'}
        />
      </RipplePressable>
    </RipplePressable>
  );
}
