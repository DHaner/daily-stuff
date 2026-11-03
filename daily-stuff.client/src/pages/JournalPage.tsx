import Add from '@mui/icons-material/Add';
import Label from '@mui/icons-material/SellOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import {
  useCreateJournalLabel,
  useDeleteJournalEntry,
  useDeleteJournalLabel,
  useJournalEntries,
  useJournalLabels,
  useSaveJournalEntry,
  useUpdateJournalLabel,
} from '@/api/hooks';
import type { JournalEntry, JournalLabel, Mood } from '@/api/types';
import { Async } from '@/components/Async';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { MonthNav } from '@/components/MonthNav';
import { NamedItemsEditor } from '@/components/NamedItemsEditor';
import { PageHeader } from '@/components/PageHeader';
import { currentMonthKey, formatDayLong, monthRange, todayKey } from '@/lib/format';
import { ItemIcon } from '@/lib/icons';
import { getMood, MOODS } from '@/lib/moods';
import { tint } from '@/lib/ui';

function LabelChip({ label }: { label: JournalLabel }) {
  return (
    <Chip
      size="small"
      icon={<ItemIcon name={label.icon} style={{ color: label.color }} />}
      label={label.name}
      sx={{ bgcolor: tint(label.color, 14) }}
    />
  );
}

function EntryCard({ entry, labels, onClick }: { entry: JournalEntry; labels: JournalLabel[]; onClick: () => void }) {
  const mood = getMood(entry.mood);
  const entryLabels = labels.filter((label) => entry.labelIds.includes(label.id));
  return (
    <Card>
      <CardActionArea onClick={onClick}>
        <CardContent sx={{ p: 3, display: 'flex', gap: 2 }}>
          <Box
            sx={{ width: 48, height: 48, borderRadius: 3.5, display: 'grid', placeItems: 'center', flexShrink: 0, color: mood.color, bgcolor: tint(mood.color, 15) }}
          >
            <mood.Icon />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>{formatDayLong(entry.date)}</Typography>
            <Typography variant="body2" sx={{ color: mood.color, fontWeight: 600 }}>
              {mood.label}
            </Typography>
            {entry.note && (
              <Typography color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                {entry.note}
              </Typography>
            )}
            {entryLabels.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
                {entryLabels.map((label) => (
                  <LabelChip key={label.id} label={label} />
                ))}
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

interface EntryFormProps {
  /** Existing entry, or the day to create one for. */
  entry: JournalEntry | undefined;
  date: string;
  labels: JournalLabel[];
  onCancel: () => void;
  onDelete: () => void;
  onSubmit: (values: { date: string; mood: Mood; note: string; labelIds: string[] }) => Promise<void>;
}

function EntryForm({ entry, date, labels, onCancel, onDelete, onSubmit }: EntryFormProps) {
  const form = useForm({
    defaultValues: {
      date,
      mood: (entry?.mood ?? 'normal') as Mood,
      note: entry?.note ?? '',
      labelIds: entry?.labelIds ?? ([] as string[]),
    },
    onSubmit: async ({ value }) => onSubmit(value),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit().catch(() => undefined);
      }}
    >
      <DialogTitle>{entry ? 'Editar entrada' : 'Nueva entrada'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <form.Field name="date">
            {(field) => (
              <TextField
                label="Fecha"
                type="date"
                disabled={entry !== undefined}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          </form.Field>

          <form.Field name="mood">
            {(field) => (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  ¿Cómo te sentiste?
                </Typography>
                <Box role="radiogroup" sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
                  {MOODS.map((mood) => {
                    const selected = field.state.value === mood.id;
                    return (
                      <ButtonBase
                        key={mood.id}
                        role="radio"
                        aria-checked={selected}
                        onClick={() => field.handleChange(mood.id)}
                        sx={{
                          flexDirection: 'column',
                          gap: 0.5,
                          py: 1.25,
                          borderRadius: 3.5,
                          color: selected ? mood.color : 'text.secondary',
                          bgcolor: selected ? tint(mood.color, 16) : 'background.default',
                        }}
                      >
                        <mood.Icon />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {mood.label}
                        </Typography>
                      </ButtonBase>
                    );
                  })}
                </Box>
              </Box>
            )}
          </form.Field>

          <form.Field name="note">
            {(field) => (
              <TextField
                label="Nota"
                multiline
                minRows={4}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            )}
          </form.Field>

          <form.Field name="labelIds">
            {(field) => (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Etiquetas
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {labels.map((label) => {
                    const selected = field.state.value.includes(label.id);
                    return (
                      <Chip
                        key={label.id}
                        clickable
                        icon={<ItemIcon name={label.icon} style={{ color: label.color }} />}
                        label={label.name}
                        onClick={() =>
                          field.handleChange(selected ? field.state.value.filter((id) => id !== label.id) : [...field.state.value, label.id])
                        }
                        sx={{ bgcolor: selected ? tint(label.color, 22) : 'background.default', outline: selected ? `2px solid ${label.color}` : 'none' }}
                      />
                    );
                  })}
                  {labels.length === 0 && <Typography color="text.secondary">Crea etiquetas desde “Etiquetas”.</Typography>}
                </Box>
              </Box>
            )}
          </form.Field>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        {entry && (
          <Button color="error" onClick={onDelete} sx={{ mr: 'auto' }}>
            Eliminar
          </Button>
        )}
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

export function JournalPage() {
  const [month, setMonth] = useState(currentMonthKey);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<JournalEntry | null>(null);
  const [labelsOpen, setLabelsOpen] = useState(false);

  const { from, to } = monthRange(month);
  const query = useJournalEntries(from, to);
  const { labels } = useJournalLabels();
  const save = useSaveJournalEntry();
  const removeEntry = useDeleteJournalEntry();
  const createLabel = useCreateJournalLabel();
  const updateLabel = useUpdateJournalLabel();
  const removeLabel = useDeleteJournalLabel();

  const editingEntry = editingDate ? query.data?.find((entry) => entry.date === editingDate) : undefined;

  return (
    <>
      <PageHeader
        title="Diario"
        subtitle="Una entrada por día"
        actions={
          <>
            <MonthNav month={month} onChange={setMonth} />
            <Button startIcon={<Label />} color="inherit" onClick={() => setLabelsOpen(true)}>
              Etiquetas
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => {
                setMonth(currentMonthKey());
                setEditingDate(todayKey());
              }}
            >
              Hoy
            </Button>
          </>
        }
      />

      <Async query={query}>
        {(entries) =>
          entries.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 8, textAlign: 'center' }}>
              No hay entradas en este mes
            </Typography>
          ) : (
            <Stack spacing={2}>
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} labels={labels} onClick={() => setEditingDate(entry.date)} />
              ))}
            </Stack>
          )
        }
      </Async>

      <Dialog open={editingDate !== null} onClose={() => setEditingDate(null)} maxWidth="sm" fullWidth>
        {editingDate && query.data && (
          <EntryForm
            key={editingDate}
            entry={editingEntry}
            date={editingDate}
            labels={labels}
            onCancel={() => setEditingDate(null)}
            onDelete={() => editingEntry && setDeleting(editingEntry)}
            onSubmit={async ({ date, ...values }) => {
              await save.mutateAsync({ date, ...values });
              setEditingDate(null);
            }}
          />
        )}
      </Dialog>

      <Dialog open={labelsOpen} onClose={() => setLabelsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Etiquetas</DialogTitle>
        <DialogContent>
          <NamedItemsEditor
            noun="etiqueta"
            maxName={24}
            deleteWarning="Se quitará de las entradas que la usan."
            items={labels.map((label) => ({ id: label.id, name: label.name, icon: label.icon, color: label.color }))}
            onCreate={(values) => createLabel.mutateAsync(values)}
            onUpdate={(id, values) => updateLabel.mutateAsync({ id, ...values })}
            onDelete={(id) => removeLabel.mutateAsync(id)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setLabelsOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar entrada"
        message="¿Eliminar esta entrada del diario? Esta acción no se puede deshacer."
        onConfirm={() => {
          if (deleting) removeEntry.mutate(deleting.date);
          setDeleting(null);
          setEditingDate(null);
        }}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
