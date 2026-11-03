import { createTheme } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';

const RADIUS = 16;

/**
 * Soft UI: tinted surfaces and generous radii instead of shadows or hard borders.
 * Blue is the primary color; depth comes from the background/paper contrast.
 */
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data' },
  defaultColorScheme: 'light',
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#3b7bff', light: '#e6efff', dark: '#2459d6', contrastText: '#ffffff' },
        secondary: { main: '#6c7a9c' },
        success: { main: '#16a34a', light: '#e3f7ea' },
        error: { main: '#e5484d', light: '#fdeaea' },
        warning: { main: '#f59e0b', light: '#fff3dc' },
        background: { default: '#f1f4fb', paper: '#ffffff' },
        text: { primary: '#1a2547', secondary: '#6b7899' },
        divider: 'rgba(59, 123, 255, 0.1)',
      },
    },
    dark: {
      palette: {
        primary: { main: '#6b9bff', light: '#1d2b4d', dark: '#9bb9ff', contrastText: '#0b1226' },
        secondary: { main: '#9aa7c7' },
        success: { main: '#4ade80', light: '#16301f' },
        error: { main: '#ff7a7f', light: '#3a1d21' },
        warning: { main: '#fbbf24', light: '#3a2d12' },
        background: { default: '#0d1325', paper: '#161e36' },
        text: { primary: '#e8ecf8', secondary: '#9aa7c7' },
        divider: 'rgba(107, 155, 255, 0.14)',
      },
    },
  },
  shape: { borderRadius: RADIUS },
  shadows: Array(25).fill('none') as Shadows,
  typography: {
    fontFamily: '"Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 650 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { borderRadius: 24 } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 14, paddingInline: 18 } },
    },
    MuiIconButton: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiToggleButtonGroup: {
      styleOverrides: { root: { gap: 4 } },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: 0,
          borderRadius: '12px !important',
          textTransform: 'none',
          fontWeight: 600,
          color: theme.vars.palette.text.secondary,
          '&.Mui-selected': {
            backgroundColor: theme.vars.palette.primary.light,
            color: theme.vars.palette.primary.main,
          },
          '&.Mui-selected:hover': { backgroundColor: theme.vars.palette.primary.light },
        }),
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 10, fontWeight: 600 } } },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 28 } },
    },
    MuiDrawer: {
      styleOverrides: { paper: { borderRight: 0, backgroundImage: 'none' } },
    },
    MuiMenu: {
      styleOverrides: { paper: ({ theme }) => ({ borderRadius: 16, border: `1px solid ${theme.vars.palette.divider}` }) },
    },
    MuiTextField: { defaultProps: { variant: 'filled', fullWidth: true } },
    MuiFilledInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 14,
          backgroundColor: theme.vars.palette.background.default,
          '&:hover': { backgroundColor: theme.vars.palette.background.default },
          '&.Mui-focused': {
            backgroundColor: theme.vars.palette.background.default,
            outline: `2px solid ${theme.vars.palette.primary.main}`,
          },
          '&:before, &:after': { display: 'none' },
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 14,
          '&.Mui-selected, &.Mui-selected:hover': {
            backgroundColor: theme.vars.palette.primary.light,
            color: theme.vars.palette.primary.main,
            '& .MuiListItemIcon-root': { color: theme.vars.palette.primary.main },
          },
        }),
      },
    },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 14 } } },
    MuiTableCell: {
      styleOverrides: { root: ({ theme }) => ({ borderBottom: `1px solid ${theme.vars.palette.divider}` }) },
    },
  },
});
