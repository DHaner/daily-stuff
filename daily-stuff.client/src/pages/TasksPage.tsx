import Delete from '@mui/icons-material/DeleteOutlined';
import Edit from '@mui/icons-material/EditOutlined';
import Star from '@mui/icons-material/Star';
import StarBorder from '@mui/icons-material/StarBorder';
import Add from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useForm } from '@tanstack/react-form';
import { useMemo, useState } from 'react';
import {
  useCreateTodoList,
  useCreateTodoTask,
  useDeleteTodoList,
  useDeleteTodoTask,
  useSetTaskCompleted,
  useSetTaskFavorite,
  useTodoLists,
  useTodoTasks,
  useUpdateTodoList,
  useUpdateTodoTask,
} from '@/api/hooks';
import type { TodoList, TodoTask, TodoTaskInput } from '@/api/types';
import { Async } from '@/components/Async';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { NamedItemsEditor } from '@/components/NamedItemsEditor';
import { PageHeader } from '@/components/PageHeader';
import { formatDay, todayKey } from '@/lib/format';
import { ItemIcon } from '@/lib/icons';
import { fieldError, required, tint } from '@/lib/ui';

/** `day` and `important` are built-in views; anything else is a list id. */
type View = 'day' | 'important' | 'all' | (string & {});

const NO_TASKS: TodoTask[] = [];

function isInView(task: TodoTask, view: View, today: string) {
  if (view === 'all') return true;
  if (view === 'important') return task.favorite;
  if (view === 'day') return task.dueDate !== null && task.dueDate <= today;
  return task.listId === view;
}

interface TaskFormProps {
  initial?: TodoTask;
  lists: TodoList[];
  onCancel: () => void;
  onSubmit: (values: TodoTaskInput) => Promise<void>;
}

function TaskForm({ initial, lists, onCancel, onSubmit }: TaskFormProps) {
  const form = useForm({
    defaultValues: {
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      listId: initial?.listId ?? '',
      dueDate: initial?.dueDate ?? '',
      reminderAt: initial?.reminderAt ?? '',
      favorite: initial?.favorite ?? false,
    },
    onSubmit: async ({ value }) =>
      onSubmit({
        title: value.title.trim(),
        description: value.description.trim(),
        listId: value.listId || null,
        dueDate: value.dueDate || null,
        reminderAt: value.reminderAt || null,
        favorite: value.favorite,
      }),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit().catch(() => undefined);
      }}
    >
      <DialogTitle>Editar tarea</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <form.Field name="title" validators={{ onChange: required('El nombre es obligatorio') }}>
            {(field) => (
              <TextField
                label="Nombre"
                autoFocus
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                error={Boolean(fieldError(field.state.meta))}
                helperText={fieldError(field.state.meta)}
                slotProps={{ htmlInput: { maxLength: 200 } }}
              />
            )}
          </form.Field>
          <form.Field name="description">
            {(field) => (
              <TextField
                label="Descripción"
                multiline
                minRows={3}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                slotProps={{ htmlInput: { maxLength: 2000 } }}
              />
            )}
          </form.Field>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
            <form.Field name="listId">
              {(field) => (
                <TextField select label="Lista" value={field.state.value} onChange={(event) => field.handleChange(event.target.value)}>
                  <MenuItem value="">Sin lista</MenuItem>
                  {lists.map((list) => (
                    <MenuItem key={list.id} value={list.id}>
                      {list.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </form.Field>
            <form.Field name="dueDate">
              {(field) => (
                <TextField
                  label="Vence"
                  type="date"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            </form.Field>
          </Box>
          <form.Field name="reminderAt">
            {(field) => (
              <TextField
                label="Recordatorio"
                type="datetime-local"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                helperText="Las notificaciones las programa la app móvil."
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          </form.Field>
          <form.Field name="favorite">
            {(field) => (
              <Button
                color={field.state.value ? 'warning' : 'inherit'}
                startIcon={field.state.value ? <Star /> : <StarBorder />}
                onClick={() => field.handleChange(!field.state.value)}
                sx={{ alignSelf: 'flex-start' }}
              >
                {field.state.value ? 'Importante' : 'Marcar como importante'}
              </Button>
            )}
          </form.Field>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button color="inherit" onClick={onCancel}>
          Cancelar
        </Button>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Guardar
            </Button>
          )}
        </form.Subscribe>
      </DialogActions>
    </form>
  );
}

function TaskRow({
  task,
  list,
  today,
  onToggle,
  onFavorite,
  onEdit,
  onDelete,
}: {
  task: TodoTask;
  list: TodoList | undefined;
  today: string;
  onToggle: () => void;
  onFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const overdue = !task.completed && task.dueDate !== null && task.dueDate < today;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, opacity: task.completed ? 0.55 : 1 }}>
      <Checkbox checked={task.completed} onChange={onToggle} slotProps={{ input: { 'aria-label': `Completar ${task.title}` } }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600, textDecoration: task.completed ? 'line-through' : 'none' }} noWrap>
          {task.title}
        </Typography>
        {(task.dueDate || list) && (
          <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5, flexWrap: 'wrap' }}>
            {task.dueDate && (
              <Chip
                size="small"
                label={task.dueDate === today ? 'Hoy' : formatDay(task.dueDate)}
                color={overdue ? 'error' : 'default'}
                sx={overdue ? { bgcolor: 'error.light', color: 'error.main' } : undefined}
              />
            )}
            {list && (
              <Chip
                size="small"
                icon={<ItemIcon name={list.icon} style={{ color: list.color }} />}
                label={list.name}
                sx={{ bgcolor: tint(list.color, 14) }}
              />
            )}
          </Box>
        )}
      </Box>
      <IconButton aria-label={task.favorite ? 'Quitar de importantes' : 'Marcar importante'} onClick={onFavorite} color={task.favorite ? 'warning' : 'default'}>
        {task.favorite ? <Star /> : <StarBorder />}
      </IconButton>
      <IconButton aria-label="Editar" onClick={onEdit}>
        <Edit fontSize="small" />
      </IconButton>
      <IconButton aria-label="Eliminar" onClick={onDelete}>
        <Delete fontSize="small" />
      </IconButton>
    </Box>
  );
}

export function TasksPage() {
  const [view, setView] = useState<View>('day');
  const [newTitle, setNewTitle] = useState('');
  const [editing, setEditing] = useState<TodoTask | null>(null);
  const [deleting, setDeleting] = useState<TodoTask | null>(null);
  const [listsOpen, setListsOpen] = useState(false);

  const query = useTodoTasks();
  const { lists } = useTodoLists();
  const createTask = useCreateTodoTask();
  const updateTask = useUpdateTodoTask();
  const setCompleted = useSetTaskCompleted();
  const setFavorite = useSetTaskFavorite();
  const removeTask = useDeleteTodoTask();
  const createList = useCreateTodoList();
  const updateList = useUpdateTodoList();
  const removeList = useDeleteTodoList();

  const today = todayKey();
  const listById = useMemo(() => new Map(lists.map((list) => [list.id, list])), [lists]);
  const visible = useMemo(
    () => (query.data ?? NO_TASKS).filter((task) => isInView(task, view, today)),
    [query.data, view, today],
  );
  const pending = visible.filter((task) => !task.completed);
  const done = visible.filter((task) => task.completed);

  // A list that was deleted while selected falls back to the day view.
  const activeView = view === 'day' || view === 'important' || view === 'all' || listById.has(view) ? view : 'day';

  function addTask() {
    const title = newTitle.trim();
    if (!title) return;
    createTask.mutate(
      {
        title,
        description: '',
        listId: listById.has(activeView) ? activeView : null,
        dueDate: activeView === 'day' ? today : null,
        reminderAt: null,
        favorite: activeView === 'important',
      },
      { onSuccess: () => setNewTitle('') },
    );
  }

  const views: { id: View; label: string; list?: TodoList }[] = [
    { id: 'day', label: 'Mi día' },
    { id: 'important', label: 'Importantes' },
    { id: 'all', label: 'Todas' },
    ...lists.map((list) => ({ id: list.id, label: list.name, list })),
  ];

  const renderRows = (tasks: TodoTask[]) =>
    tasks.map((task) => (
      <TaskRow
        key={task.id}
        task={task}
        list={task.listId ? listById.get(task.listId) : undefined}
        today={today}
        onToggle={() => setCompleted.mutate({ id: task.id, completed: !task.completed })}
        onFavorite={() => setFavorite.mutate({ id: task.id, favorite: !task.favorite })}
        onEdit={() => setEditing(task)}
        onDelete={() => setDeleting(task)}
      />
    ));

  return (
    <>
      <PageHeader
        title="Tareas"
        subtitle="Lo que tienes pendiente"
        actions={
          <Button color="inherit" onClick={() => setListsOpen(true)}>
            Gestionar listas
          </Button>
        }
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {views.map(({ id, label, list }) => {
          const selected = activeView === id;
          return (
            <Chip
              key={id}
              clickable
              label={label}
              icon={list ? <ItemIcon name={list.icon} style={{ color: list.color }} /> : undefined}
              onClick={() => setView(id)}
              sx={{
                height: 36,
                px: 0.5,
                bgcolor: selected ? 'primary.main' : 'background.paper',
                color: selected ? 'primary.contrastText' : 'text.primary',
                '&:hover': { bgcolor: selected ? 'primary.dark' : 'background.paper' },
              }}
            />
          );
        })}
      </Box>

      <Card sx={{ p: 1.5, mb: 3, display: 'flex', gap: 1.5 }}>
        <TextField
          placeholder="Agregar una tarea…"
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && addTask()}
          slotProps={{ htmlInput: { maxLength: 200, 'aria-label': 'Nueva tarea' } }}
        />
        <Button variant="contained" startIcon={<Add />} onClick={addTask} disabled={!newTitle.trim() || createTask.isPending}>
          Agregar
        </Button>
      </Card>

      <Async query={query}>
        {() => (
          <Stack spacing={3}>
            <Card>
              {pending.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
                  No hay tareas pendientes aquí
                </Typography>
              ) : (
                renderRows(pending)
              )}
            </Card>
            {done.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, px: 1 }}>
                  Completadas · {done.length}
                </Typography>
                <Card>{renderRows(done)}</Card>
              </Box>
            )}
          </Stack>
        )}
      </Async>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} maxWidth="xs" fullWidth>
        {editing && (
          <TaskForm
            key={editing.id}
            initial={editing}
            lists={lists}
            onCancel={() => setEditing(null)}
            onSubmit={async (values) => {
              await updateTask.mutateAsync({ id: editing.id, ...values });
              setEditing(null);
            }}
          />
        )}
      </Dialog>

      <Dialog open={listsOpen} onClose={() => setListsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Listas</DialogTitle>
        <DialogContent>
          <NamedItemsEditor
            noun="lista"
            maxName={30}
            deleteWarning="Sus tareas se conservan, pero quedan sin lista."
            items={lists.map((list) => ({ id: list.id, name: list.name, icon: list.icon, color: list.color }))}
            onCreate={(values) => createList.mutateAsync(values)}
            onUpdate={(id, values) => updateList.mutateAsync({ id, ...values })}
            onDelete={(id) => removeList.mutateAsync(id)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setListsOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar tarea"
        message={`¿Eliminar "${deleting?.title}"?`}
        onConfirm={() => deleting && removeTask.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
