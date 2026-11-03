import { API_URL, api, apiOrNull, guessMimeType, isRemoteUri, uploadFile } from '@/lib/api/client';
import { getNotificationIds } from '@/lib/todo-notifications';
import {
  todoListSchema,
  todoTaskSchema,
  type TodoList,
  type TodoListFormValues,
  type TodoTask,
  type TodoTaskFormValues,
} from '@/lib/schemas/todo';

type ApiList = { id: string; name: string; icon: string; color: string; createdAt: string };

type ApiTask = {
  id: string;
  title: string;
  description: string;
  listId: string | null;
  dueDate: string | null;
  reminderAt: string | null;
  fileName: string | null;
  hasFile: boolean;
  completed: boolean;
  favorite: boolean;
  createdAt: string;
};

export const taskFileUrl = (id: string) => `${API_URL}/api/todo-tasks/${id}/file`;

/** `notificationId` is device-local (it identifies a notification scheduled on this phone). */
function toTask(task: ApiTask, notificationIds: Record<string, string>): TodoTask {
  return todoTaskSchema.parse({
    id: task.id,
    title: task.title,
    description: task.description,
    listId: task.listId,
    dueDate: task.dueDate,
    reminderAt: task.reminderAt,
    notificationId: notificationIds[task.id] ?? null,
    fileUri: task.hasFile ? taskFileUrl(task.id) : null,
    fileName: task.fileName,
    completed: task.completed,
    favorite: task.favorite,
    createdAt: task.createdAt,
  });
}

const toList = (list: ApiList): TodoList => todoListSchema.parse(list);

// ── Lists ──────────────────────────────────────────────────────────────────

export async function listTodoLists(): Promise<TodoList[]> {
  return (await api<ApiList[]>('/todo-lists')).map(toList);
}

export async function createTodoList(values: TodoListFormValues): Promise<TodoList> {
  return toList(await api<ApiList>('/todo-lists', { method: 'POST', body: values }));
}

export async function updateTodoList(id: string, values: TodoListFormValues): Promise<void> {
  await api(`/todo-lists/${id}`, { method: 'PUT', body: values });
}

/** Tasks of a deleted list are kept; the server just detaches them. */
export async function deleteTodoList(id: string): Promise<void> {
  await api(`/todo-lists/${id}`, { method: 'DELETE' });
}

// ── Tasks ──────────────────────────────────────────────────────────────────

export async function listTodoTasks(): Promise<TodoTask[]> {
  const [tasks, notificationIds] = await Promise.all([
    api<ApiTask[]>('/todo-tasks'),
    getNotificationIds(),
  ]);

  return tasks.map((task) => toTask(task, notificationIds));
}

export async function getTodoTask(id: string): Promise<TodoTask | null> {
  const [task, notificationIds] = await Promise.all([
    apiOrNull<ApiTask>(`/todo-tasks/${id}`),
    getNotificationIds(),
  ]);

  return task ? toTask(task, notificationIds) : null;
}

function toBody(values: TodoTaskFormValues) {
  return {
    title: values.title,
    description: values.description,
    listId: values.listId,
    dueDate: values.dueDate,
    reminderAt: values.reminderAt,
    favorite: values.favorite,
  };
}

/**
 * The attachment travels separately from the task: a picked local file is uploaded, `null` removes
 * the stored one, and the API's own URL means "unchanged".
 */
async function syncFile(task: ApiTask, fileUri: string | null, fileName: string | null) {
  if (fileUri === null && task.hasFile) {
    await api(`/todo-tasks/${task.id}/file`, { method: 'DELETE' });
  } else if (fileUri !== null && !isRemoteUri(fileUri)) {
    const name = fileName ?? 'archivo';

    await uploadFile(`/todo-tasks/${task.id}/file`, {
      uri: fileUri,
      name,
      type: guessMimeType(name),
    });
  }
}

export async function createTodoTask(values: TodoTaskFormValues): Promise<TodoTask> {
  const created = await api<ApiTask>('/todo-tasks', { method: 'POST', body: toBody(values) });

  await syncFile(created, values.fileUri, values.fileName);

  return (await getTodoTask(created.id)) ?? toTask(created, {});
}

export async function updateTodoTask(task: TodoTask, values: TodoTaskFormValues): Promise<void> {
  const updated = await api<ApiTask>(`/todo-tasks/${task.id}`, {
    method: 'PUT',
    body: toBody(values),
  });

  await syncFile(updated, values.fileUri, values.fileName);
}

export async function setTodoTaskCompleted(id: string, completed: boolean): Promise<void> {
  await api(`/todo-tasks/${id}/completed`, { method: 'PUT', body: completed });
}

export async function setTodoTaskFavorite(id: string, favorite: boolean): Promise<void> {
  await api(`/todo-tasks/${id}/favorite`, { method: 'PUT', body: favorite });
}

export async function deleteTodoTask(id: string): Promise<void> {
  await api(`/todo-tasks/${id}`, { method: 'DELETE' });
}
