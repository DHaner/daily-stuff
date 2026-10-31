import { FormField } from '@/components/expenses/form-field';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatDayCompact, fromDayKey, toDayKey, type DayKey } from '@/lib/date';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import type { LucideIcon } from 'lucide-react-native';
import { CalendarIcon } from 'lucide-react-native';
import * as React from 'react';
import { Platform, View } from 'react-native';

/**
 * Opens the native date picker: a dialog on Android, an inline calendar on iOS.
 * `iosPicker` must be rendered by the caller; it is `null` everywhere else.
 */
function useNativeDatePicker(value: DayKey, onChange: (day: DayKey) => void) {
  const [iosOpen, setIosOpen] = React.useState(false);

  function open() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: fromDayKey(value),
        mode: 'date',
        onValueChange: (_event, date) => onChange(toDayKey(date)),
      });
    } else {
      setIosOpen((current) => !current);
    }
  }

  const iosPicker =
    Platform.OS === 'ios' && iosOpen ? (
      <DateTimePicker
        value={fromDayKey(value)}
        mode="date"
        display="inline"
        locale="es"
        onValueChange={(_event, date) => {
          onChange(toDayKey(date));
          setIosOpen(false);
        }}
      />
    ) : null;

  return { open, iosPicker };
}

type DatePickerProps = {
  value: DayKey;
  onChange: (day: DayKey) => void;
};

/** Outlined button that shows the chosen day and opens the native picker. */
export function DatePicker({ value, onChange }: DatePickerProps) {
  const { open, iosPicker } = useNativeDatePicker(value, onChange);

  return (
    <View>
      <Button variant="outline" size="lg" className="w-full justify-center gap-3" onPress={open}>
        <Icon as={CalendarIcon} className="size-5" />
        <Text className="font-semibold capitalize">{formatDayCompact(value)}</Text>
      </Button>
      {iosPicker}
    </View>
  );
}

type DateFieldProps = DatePickerProps & {
  label: string;
  caption?: string;
  icon?: LucideIcon;
  error?: string;
};

/** A whole form row that opens the picker when pressed, so the ripple spans the full width. */
export function DateField({ value, onChange, label, caption, icon, error }: DateFieldProps) {
  const { open, iosPicker } = useNativeDatePicker(value, onChange);

  return (
    <FormField label={label} caption={caption} icon={icon} error={error} onPress={open}>
      <Text className="h-11 text-base leading-[44px] font-medium capitalize">
        {formatDayCompact(value)}
      </Text>
      {iosPicker}
    </FormField>
  );
}
