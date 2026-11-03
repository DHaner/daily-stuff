import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Página no encontrada' }} />
      <View className="bg-background flex-1 items-center justify-center gap-4 p-6">
        <Text variant="h3">Esta pantalla no existe</Text>
        <Link href="/" asChild>
          <Button variant="outline">
            <Text>Volver al inicio</Text>
          </Button>
        </Link>
      </View>
    </>
  );
}
