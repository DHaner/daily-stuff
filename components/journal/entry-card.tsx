import { LabelChip } from '@/components/journal/label-chip';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatDayLabel } from '@/lib/date';
import { getMood } from '@/lib/journal-moods';
import type { JournalEntry, JournalLabel } from '@/lib/schemas/journal';
import { Image } from 'expo-image';
import { ChevronRightIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type EntryCardProps = {
  entry: JournalEntry;
  /** Labels resolved from `entry.labelIds`, in display order. */
  labels: JournalLabel[];
  onPress: () => void;
};

export function EntryCard({ entry, labels, onPress }: EntryCardProps) {
  const mood = getMood(entry.mood);

  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="active:opacity-70">
      <Card className="gap-3 px-4 py-3">
        <View className="flex-row items-center gap-3">
          <View
            className="size-11 items-center justify-center rounded-full"
            style={{ backgroundColor: `${mood.color}22` }}>
            <Icon as={mood.icon} className="size-6" color={mood.color} />
          </View>

          <View className="flex-1 gap-0.5">
            <Text className="text-base font-semibold capitalize" numberOfLines={1}>
              {formatDayLabel(entry.date)}
            </Text>
            <Text className="text-xs font-medium" style={{ color: mood.color }}>
              {mood.label}
            </Text>
          </View>

          <Icon as={ChevronRightIcon} className="text-muted-foreground size-4" />
        </View>

        {entry.photoUri ? (
          <Image
            source={{ uri: entry.photoUri }}
            contentFit="cover"
            style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 8 }}
          />
        ) : null}

        {entry.note.length > 0 ? (
          <Text className="text-sm" numberOfLines={4}>
            {entry.note}
          </Text>
        ) : null}

        {labels.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {labels.map((label) => (
              <LabelChip key={label.id} label={label} />
            ))}
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}
