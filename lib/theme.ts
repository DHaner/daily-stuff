import { DarkTheme, DefaultTheme, type Theme } from 'expo-router/react-navigation';

export const THEME = {
  light: {
    background: '#ffffff',
    foreground: '#09090b',
    card: '#ffffff',
    cardForeground: '#09090b',
    popover: '#ffffff',
    popoverForeground: '#09090b',
    primary: '#1447e6',
    primaryForeground: '#eff6ff',
    secondary: '#f4f4f5',
    secondaryForeground: '#18181b',
    muted: '#f4f4f5',
    mutedForeground: '#71717b',
    accent: '#f4f4f5',
    accentForeground: '#18181b',
    destructive: '#e7000b',
    border: '#e4e4e7',
    input: '#e4e4e7',
    ring: '#9f9fa9',
    radius: '0.45rem',
    chart1: '#d4d4d8',
    chart2: '#71717b',
    chart3: '#52525c',
    chart4: '#3f3f46',
    chart5: '#27272a',
  },
  dark: {
    background: '#09090b',
    foreground: '#fafafa',
    card: '#18181b',
    cardForeground: '#fafafa',
    popover: '#18181b',
    popoverForeground: '#fafafa',
    primary: '#193cb8',
    primaryForeground: '#eff6ff',
    secondary: '#27272a',
    secondaryForeground: '#fafafa',
    muted: '#27272a',
    mutedForeground: '#9f9fa9',
    accent: '#27272a',
    accentForeground: '#fafafa',
    destructive: '#ff6467',
    border: '#ffffff1a',
    input: '#ffffff26',
    ring: '#71717b',
    radius: '0.45rem',
    chart1: '#d4d4d8',
    chart2: '#71717b',
    chart3: '#52525c',
    chart4: '#3f3f46',
    chart5: '#27272a',
  },
};

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
/**
 * Hex mirror of the theme, for third-party views that cannot read Tailwind classes
 * (react-native-calendars, react-native-chart-kit).
 */
export const PALETTE = {
  light: {
    background: '#ffffff',
    card: '#ffffff',
    foreground: '#09090b',
    muted: '#f4f4f5',
    mutedForeground: '#71717b',
    border: '#e4e4e7',
    primary: '#1447e6',
    primaryForeground: '#eff6ff',
    destructive: '#e7000b',
  },
  dark: {
    background: '#09090b',
    card: '#18181b',
    foreground: '#fafafa',
    muted: '#27272a',
    mutedForeground: '#9f9fa9',
    border: '#ffffff1a',
    primary: '#193cb8',
    primaryForeground: '#eff6ff',
    destructive: '#ff6467',
  },
} as const;
