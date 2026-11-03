import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import type { ReactNode } from 'react';

interface AsyncProps<T> {
  query: { data: T | undefined; isPending: boolean; error: Error | null };
  children: (data: T) => ReactNode;
}

/** Renders the loading and error states of a query so pages only deal with the happy path. */
export function Async<T>({ query, children }: AsyncProps<T>) {
  if (query.error) return <Alert severity="error">{query.error.message || 'No se pudo cargar la información'}</Alert>;
  if (query.isPending || query.data === undefined) {
    return (
      <Box sx={{ py: 6 }}>
        <LinearProgress />
      </Box>
    );
  }
  return <>{children(query.data)}</>;
}
