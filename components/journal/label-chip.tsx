import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { getLabelIcon } from '@/lib/journal-icons';
import type { JournalLabel } from '@/lib/schemas/journal';
import { cn } from '@/lib/utils';
import { Pressable, View } from 'react-native';

type LabelChipProps = {
  label: JournalLabel;
  /** Fills the chip with the label color; only meaningful together with `onPress`. */
  selected?: boolean;
  onPress?: () => void;
};

export function LabelChip({ label, selected = false, onPress }: LabelChipProps) {
  const textColor = selected ? '#ffffff' : label.color;
  const content = (
    <>
      <Icon as={getLabelIcon(label.icon)} className="size-4" color={textColor} />
      <Text
        className={cn('text-sm', selected && 'font-semibold')}
        style={{ color: textColor }}
        numberOfLines={1}>
        {label.name}
      </Text>
    </>
  );
  const className = 'flex-row items-center gap-1.5 rounded-full border px-3 py-1.5';
  const style = {
    backgroundColor: selected ? label.color : `${label.color}1f`,
    borderColor: selected ? label.color : `${label.color}66`,
  };

  if (!onPress) {
    return (
      <View className={className} style={style}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={cn(className, 'active:opacity-80')}
      style={style}>
      {content}
    </Pressable>
  );
}
