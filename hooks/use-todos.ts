import {
  createTodoList,
  createTodoTask,
  deleteTodoList,
  deleteTodoTask,
  listTodoLists,
  listTodoTasks,
  setTodoTaskCompleted,
  setTodoTaskFavorite,
  updateTodoList,
  updateTodoTask,
} from '@/lib/db/todos';
import { queryKeys } from '@/lib/query-keys';
import type { TodoListFormValues, TodoTask, TodoTaskFormValues } from '@/lib/schemas/todo';
import { deleteTaskFile, persistTaskFile } from '@/lib/todo-files';
import { cancelTaskReminder, scheduleTaskReminder } from '@/lib/todo-notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

export function useTodoLists() {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: queryKeys.todoLists,
    queryFn: () => listTodoLists(db),
  });
}

/** All tasks at once: a personal to-do list is small, and every view filters it in memory. */
export function useTodoTasks() {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: queryKeys.todoTasks,
    queryFn: () => listTodoTasks(db),
  });
}

/** Every todo mutation can change lists and tasks, so invalidate the whole `todos` tree. */
function useInvalidateTodos() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: queryKeys.todos });
}

export function useCreateTodoList() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateTodos();

  return useMutation({
    mutationFn: (values: TodoListFormValues) => createTodoList(db, values),
    onSuccess: invalidate,
  });
}

export function useUpdateTodoList() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateTodos();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: TodoListFormValues }) =>
      updateTodoList(db, id, values),
    onSuccess: invalidate,
  });
}

export function useDeleteTodoList() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateTodos();

  return useMutation({
    mutationFn: (id: string) => deleteTodoList(db, id),
    onSuccess: invalidate,
  });
}

export function useCreateTodoTask() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateTodos();

  return useMutation({
    mutationFn: async (values: TodoTaskFormValues) => {
      const notificationId = await scheduleTaskReminder(values.title, values.reminderAt);

      return createTodoTask(db, { ...values, notificationId });
    },
    onSuccess: invalidate,
  });
}

export function useUpdateTodoTask() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateTodos();

  return useMutation({
    mutationFn: async ({ task, values }: { task: TodoTask; values: TodoTaskFormValues }) => {
      await cancelTaskReminder(task.notificationId);

      // A completed task keeps its reminder off until it is reopened.
      const notificationId = task.completed
        ? null
        : await scheduleTaskReminder(values.title, values.reminderAt);
      const fileUri =
        values.fileUri && values.fileName ? persistTaskFile(values.fileUri, values.fileName) : null;

      await updateTodoTask(db, task.id, { ...values, fileUri, notificationId });

      if (task.fileUri && task.fileUri !== fileUri) {
        deleteTaskFile(task.fileUri);
      }
    },
    onSuccess: invalidate,
  });
}

export function useToggleTodoCompleted() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateTodos();

  return useMutation({
    mutationFn: async (task: TodoTask) => {
      const completed = !task.completed;

      await cancelTaskReminder(task.notificationId);

      const notificationId = completed
        ? null
        : await scheduleTaskReminder(task.title, task.reminderAt);

      await setTodoTaskCompleted(db, task.id, completed, notificationId);
    },
    onSuccess: invalidate,
  });
}

export function useToggleTodoFavorite() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateTodos();

  return useMutation({
    mutationFn: (task: TodoTask) => setTodoTaskFavorite(db, task.id, !task.favorite),
    onSuccess: invalidate,
  });
}

export function useDeleteTodoTask() {
  const db = useSQLiteContext();
  const invalidate = useInvalidateTodos();

  return useMutation({
    mutationFn: async (task: TodoTask) => {
      await cancelTaskReminder(task.notificationId);
      await deleteTodoTask(db, task.id);
      deleteTaskFile(task.fileUri);
    },
    onSuccess: invalidate,
  });
}
