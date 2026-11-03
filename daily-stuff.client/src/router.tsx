import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { AppLayout } from '@/components/AppLayout';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { JournalPage } from '@/pages/JournalPage';
import { TasksPage } from '@/pages/TasksPage';
import { TransactionsPage } from '@/pages/TransactionsPage';

const rootRoute = createRootRoute({ component: AppLayout });

const page = <TPath extends string>(path: TPath, component: () => React.JSX.Element) =>
  createRoute({ getParentRoute: () => rootRoute, path, component });

const routeTree = rootRoute.addChildren([
  page('/', DashboardPage),
  page('/finanzas', TransactionsPage),
  page('/diario', JournalPage),
  page('/tareas', TasksPage),
  page('/categorias', CategoriesPage),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
