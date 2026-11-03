import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/DeleteOutlined';
import Edit from '@mui/icons-material/EditOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { ItemIcon } from '@/lib/icons';
import { fieldError, required, tint } from '@/lib/ui';
import { COLORS } from '@/lib/colors';
import { ColorPicker, IconPicker } from './AppearancePickers';
import { ConfirmDialog } from './ConfirmDialog';

export interface NamedItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  /** Protected items can be edited but not deleted. */
  protected?: boolean;
}

export type NamedItemValues = Pick<NamedItem, 'name' | 'icon' | 'color'>;

export function ItemAvatar({ icon, color, size = 40 }: { icon: string; color: string; size?: number }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 3,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
        color,
        bgcolor: tint(color, 15),
      }}
    >
      <ItemIcon name={icon} fontSize="small" />
    </Box>
  );
}

interface NamedItemsEditorProps {
  items: NamedItem[];
  maxName: number;
  noun: string;
  onCreate: (values: NamedItemValues) => Promise<unknown>;
  onUpdate: (id: string, values: NamedItemValues) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  deleteWarning?: string;
}

/** Inline list with create/edit dialog and delete confirmation for anything with a name, icon and color. */
export function NamedItemsEditor({ items, maxName, noun, onCreate, onUpdate, onDelete, deleteWarning }: NamedItemsEditorProps) {
  const [editing, setEditing] = useState<NamedItem | 'new' | null>(null);
  const [deleting, setDeleting] = useState<NamedItem | null>(null);

  return (
    <Box>
      <Stack spacing={1}>
        {items.map((item) => (
          <Box
            key={item.id}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 4, bgcolor: 'background.default' }}
          >
            <ItemAvatar icon={item.icon} color={item.color} />
            <Typography sx={{ flex: 1, fontWeight: 600 }}>{item.name}</Typography>
            <IconButton aria-label={`Editar ${item.name}`} onClick={() => setEditing(item)}>
              <Edit fontSize="small" />
            </IconButton>
            {!item.protected && (
              <IconButton aria-label={`Eliminar ${item.name}`} onClick={() => setDeleting(item)}>
                <Delete fontSize="small" />
              </IconButton>
            )}
          </Box>
        ))}
        {items.length === 0 && (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            Aún no hay {noun}s.
          </Typography>
        )}
      </Stack>
      <Button startIcon={<Add />} sx={{ mt: 2 }} onClick={() => setEditing('new')}>
        Nueva {noun}
      </Button>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} maxWidth="xs" fullWidth>
        {editing && (
          <ItemForm
            key={editing === 'new' ? 'new' : editing.id}
            noun={noun}
            maxName={maxName}
            initial={editing === 'new' ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSubmit={async (values) => {
              if (editing === 'new') await onCreate(values);
              else await onUpdate(editing.id, values);
              setEditing(null);
            }}
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        title={`Eliminar ${noun}`}
        message={`¿Eliminar "${deleting?.name}"? ${deleteWarning ?? ''}`.trim()}
        onConfirm={() => deleting && onDelete(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </Box>
  );
}

interface ItemFormProps {
  noun: string;
  maxName: number;
  initial?: NamedItemValues;
  onCancel: () => void;
  onSubmit: (values: NamedItemValues) => Promise<void>;
}

function ItemForm({ noun, maxName, initial, onCancel, onSubmit }: ItemFormProps) {
  const form = useForm({
    defaultValues: {
      name: initial?.name ?? '',
      icon: initial?.icon ?? 'Star',
      color: initial?.color ?? COLORS[0],
    },
    onSubmit: async ({ value }) => onSubmit({ ...value, name: value.name.trim() }),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit().catch(() => undefined);
      }}
    >
      <DialogTitle>{initial ? `Editar ${noun}` : `Nueva ${noun}`}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <form.Field name="name" validators={{ onChange: required('El nombre es obligatorio') }}>
            {(field) => (
              <TextField
                label="Nombre"
                autoFocus
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                error={Boolean(fieldError(field.state.meta))}
                helperText={fieldError(field.state.meta)}
                slotProps={{ htmlInput: { maxLength: maxName } }}
              />
            )}
          </form.Field>
          <form.Subscribe selector={(state) => state.values.color}>
            {(color) => (
              <form.Field name="icon">
                {(field) => (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Icono
                    </Typography>
                    <IconPicker value={field.state.value} onChange={field.handleChange} color={color} />
                  </Box>
                )}
              </form.Field>
            )}
          </form.Subscribe>
          <form.Field name="color">
            {(field) => (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Color
                </Typography>
                <ColorPicker value={field.state.value} onChange={field.handleChange} />
              </Box>
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
