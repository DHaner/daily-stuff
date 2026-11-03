import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/DeleteOutlined';
import Edit from '@mui/icons-material/EditOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { createColumnHelper, tableFeatures, useTable } from '@tanstack/react-table';
import { useForm } from '@tanstack/react-form';
import { useMemo, useState } from 'react';
import {
  useCategories,
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from '@/api/hooks';
import type { Category, Transaction, TransactionInput, TransactionKind } from '@/api/types';
import { Async } from '@/components/Async';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { MonthNav } from '@/components/MonthNav';
import { ItemAvatar } from '@/components/NamedItemsEditor';
import { PageHeader } from '@/components/PageHeader';
import { categoryLookup } from '@/lib/categories';
import { currentMonthKey, formatCurrency, formatDay, monthRange, todayKey } from '@/lib/format';
import { fieldError, required } from '@/lib/ui';

type KindFilter = 'all' | TransactionKind;

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, Transaction>();
const NO_TRANSACTIONS: Transaction[] = [];

interface TransactionsTableProps {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

function TransactionsTable({ transactions, categories, onEdit, onDelete }: TransactionsTableProps) {
  const columns = useMemo(() => {
    const category = categoryLookup(categories);
    return columnHelper.columns([
      columnHelper.accessor('date', {
        header: 'Fecha',
        cell: (info) => formatDay(info.getValue()),
      }),
      columnHelper.accessor('concept', {
        header: 'Concepto',
        cell: (info) => {
          const row = info.row.original;
          const { icon, color } = category(row.categoryId);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ItemAvatar icon={icon} color={color} size={36} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }} noWrap>
                  {row.concept}
                </Typography>
                {row.description && (
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 320 }}>
                    {row.description}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        },
      }),
      columnHelper.accessor('categoryId', {
        header: 'Categoría',
        cell: (info) => category(info.getValue()).label,
      }),
      columnHelper.accessor('amount', {
        header: 'Monto',
        cell: (info) => {
          const income = info.row.original.kind === 'income';
          return (
            <Typography sx={{ fontWeight: 700, color: income ? 'success.main' : 'text.primary' }} align="right">
              {income ? '+' : '−'}
              {formatCurrency(info.getValue())}
            </Typography>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton aria-label="Editar" onClick={() => onEdit(info.row.original)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton aria-label="Eliminar" onClick={() => onDelete(info.row.original)}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        ),
      }),
    ]);
  }, [categories, onEdit, onDelete]);

  const table = useTable({ features, columns, data: transactions });

  return (
    <TableContainer>
      <Table>
        <TableHead>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableCell
                  key={header.id}
                  align={header.column.id === 'amount' ? 'right' : 'left'}
                  sx={{ color: 'text.secondary', fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} hover>
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                No hay movimientos en este mes
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

interface TransactionFormProps {
  initial?: Transaction;
  categories: Category[];
  onCancel: () => void;
  onSubmit: (values: TransactionInput) => Promise<void>;
}

function TransactionForm({ initial, categories, onCancel, onSubmit }: TransactionFormProps) {
  const form = useForm({
    defaultValues: {
      kind: (initial?.kind ?? 'expense') as TransactionKind,
      concept: initial?.concept ?? '',
      amount: initial ? String(initial.amount) : '',
      description: initial?.description ?? '',
      categoryId: initial?.categoryId ?? '',
      date: initial?.date ?? todayKey(),
    },
    onSubmit: async ({ value }) => {
      const options = categories.filter((category) => category.kind === value.kind);
      await onSubmit({
        kind: value.kind,
        concept: value.concept.trim(),
        amount: Number(value.amount.replace(',', '.')),
        description: value.description.trim(),
        categoryId: options.some((category) => category.id === value.categoryId) ? value.categoryId : options[0].id,
        date: value.date,
      });
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit().catch(() => undefined);
      }}
    >
      <DialogTitle>{initial ? 'Editar movimiento' : 'Nuevo movimiento'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <form.Field name="kind">
            {(field) => (
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={field.state.value}
                onChange={(_, value: TransactionKind | null) => value && field.handleChange(value)}
              >
                <ToggleButton value="expense">Gasto</ToggleButton>
                <ToggleButton value="income">Ingreso</ToggleButton>
              </ToggleButtonGroup>
            )}
          </form.Field>

          <form.Field name="concept" validators={{ onChange: required('El concepto es obligatorio') }}>
            {(field) => (
              <TextField
                label="Concepto"
                autoFocus
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                error={Boolean(fieldError(field.state.meta))}
                helperText={fieldError(field.state.meta)}
                slotProps={{ htmlInput: { maxLength: 120 } }}
              />
            )}
          </form.Field>

          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
            <form.Field
              name="amount"
              validators={{
                onChange: ({ value }) => {
                  const amount = Number(value.replace(',', '.'));
                  if (!value.trim()) return 'Ingresa un monto';
                  return Number.isFinite(amount) && amount >= 0 ? undefined : 'Monto inválido';
                },
              }}
            >
              {(field) => (
                <TextField
                  label="Monto"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  error={Boolean(fieldError(field.state.meta))}
                  helperText={fieldError(field.state.meta)}
                  slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                />
              )}
            </form.Field>
            <form.Field name="date" validators={{ onChange: required('Elige una fecha') }}>
              {(field) => (
                <TextField
                  label="Fecha"
                  type="date"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  error={Boolean(fieldError(field.state.meta))}
                  helperText={fieldError(field.state.meta)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            </form.Field>
          </Box>

          <form.Subscribe selector={(state) => state.values.kind}>
            {(kind) => (
              <form.Field name="categoryId">
                {(field) => {
                  const options = categories.filter((category) => category.kind === kind);
                  const value = options.some((category) => category.id === field.state.value)
                    ? field.state.value
                    : (options[0]?.id ?? '');
                  return (
                    <TextField select label="Categoría" value={value} onChange={(event) => field.handleChange(event.target.value)}>
                      {options.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  );
                }}
              </form.Field>
            )}
          </form.Subscribe>

          <form.Field name="description">
            {(field) => (
              <TextField
                label="Descripción"
                multiline
                minRows={2}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                slotProps={{ htmlInput: { maxLength: 1000 } }}
              />
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

export function TransactionsPage() {
  const [month, setMonth] = useState(currentMonthKey);
  const [kind, setKind] = useState<KindFilter>('all');
  const [editing, setEditing] = useState<Transaction | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const { from, to } = monthRange(month);
  const query = useTransactions(from, to);
  const { categories } = useCategories();
  const create = useCreateTransaction();
  const update = useUpdateTransaction();
  const remove = useDeleteTransaction();

  const transactions = useMemo(
    () => (query.data ?? NO_TRANSACTIONS).filter((transaction) => kind === 'all' || transaction.kind === kind),
    [query.data, kind],
  );
  const income = transactions.filter((t) => t.kind === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter((t) => t.kind === 'expense').reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
      <PageHeader
        title="Finanzas"
        subtitle="Gastos e ingresos del mes"
        actions={
          <>
            <MonthNav month={month} onChange={setMonth} />
            <Button variant="contained" startIcon={<Add />} onClick={() => setEditing('new')} disabled={categories.length === 0}>
              Nuevo
            </Button>
          </>
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
        <ToggleButtonGroup
          exclusive
          value={kind}
          onChange={(_, value: KindFilter | null) => value && setKind(value)}
          sx={{ bgcolor: 'background.paper', p: 0.5, borderRadius: 4, alignSelf: 'flex-start' }}
        >
          <ToggleButton value="all">Todos</ToggleButton>
          <ToggleButton value="expense">Gastos</ToggleButton>
          <ToggleButton value="income">Ingresos</ToggleButton>
        </ToggleButtonGroup>
        <Typography color="text.secondary">
          Ingresos <b>{formatCurrency(income)}</b> · Gastos <b>{formatCurrency(expense)}</b> · Balance{' '}
          <b>{formatCurrency(income - expense)}</b>
        </Typography>
      </Stack>

      <Async query={query}>
        {() => (
          <Card>
            <TransactionsTable
              transactions={transactions}
              categories={categories}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          </Card>
        )}
      </Async>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} maxWidth="xs" fullWidth>
        {editing && (
          <TransactionForm
            key={editing === 'new' ? 'new' : editing.id}
            initial={editing === 'new' ? undefined : editing}
            categories={categories}
            onCancel={() => setEditing(null)}
            onSubmit={async (values) => {
              if (editing === 'new') await create.mutateAsync(values);
              else await update.mutateAsync({ id: editing.id, ...values });
              setEditing(null);
            }}
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar movimiento"
        message={`¿Eliminar "${deleting?.concept}"? Esta acción no se puede deshacer.`}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
