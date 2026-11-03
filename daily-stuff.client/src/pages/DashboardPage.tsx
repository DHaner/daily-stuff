import AccountBalance from '@mui/icons-material/AccountBalanceWalletOutlined';
import ArrowDownward from '@mui/icons-material/SouthRounded';
import ArrowUpward from '@mui/icons-material/NorthRounded';
import TaskAlt from '@mui/icons-material/TaskAltRounded';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useState } from 'react';
import { useCategories, useDashboard } from '@/api/hooks';
import type { Dashboard } from '@/api/types';
import { Async } from '@/components/Async';
import { ItemAvatar } from '@/components/NamedItemsEditor';
import { MonthNav } from '@/components/MonthNav';
import { PageHeader } from '@/components/PageHeader';
import { categoryLookup } from '@/lib/categories';
import { currentMonthKey, formatCurrency, formatCurrencyCompact, formatDay, formatMonthShort } from '@/lib/format';
import { getMood } from '@/lib/moods';
import { tint } from '@/lib/ui';

const PRIMARY = 'var(--mui-palette-primary-main)';
const SUCCESS = 'var(--mui-palette-success-main)';
const ERROR = 'var(--mui-palette-error-main)';

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{ width: 48, height: 48, borderRadius: 3.5, display: 'grid', placeItems: 'center', color, bgcolor: tint(color, 14) }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" noWrap>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function Section({ title, children, empty }: { title: string; children: React.ReactNode; empty?: string }) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
        {empty ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            {empty}
          </Typography>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

function DashboardContent({ data }: { data: Dashboard }) {
  const { categories } = useCategories();
  const category = categoryLookup(categories);

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' } }}>
        <StatCard label="Ingresos" value={formatCurrency(data.income)} color={SUCCESS} icon={<ArrowDownward />} />
        <StatCard label="Gastos" value={formatCurrency(data.expense)} color={ERROR} icon={<ArrowUpward />} />
        <StatCard
          label="Balance"
          value={formatCurrency(data.balance)}
          color={PRIMARY}
          icon={<AccountBalance />}
        />
        <StatCard label="Tareas pendientes" value={String(data.pendingTasks)} color={PRIMARY} icon={<TaskAlt />} />
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' } }}>
        <Section title="Gastos por categoría" empty={data.expensesByCategory.length === 0 ? 'Sin gastos este mes' : undefined}>
          <PieChart
            height={260}
            series={[
              {
                data: data.expensesByCategory.map((item) => ({
                  id: item.categoryId,
                  value: item.amount,
                  label: item.label,
                  color: item.color,
                })),
                innerRadius: 62,
                outerRadius: 110,
                paddingAngle: 3,
                cornerRadius: 8,
                valueFormatter: ({ value }) => formatCurrency(value),
              },
            ]}
            hideLegend
          />
          <Stack spacing={1} sx={{ mt: 2 }}>
            {data.expensesByCategory.slice(0, 5).map((item) => (
              <Box key={item.categoryId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                <Typography sx={{ flex: 1 }}>{item.label}</Typography>
                <Typography sx={{ fontWeight: 600 }}>{formatCurrency(item.amount)}</Typography>
              </Box>
            ))}
          </Stack>
        </Section>

        <Section title="Últimos 6 meses">
          <BarChart
            height={340}
            xAxis={[{ scaleType: 'band', data: data.trend.map((item) => formatMonthShort(item.month)), categoryGapRatio: 0.45 }]}
            yAxis={[{ valueFormatter: (value: number) => formatCurrencyCompact(value) }]}
            series={[
              { data: data.trend.map((item) => item.income), label: 'Ingresos', color: '#22c55e', valueFormatter: (v) => formatCurrency(v ?? 0) },
              { data: data.trend.map((item) => item.expense), label: 'Gastos', color: '#3b7bff', valueFormatter: (v) => formatCurrency(v ?? 0) },
            ]}
          />
        </Section>
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' } }}>
        <Section title="Movimientos recientes" empty={data.recentTransactions.length === 0 ? 'Sin movimientos este mes' : undefined}>
          <Stack spacing={1.5}>
            {data.recentTransactions.map((transaction) => {
              const info = category(transaction.categoryId);
              const income = transaction.kind === 'income';
              return (
                <Box key={transaction.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <ItemAvatar icon={info.icon} color={info.color} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontWeight: 600 }}>
                      {transaction.concept}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {info.label} · {formatDay(transaction.date)}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: income ? 'success.main' : 'text.primary' }}>
                    {income ? '+' : '−'}
                    {formatCurrency(transaction.amount)}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Section>

        <Stack spacing={3}>
          <Section title="Tareas para hoy" empty={data.dueTasks.length === 0 ? 'Nada pendiente para hoy 🎉' : undefined}>
            <Stack spacing={1.5}>
              {data.dueTasks.map((task) => (
                <Box key={task.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography noWrap sx={{ flex: 1, fontWeight: 600 }}>
                    {task.title}
                  </Typography>
                  {task.dueDate && <Chip size="small" label={formatDay(task.dueDate)} />}
                </Box>
              ))}
            </Stack>
          </Section>

          <Section title="Ánimo del mes" empty={data.moods.length === 0 ? 'Sin entradas en el diario' : undefined}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {data.moods.map(({ mood, count }) => {
                const meta = getMood(mood);
                return (
                  <Chip
                    key={mood}
                    icon={<meta.Icon style={{ color: meta.color }} />}
                    label={`${meta.label} · ${count}`}
                    sx={{ bgcolor: tint(meta.color, 14) }}
                  />
                );
              })}
            </Box>
          </Section>
        </Stack>
      </Box>
    </Stack>
  );
}

export function DashboardPage() {
  const [month, setMonth] = useState(currentMonthKey);
  const query = useDashboard(month);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Tu resumen del mes" actions={<MonthNav month={month} onChange={setMonth} />} />
      <Async query={query}>{(data) => <DashboardContent data={data} />}</Async>
    </>
  );
}
