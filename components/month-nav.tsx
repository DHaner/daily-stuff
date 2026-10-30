import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatMonthLabel, type MonthKey } from '@/lib/date';
import { PALETTE } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react-native';
import * as React from 'react';
import { FlatList, Modal, Pressable, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useUniwind } from 'uniwind';

const ITEM_HEIGHT = 48;
const EDGE_HEIGHT = 40;
const PICKER_HEIGHT = 336;

type MonthNavProps = {
  /** Months that have records, newest first. */
  months: MonthKey[];
  value: MonthKey;
  onChange: (month: MonthKey) => void;
};

/**
 * Header control shared by every dated module: previous / "Mes, Año" / next. The arrows step
 * through the months that have records (left is older); the label opens a scrollable picker.
 */
export function MonthNav({ months, value, onChange }: MonthNavProps) {
  const [open, setOpen] = React.useState(false);
  const index = months.indexOf(value);
  const older = index >= 0 ? months[index + 1] : undefined;
  const newer = index > 0 ? months[index - 1] : undefined;

  return (
    <View className="flex-row items-center">
      <Button
        variant="ghost"
        size="icon"
        className="size-9 rounded-full"
        accessibilityLabel="Mes anterior"
        disabled={!older}
        onPress={() => older && onChange(older)}>
        <Icon as={ChevronLeftIcon} className="size-5" />
      </Button>

      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Elegir mes"
        className="px-1 py-2 active:opacity-70">
        <Text className="text-base font-semibold">{formatMonthLabel(value)}</Text>
      </Pressable>

      <Button
        variant="ghost"
        size="icon"
        className="size-9 rounded-full"
        accessibilityLabel="Mes siguiente"
        disabled={!newer}
        onPress={() => newer && onChange(newer)}>
        <Icon as={ChevronRightIcon} className="size-5" />
      </Button>

      <MonthPicker
        visible={open}
        months={months.length > 0 ? months : [value]}
        value={value}
        onSelect={(month) => {
          setOpen(false);
          onChange(month);
        }}
        onClose={() => setOpen(false)}
      />
    </View>
  );
}

type MonthPickerProps = {
  visible: boolean;
  months: MonthKey[];
  value: MonthKey;
  onSelect: (month: MonthKey) => void;
  onClose: () => void;
};

function MonthPicker({ visible, months, value, onSelect, onClose }: MonthPickerProps) {
  const { theme } = useUniwind();
  const cardColor = PALETTE[theme ?? 'light'].card;
  const selectedIndex = Math.max(0, months.indexOf(value));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/50 p-6" onPress={onClose}>
        <Pressable onPress={(event) => event.stopPropagation()} className="w-full max-w-xs">
          <Card className="overflow-hidden py-0" style={{ height: PICKER_HEIGHT }}>
            <FlatList
              data={months}
              keyExtractor={(month) => month}
              // Open with the current month roughly centered.
              initialScrollIndex={Math.max(0, selectedIndex - 3)}
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: EDGE_HEIGHT + ITEM_HEIGHT * index,
                index,
              })}
              ListHeaderComponent={<View style={{ height: EDGE_HEIGHT }} />}
              ListFooterComponent={<View style={{ height: EDGE_HEIGHT }} />}
              showsVerticalScrollIndicator={false}
              extraData={value}
              renderItem={({ item }) => {
                const isSelected = item === value;

                return (
                  <Pressable
                    onPress={() => onSelect(item)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={{ height: ITEM_HEIGHT }}
                    className={cn(
                      'mx-3 items-center justify-center rounded-lg active:opacity-70',
                      isSelected && 'bg-primary'
                    )}>
                    <Text
                      className={cn(
                        'text-base',
                        isSelected ? 'text-primary-foreground font-semibold' : 'text-foreground'
                      )}>
                      {formatMonthLabel(item)}
                    </Text>
                  </Pressable>
                );
              }}
            />

            <FadeEdge position="top" color={cardColor} />
            <FadeEdge position="bottom" color={cardColor} />
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Card-colored gradient that fades the scrolling list out at the top or bottom of the modal. */
function FadeEdge({ position, color }: { position: 'top' | 'bottom'; color: string }) {
  const id = `fade-${position}`;
  const [from, to] = position === 'top' ? [1, 0] : [0, 1];

  return (
    <View
      pointerEvents="none"
      className="absolute inset-x-0"
      style={[{ height: EDGE_HEIGHT }, position === 'top' ? { top: 0 } : { bottom: 0 }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={from} />
            <Stop offset="1" stopColor={color} stopOpacity={to} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
