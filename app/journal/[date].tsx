import { DatePicker } from '@/components/expenses/date-picker';
import { LabelChip } from '@/components/journal/label-chip';
import { MoodPicker } from '@/components/journal/mood-picker';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import {
  useDaysWithJournalEntries,
  useDeleteJournalEntry,
  useJournalEntry,
  useJournalLabels,
  useSaveJournalEntry,
} from '@/hooks/use-journal';
import type { DayKey } from '@/lib/date';
import type { MoodId } from '@/lib/journal-moods';
import { journalEntryFormSchema } from '@/lib/schemas/journal';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CameraIcon, ImagePlusIcon, SettingsIcon, Trash2Icon, XIcon } from 'lucide-react-native';
import * as React from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

const PHOTO_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  quality: 0.8,
};

export default function JournalEntryScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const [day, setDay] = React.useState<DayKey>(date);

  const entryQuery = useJournalEntry(day);
  const labelsQuery = useJournalLabels();
  const daysQuery = useDaysWithJournalEntries();
  const saveEntry = useSaveJournalEntry();
  const deleteEntry = useDeleteJournalEntry();

  const [mood, setMood] = React.useState<MoodId | null>(null);
  const [note, setNote] = React.useState('');
  const [photoUri, setPhotoUri] = React.useState<string | null>(null);
  const [labelIds, setLabelIds] = React.useState<string[]>([]);

  // Load the saved entry (or a blank form) whenever the selected day changes.
  const hydratedDay = React.useRef<DayKey | null>(null);
  React.useEffect(() => {
    if (!entryQuery.isSuccess || hydratedDay.current === day) return;

    const entry = entryQuery.data;
    hydratedDay.current = day;
    setMood(entry?.mood ?? null);
    setNote(entry?.note ?? '');
    setPhotoUri(entry?.photoUri ?? null);
    setLabelIds(entry?.labelIds ?? []);
    saveEntry.reset();
  }, [day, entryQuery.isSuccess, entryQuery.data, saveEntry]);

  const entry = entryQuery.data;
  const labels = labelsQuery.data ?? [];
  const isHydrated = hydratedDay.current === day;

  async function pickFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync(PHOTO_OPTIONS);

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permiso de cámara',
        'Activa el acceso a la cámara en los ajustes del sistema para tomar fotos.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync(PHOTO_OPTIONS);

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  function toggleLabel(id: string) {
    setLabelIds((current) =>
      current.includes(id) ? current.filter((labelId) => labelId !== id) : [...current, id]
    );
  }

  function handleSave() {
    const parsed = journalEntryFormSchema.safeParse({ date: day, mood, note, photoUri, labelIds });

    if (!parsed.success) return;

    saveEntry.mutate(parsed.data, { onSuccess: () => router.back() });
  }

  function confirmDelete() {
    if (!entry) return;

    Alert.alert('Eliminar entrada', '¿Seguro que quieres eliminar la entrada de este día?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => deleteEntry.mutate(entry, { onSuccess: () => router.back() }),
      },
    ]);
  }

  const canSave = mood !== null && isHydrated && !saveEntry.isPending;

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{
          headerRight: () =>
            entry ? (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                accessibilityLabel="Eliminar entrada"
                onPress={confirmDelete}>
                <Icon as={Trash2Icon} className="text-destructive size-5" />
              </Button>
            ) : null,
        }}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 20 }}
        keyboardShouldPersistTaps="handled">
        <DatePicker value={day} onChange={setDay} markedDays={daysQuery.data ?? []} />

        <View className="gap-2">
          <Text className="text-sm font-semibold">¿Cómo te sentiste hoy?</Text>
          <MoodPicker value={mood} onChange={setMood} />
        </View>

        <Textarea
          value={note}
          onChangeText={setNote}
          placeholder="¿Qué pasó en el día?"
          numberOfLines={6}
        />

        <View>
          {photoUri ? (
            <View>
              <Image
                source={{ uri: photoUri }}
                contentFit="cover"
                style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 8 }}
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 rounded-full"
                accessibilityLabel="Quitar foto"
                onPress={() => setPhotoUri(null)}>
                <Icon as={XIcon} className="size-4" />
              </Button>
            </View>
          ) : (
            <View className="flex-row gap-3">
              {[
                { label: 'Tomar foto', icon: CameraIcon, onPress: takePhoto },
                { label: 'Elegir de galería', icon: ImagePlusIcon, onPress: pickFromLibrary },
              ].map((option) => (
                <Pressable
                  key={option.label}
                  onPress={option.onPress}
                  accessibilityRole="button"
                  className="border-border bg-card h-32 flex-1 items-center justify-center gap-2 rounded-lg border border-dashed active:opacity-70">
                  <Icon as={option.icon} className="text-muted-foreground size-7" />
                  <Text className="text-muted-foreground text-sm">{option.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold">Etiquetas</Text>
            <Button variant="ghost" size="sm" onPress={() => router.push('/journal/labels')}>
              <Icon as={SettingsIcon} className="size-4" />
              <Text variant="small">Gestionar</Text>
            </Button>
          </View>

          {labels.length === 0 ? (
            <Text className="text-muted-foreground text-sm">
              Aún no tienes etiquetas. Créalas desde “Gestionar”.
            </Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {labels.map((label) => (
                <LabelChip
                  key={label.id}
                  label={label}
                  selected={labelIds.includes(label.id)}
                  onPress={() => toggleLabel(label.id)}
                />
              ))}
            </View>
          )}
        </View>

        {saveEntry.isError ? (
          <Text className="text-destructive text-xs">
            No se pudo guardar la entrada. Inténtalo de nuevo.
          </Text>
        ) : null}

        <Button size="lg" disabled={!canSave} onPress={handleSave}>
          <Text>{saveEntry.isPending ? 'Guardando…' : 'Guardar'}</Text>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
