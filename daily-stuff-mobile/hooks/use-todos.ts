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
} from '@/lib/api/todos';
import { queryKeys } from '@/lib/query-keys';
import type { TodoListFormValues, TodoTask, TodoTaskFormValues } from '@/lib/schemas/todo';
import {
  cancelTaskReminder,
  scheduleTaskReminder,
  setNotificationId,
} from '@/lib/todo-notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useTodoLists() {
  return useQuery({
    queryKey: queryKeys.todoLists,
    queryFn: listTodoLists,
  });
}

/** All tasks at once: a personal to-do list is small, and every view filters it in memory. */
export function useTodoTasks() {
  return useQuery({
    queryKey: queryKeys.todoTasks,
    queryFn: listTodoTasks,
  });
}

/** Every todo mutation can change lists and tasks, so invalidate the whole `todos` tree. */
function useInvalidateTodos() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: queryKeys.todos });
}

/** (Re)schedules this device's notification for a task and remembers its id. */
async function rescheduleReminder(taskId: string, title: string, reminderAt: string | null) {
  await setNotificationId(taskId, await scheduleTaskReminder(title, reminderAt));
}

export function useCreateTodoList() {
  const invalidate = useInvalidateTodos();

  return useMutation({
    mutationFn: (values: TodoListFormValues) => createTodoList(values),
    onSuccess: invalidate,
  });
}

export function useUpdateTodoList() {
  const invalidate = useInvalidateTodos();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: TodoListFormValues }) =>
      updateTodoList(id, values),
    onSuccess: invalidate,
  });
}

export function useDeleteTodoList() {
  const invalidate = useInvalidateTodos();

  return useMutation({
    mutationFn: (id: string) => deleteTodoList(id),
    onSuccess: invalidate,
  });
}

export function useCreateTodoTask() {
  const invalidate = useInvalidateTodos();

  return useMutation({
    mutationFn: async (values: TodoTaskFormValues) => {
      const created = await createTodoTask(values);

      await rescheduleReminder(created.id, created.title, created.reminderAt);

      return created;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateTodoTask() {
  const invalidate = useInvalidateTodos();

  return useMutation({
    mutationFn: async ({ task, values }: { task: TodoTask; values: TodoTaskFormValues }) => {
      await updateTodoTask(task, values);
      await cancelTaskReminder(task.notificationId);

      // A completed task keeps its reminder off until it is reopened.
      await rescheduleReminder(task.id, values.title, task.completed ? null : values.reminderAt);
    },
    onSuccess: invalidate,
  });
}

export function useToggleTodoCompleted() {
  const invalidate = useInvalidateTodos();

  return useMutation({
    mutationFn: async (task: TodoTask) => {
      const completed = !task.completed;

      await setTodoTaskCompleted(task.id, completed);
      await cancelTaskReminder(task.notificationId);
      await rescheduleReminder(task.id, task.title, completed ? null : task.reminderAt);
    },
    onSuccess: invalidate,
  });
}

export function useToggleTodoFavorite() {
  const invalidate = useInvalidateTodos();

  return useMutation({
    mutationFn: (task: TodoTask) => setTodoTaskFavorite(task.id, !task.favorite),
    onSuccess: invalidate,
  });
}

export function useDeleteTodoTask() {
  const invalidate = useInvalidateTodos();

  return useMutation({
    mutationFn: async (task: TodoTask) => {
      await deleteTodoTask(task.id);
      await cancelTaskReminder(task.notificationId);
      await setNotificationId(task.id, null);
    },
    onSuccess: invalidate,
  });
}
