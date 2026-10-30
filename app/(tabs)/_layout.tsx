import { ThemeToggle } from '@/components/theme-toggle';
import { Tabs } from 'expo-router';
import { BookHeartIcon, ListChecksIcon, WalletIcon } from 'lucide-react-native';

const SCREEN_OPTIONS = {
  headerRight: () => <ThemeToggle />,
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
