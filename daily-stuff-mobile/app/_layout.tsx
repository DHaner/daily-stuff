import '@/global.css';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useCategoriesSync } from '@/hooks/use-categories';
import { API_URL } from '@/lib/api/client';
import { PERSIST_MAX_AGE, queryClient, queryPersister } from '@/lib/query-client';
import { NAV_THEME } from '@/lib/theme';
import { applyStoredThemePreference } from '@/lib/theme-preference';
import { PortalHost } from '@rn-primitives/portal';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { ThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
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
      <KeyboardProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: queryPersister, maxAge: PERSIST_MAX_AGE }}>
          <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
            <BottomSheetModalProvider>
              <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
              <CategoriesGate>
              <Stack screenOptions={{ headerShadowVisible: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="expense/[id]" options={{ title: 'Detalle del gasto' }} />
                <Stack.Screen name="settings" options={{ title: 'Configuración y perfil' }} />
                <Stack.Screen name="privacy" options={{ title: 'Política de privacidad' }} />
                <Stack.Screen name="categories" options={{ title: 'Categorías' }} />
                <Stack.Screen name="journal/[date]" options={{ title: 'Entrada del diario' }} />
                <Stack.Screen name="journal/labels" options={{ title: 'Etiquetas' }} />
                <Stack.Screen name="task/[id]" options={{ title: 'Tarea' }} />
                <Stack.Screen name="task/list" options={{ title: 'Lista' }} />
              </Stack>
              </CategoriesGate>
              <PortalHost />
            </BottomSheetModalProvider>
          </ThemeProvider>
        </PersistQueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Categories are needed by almost every screen (`getCategory` is synchronous), so nothing renders
 * until they are loaded from the API or restored from the persisted query cache.
 */
function CategoriesGate({ children }: { children: React.ReactNode }) {
  const query = useCategoriesSync();

  if (query.data) {
    return <>{children}</>;
  }

  if (query.isError) {
    return (
      <View className="bg-background flex-1 items-center justify-center gap-4 p-6">
        <Text className="text-center text-lg font-semibold">No se pudo conectar con el servidor</Text>
        <Text className="text-muted-foreground text-center text-sm">{API_URL}</Text>
        <Button onPress={() => query.refetch()} disabled={query.isFetching}>
          <Text>Reintentar</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="bg-background flex-1 items-center justify-center">
      <ActivityIndicator />
    </View>
  );
}
