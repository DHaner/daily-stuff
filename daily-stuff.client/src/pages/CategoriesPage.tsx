import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from '@/api/hooks';
import type { TransactionKind } from '@/api/types';
import { Async } from '@/components/Async';
import { NamedItemsEditor } from '@/components/NamedItemsEditor';
import { PageHeader } from '@/components/PageHeader';
import { Categories } from '@/lib/categories';

const SECTIONS: { kind: TransactionKind; title: string }[] = [
  { kind: 'expense', title: 'Gastos' },
  { kind: 'income', title: 'Ingresos' },
];

export function CategoriesPage() {
  const query = useCategories();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const remove = useDeleteCategory();

  return (
    <>
      <PageHeader title="Categorías" subtitle="Organiza tus gastos e ingresos" />
      <Async query={query}>
        {(categories) => (
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, alignItems: 'start' }}>
            {SECTIONS.map(({ kind, title }) => (
              <Card key={kind}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {title}
                  </Typography>
                  <NamedItemsEditor
                    noun="categoría"
                    maxName={40}
                    deleteWarning="Sus movimientos pasarán a la categoría “Otros”."
                    items={categories
                      .filter((category) => category.kind === kind)
                      .map((category) => ({
                        id: category.id,
                        name: category.label,
                        icon: category.icon,
                        color: category.color,
                        protected: Categories.isFallback(category.id),
                      }))}
                    onCreate={({ name, icon, color }) => create.mutateAsync({ kind, label: name, icon, color })}
                    onUpdate={(id, { name, icon, color }) => update.mutateAsync({ id, kind, label: name, icon, color })}
                    onDelete={(id) => remove.mutateAsync(id)}
                  />
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Async>
    </>
  );
}
