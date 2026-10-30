import {
  todoListSchema,
  todoTaskSchema,
  type TodoList,
  type TodoListFormValues,
  type TodoTask,
  type TodoTaskFormValues,
} from '@/lib/schemas/todo';
import type { SQLiteDatabase } from 'expo-sqlite';

type ListRow = {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
};

type TaskRow = {
  id: string;
  title: string;
  description: string;
  list_id: string | null;
  due_date: string | null;
  reminder_at: string | null;
  notification_id: string | null;
  file_uri: string | null;
  file_name: string | null;
  completed: number;
  favorite: number;
  created_at: string;
};

/** Form values plus the id of the scheduled notification, which only the hooks layer knows. */
export type TodoTaskWrite = TodoTaskFormValues & { notificationId: string | null };

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function toList(row: ListRow): TodoList {
  return todoListSchema.parse({
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    createdAt: row.created_at,
  });
}

function toTask(row: TaskRow): TodoTask {
  return todoTaskSchema.parse({
    id: row.id,
    title: row.title,
    description: row.description,
    listId: row.list_id,
    dueDate: row.due_date,
    reminderAt: row.reminder_at,
    notificationId: row.notification_id,
    fileUri: row.file_uri,
    fileName: row.file_name,
    completed: row.completed === 1,
    favorite: row.favorite === 1,
    createdAt: row.created_at,
  });
}

export async function listTodoLists(db: SQLiteDatabase): Promise<TodoList[]> {
  const rows = await db.getAllAsync<ListRow>('SELECT * FROM todo_lists ORDER BY created_at ASC');

  return rows.map(toList);
}

export async function createTodoList(
  db: SQLiteDatabase,
  values: TodoListFormValues
): Promise<TodoList> {
  const row: ListRow = {
    id: createId(),
    name: values.name,
    icon: values.icon,
    color: values.color,
    created_at: new Date().toISOString(),
  };

  await db.runAsync(
    'INSERT INTO todo_lists (id, name, icon, color, created_at) VALUES (?, ?, ?, ?, ?)',
    row.id,
    row.name,
    row.icon,
    row.color,
    row.created_at
  );

  return toList(row);
}

export async function updateTodoList(
  db: SQLiteDatabase,
  id: string,
  values: TodoListFormValues
): Promise<void> {
  await db.runAsync(
    'UPDATE todo_lists SET name = ?, icon = ?, color = ? WHERE id = ?',
    values.name,
    values.icon,
    values.color,
    id
  );
}

/** Tasks of a deleted list are kept; they just stop belonging to a list. */
export async function deleteTodoList(db: SQLiteDatabase, id: string): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE todo_tasks SET list_id = NULL WHERE list_id = ?', id);
    await db.runAsync('DELETE FROM todo_lists WHERE id = ?', id);
  });
}

export async function listTodoTasks(db: SQLiteDatabase): Promise<TodoTask[]> {
  const rows = await db.getAllAsync<TaskRow>(
    `SELECT * FROM todo_tasks
     ORDER BY due_date IS NULL ASC, due_date ASC, created_at ASC`
  );

  return rows.map(toTask);
}

export async function getTodoTask(db: SQLiteDatabase, id: string): Promise<TodoTask | null> {
  const row = await db.getFirstAsync<TaskRow>('SELECT * FROM todo_tasks WHERE id = ?', id);

  return row ? toTask(row) : null;
}

export async function createTodoTask(db: SQLiteDatabase, values: TodoTaskWrite): Promise<TodoTask> {
  const id = createId();

  await db.runAsync(
    `INSERT INTO todo_tasks
       (id, title, description, list_id, due_date, reminder_at, notification_id,
        file_uri, file_name, completed, favorite, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    id,
    values.title,
    values.description,
    values.listId,
    values.dueDate,
    values.reminderAt,
    values.notificationId,
    values.fileUri,
    values.fileName,
    values.favorite ? 1 : 0,
    new Date().toISOString()
  );

  const created = await getTodoTask(db, id);

  if (!created) {
    throw new Error('No se pudo crear la tarea');
  }

  return created;
}

export async function updateTodoTask(
  db: SQLiteDatabase,
  id: string,
  values: TodoTaskWrite
): Promise<void> {
  await db.runAsync(
    `UPDATE todo_tasks SET title = ?, description = ?, list_id = ?, due_date = ?, reminder_at = ?,
       notification_id = ?, file_uri = ?, file_name = ?, favorite = ? WHERE id = ?`,
    values.title,
    values.description,
    values.listId,
    values.dueDate,
    values.reminderAt,
    values.notificationId,
    values.fileUri,
    values.fileName,
    values.favorite ? 1 : 0,
    id
  );
}

export async function setTodoTaskCompleted(
  db: SQLiteDatabase,
  id: string,
  completed: boolean,
  notificationId: string | null
): Promise<void> {
  await db.runAsync(
    'UPDATE todo_tasks SET completed = ?, notification_id = ? WHERE id = ?',
    completed ? 1 : 0,
    notificationId,
    id
  );
}

export async function setTodoTaskFavorite(
  db: SQLiteDatabase,
  id: string,
  favorite: boolean
): Promise<void> {
  await db.runAsync('UPDATE todo_tasks SET favorite = ? WHERE id = ?', favorite ? 1 : 0, id);
}

export async function deleteTodoTask(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM todo_tasks WHERE id = ?', id);
}
