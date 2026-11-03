import { Icon } from '@/components/ui/icon';
import { RipplePressable } from '@/components/ui/ripple-pressable';
import { useRouter } from 'expo-router';
import { UserIcon } from 'lucide-react-native';
import { View } from 'react-native';

/** Header avatar that opens the settings and profile screen. */
export function ProfileButton() {
  const router = useRouter();

  return (
    <RipplePressable
      onPress={() => router.push('/settings')}
      accessibilityRole="button"
      accessibilityLabel="Configuración y perfil"
      className="ml-3 rounded-full">
      <View className="bg-muted size-9 items-center justify-center rounded-full">
        <Icon as={UserIcon} className="text-muted-foreground size-5" />
      </View>
    </RipplePressable>
  );
}
