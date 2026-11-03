import { FormField, PLAIN_INPUT } from '@/components/expenses/form-field';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { RipplePressable } from '@/components/ui/ripple-pressable';
import { Text } from '@/components/ui/text';
import { useProfile } from '@/lib/profile';
import { useThemePreference, type ThemePreference } from '@/lib/theme-preference';
import { cn } from '@/lib/utils';
import { useRouter, type Href } from 'expo-router';
import {
  CheckIcon,
  ChevronRightIcon,
  MailIcon,
  MonitorIcon,
  MoonStarIcon,
  ShapesIcon,
  ShieldCheckIcon,
  SunIcon,
  TagsIcon,
  UserIcon,
  type LucideIcon,
} from 'lucide-react-native';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: LucideIcon }[] = [
  { value: 'system', label: 'Sistema', icon: MonitorIcon },
  { value: 'light', label: 'Claro', icon: SunIcon },
  { value: 'dark', label: 'Oscuro', icon: MoonStarIcon },
];

const LINKS: { icon: LucideIcon; label: string; href: Href }[] = [
  { icon: ShapesIcon, label: 'Edición de categorías', href: '/categories' },
  { icon: TagsIcon, label: 'Edición de etiquetas', href: '/journal/labels' },
  { icon: ShieldCheckIcon, label: 'Política de privacidad', href: '/privacy' },
];

function SectionTitle({ children }: { children: string }) {
  return <Text className="px-4 pt-6 pb-2 text-sm font-semibold">{children}</Text>;
}

/** One tappable settings row; the hairline below is dropped on the last row of a section. */
function Row({
  icon,
  label,
  onPress,
  selected,
  last,
  showChevron,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  selected?: boolean;
  last?: boolean;
  showChevron?: boolean;
}) {
  return (
    <RipplePressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={selected === undefined ? undefined : { selected }}
      className={cn(
        'border-border/60 flex-row items-center gap-3 px-4 py-3.5',
        !last && 'border-b'
      )}>
      <Icon as={icon} className="text-muted-foreground size-5" />
      <Text className="flex-1 text-base font-medium">{label}</Text>
      {selected ? <Icon as={CheckIcon} className="text-primary size-5" /> : null}
      {showChevron ? <Icon as={ChevronRightIcon} className="text-muted-foreground size-4" /> : null}
    </RipplePressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { preference, setPreference } = useThemePreference();
  const { profile, update } = useProfile();

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <SectionTitle>Perfil</SectionTitle>
        <View className="px-4">
          <FormField label="Nombre" caption="Nombre" icon={UserIcon}>
            <Input
              className={PLAIN_INPUT}
              placeholder="Tu nombre"
              value={profile.name}
              onChangeText={(name) => update({ name })}
              autoCapitalize="words"
              autoComplete="name"
            />
          </FormField>
          <FormField label="Correo" caption="Correo" icon={MailIcon} last>
            <Input
              className={PLAIN_INPUT}
              placeholder="tu@correo.com"
              value={profile.email}
              onChangeText={(email) => update({ email })}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
            />
          </FormField>
        </View>

        <SectionTitle>Tema</SectionTitle>
        <View>
          {THEME_OPTIONS.map((option, index) => (
            <Row
              key={option.value}
              icon={option.icon}
              label={option.label}
              selected={preference === option.value}
              last={index === THEME_OPTIONS.length - 1}
              onPress={() => setPreference(option.value)}
            />
          ))}
        </View>

        <SectionTitle>Más opciones</SectionTitle>
        <View>
          {LINKS.map((link, index) => (
            <Row
              key={link.label}
              icon={link.icon}
              label={link.label}
              showChevron
              last={index === LINKS.length - 1}
              onPress={() => router.push(link.href)}
            />
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
