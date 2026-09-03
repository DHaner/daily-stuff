import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useThemePreference, type ThemePreference } from '@/lib/theme-preference';
import { MonitorIcon, MoonStarIcon, SunIcon } from 'lucide-react-native';

const NEXT_PREFERENCE: Record<ThemePreference, ThemePreference> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

const PREFERENCE_ICONS = {
  system: MonitorIcon,
  light: SunIcon,
  dark: MoonStarIcon,
};

const PREFERENCE_LABELS: Record<ThemePreference, string> = {
  system: 'Tema del sistema',
  light: 'Tema claro',
  dark: 'Tema oscuro',
};

/** Cycles system → light → dark. The choice is persisted in AsyncStorage. */
export function ThemeToggle() {
  const { preference, setPreference } = useThemePreference();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="ios:size-9 web:mx-4 rounded-full"
      accessibilityLabel={PREFERENCE_LABELS[preference]}
      onPress={() => setPreference(NEXT_PREFERENCE[preference])}>
      <Icon as={PREFERENCE_ICONS[preference]} className="size-5" />
    </Button>
  );
}
