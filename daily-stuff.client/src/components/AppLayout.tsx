import Category from '@mui/icons-material/CategoryOutlined';
import Checklist from '@mui/icons-material/ChecklistRounded';
import DarkMode from '@mui/icons-material/DarkModeOutlined';
import Dashboard from '@mui/icons-material/GridViewRounded';
import LightMode from '@mui/icons-material/LightModeOutlined';
import Menu from '@mui/icons-material/Menu';
import Savings from '@mui/icons-material/SavingsOutlined';
import Book from '@mui/icons-material/AutoStoriesOutlined';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Snackbar from '@mui/material/Snackbar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useColorScheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
import { dismissNotification, useNotification } from '@/lib/notify';

const DRAWER_WIDTH = 248;

const NAV = [
  { to: '/', label: 'Dashboard', Icon: Dashboard },
  { to: '/finanzas', label: 'Finanzas', Icon: Savings },
  { to: '/diario', label: 'Diario', Icon: Book },
  { to: '/tareas', label: 'Tareas', Icon: Checklist },
  { to: '/categorias', label: 'Categorías', Icon: Category },
] as const;

function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const dark = (mode === 'system' ? systemMode : mode) === 'dark';
  return (
    <IconButton aria-label="Cambiar tema" onClick={() => setMode(dark ? 'light' : 'dark')}>
      {dark ? <LightMode /> : <DarkMode />}
    </IconButton>
  );
}

export function AppLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const desktop = useMediaQuery('(min-width:900px)');
  const [open, setOpen] = useState(false);
  const notification = useNotification();

  const drawer = (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1, py: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 3,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 800,
          }}
        >
          D
        </Box>
        <Typography variant="h6">Daily Stuff</Typography>
      </Box>
      <List disablePadding sx={{ display: 'grid', gap: 0.5 }}>
        {NAV.map(({ to, label, Icon }) => (
          <ListItemButton
            key={to}
            href={to}
            selected={to === '/' ? pathname === '/' : pathname.startsWith(to)}
            onClick={(event) => {
              event.preventDefault();
              void navigate({ to });
              setOpen(false);
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              <Icon />
            </ListItemIcon>
            <ListItemText primary={label} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {desktop ? (
        <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}>
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawer}
        </Drawer>
      )}

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(12px)' }}>
          <Toolbar sx={{ justifyContent: desktop ? 'flex-end' : 'space-between' }}>
            {!desktop && (
              <IconButton aria-label="Abrir menú" onClick={() => setOpen(true)}>
                <Menu />
              </IconButton>
            )}
            <ThemeToggle />
          </Toolbar>
        </AppBar>
        <Box sx={{ px: { xs: 2, md: 4 }, pb: 6, maxWidth: 1280, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>

      <Snackbar
        open={notification !== null}
        autoHideDuration={6000}
        onClose={dismissNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" onClose={dismissNotification}>
          {notification}
        </Alert>
      </Snackbar>
    </Box>
  );
}
