import { ProfileButton } from '@/components/profile-button';
import { Tabs } from 'expo-router';
import { BookHeartIcon, ListChecksIcon, WalletIcon } from 'lucide-react-native';

// The title is pinned to the full header width with equal insets, so it stays centred no matter
// how wide the avatar on the left is (the default layout centres it in the leftover space).
const SCREEN_OPTIONS = {
  headerLeft: () => <ProfileButton />,
  headerTitleAlign: 'center' as const,
  headerTitleContainerStyle: {
    position: 'absolute' as const,
    left: 56,
    right: 56,
    top: 0,
    bottom: 0,
    justifyContent: 'center' as const,
    marginHorizontal: 0,
    alignItems: 'center' as const,
  },
  headerShadowVisible: false,
};

export default function TabsLayout() {
  return (
    <Tabs screenOptions={SCREEN_OPTIONS}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Finanzas',
          tabBarIcon: ({ color, size }) => <WalletIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Diario',
          tabBarIcon: ({ color, size }) => <BookHeartIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tareas',
          tabBarIcon: ({ color, size }) => <ListChecksIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
