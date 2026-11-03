import { Icon } from '@/components/ui/icon';
import { RipplePressable } from '@/components/ui/ripple-pressable';
import { Text } from '@/components/ui/text';
import { MOOD_LIST, type MoodId } from '@/lib/journal-moods';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

type MoodPickerProps = {
  value: MoodId | null;
  onChange: (mood: MoodId) => void;
};

/** Five equal-width buttons, best mood first. */
export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <View className="flex-row gap-2">
      {MOOD_LIST.map((mood) => {
        const isSelected = mood.id === value;

        return (
          <RipplePressable
            key={mood.id}
            onPress={() => onChange(mood.id)}
            accessibilityRole="button"
            accessibilityLabel={mood.label}
            accessibilityState={{ selected: isSelected }}
            className={cn(
              'flex-1 items-center gap-1 rounded-lg border py-3',
              isSelected ? 'border-transparent' : 'border-border bg-card'
            )}
            style={
              isSelected
                ? { backgroundColor: `${mood.color}26`, borderColor: mood.color }
                : undefined
            }>
            <Icon as={mood.icon} className="size-7" color={mood.color} />
            <Text
              className={cn('text-xs', isSelected ? 'font-semibold' : 'text-muted-foreground')}
              numberOfLines={1}>
              {mood.label}
            </Text>
          </RipplePressable>
        );
      })}
    </View>
  );
}
