import '@/global.css';

import { PERSIST_MAX_AGE, queryClient, queryPersister } from '@/lib/query-client';
import { initDatabase } from '@/lib/db/init';
import { DATABASE_NAME } from '@/lib/db/schema';
import { NAV_THEME } from '@/lib/theme';
import { applyStoredThemePreference } from '@/lib/theme-preference';
import { PortalHost } from '@rn-primitives/portal';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { ThemeProvider } from 'expo-router/react-navigation';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUniwind } from 'uniwind';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [isThemeReady, setIsThemeReady] = React.useState(false);

  React.useEffect(() => {
    applyStoredThemePreference().finally(() => setIsThemeReady(true));
  }, []);

  React.useEffect(() => {
    if (isThemeReady) {
      SplashScreen.hideAsync();
    }
  }, [isThemeReady]);

  // The splash screen stays up while the theme preference loads from AsyncStorage,
  // so the app never flashes the wrong theme.
  if (!isThemeReady) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { theme } = useUniwind();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase}>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: queryPersister, maxAge: PERSIST_MAX_AGE }}>
          <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
            <BottomSheetModalProvider>
              <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="expense/[id]" options={{ title: 'Detalle del gasto' }} />
                <Stack.Screen name="categories" options={{ title: 'Categorías' }} />
                <Stack.Screen name="journal/[date]" options={{ title: 'Entrada del diario' }} />
                <Stack.Screen name="journal/labels" options={{ title: 'Etiquetas' }} />
              </Stack>
              <PortalHost />
            </BottomSheetModalProvider>
          </ThemeProvider>
        </PersistQueryClientProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
