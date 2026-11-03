import '@fontsource-variable/inter';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { notifyError } from '@/lib/notify';
import { router } from '@/router';
import { theme } from '@/theme';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
  mutationCache: new MutationCache({ onError: (error) => notifyError(error.message) }),
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
