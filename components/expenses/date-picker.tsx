import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatDayCompact, todayKey, type DayKey } from '@/lib/date';
import { PALETTE } from '@/lib/theme';
import { CalendarIcon } from 'lucide-react-native';
import * as React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useUniwind } from 'uniwind';

LocaleConfig.locales.es = {
  monthNames: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ],
  monthNamesShort: [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

type DatePickerProps = {
  value: DayKey;
  onChange: (day: DayKey) => void;
  /** Days that already have expenses; rendered with a dot. */
  markedDays?: DayKey[];
};

export function DatePicker({ value, onChange, markedDays = [] }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const { theme } = useUniwind();
  const palette = PALETTE[theme ?? 'light'];

  const markedDates = React.useMemo(() => {
    const marks: Record<string, object> = {};

    for (const day of markedDays) {
      marks[day] = { marked: true, dotColor: palette.mutedForeground };
    }

    marks[value] = {
      ...marks[value],
      selected: true,
      selectedColor: palette.primary,
      selectedTextColor: palette.primaryForeground,
    };

    return marks;
  }, [markedDays, value, palette]);

  const calendarTheme = React.useMemo(
    () => ({
      calendarBackground: palette.card,
      textSectionTitleColor: palette.mutedForeground,
      dayTextColor: palette.foreground,
      monthTextColor: palette.foreground,
      todayTextColor: '#0ea5e9',
      textDisabledColor: palette.border,
      arrowColor: palette.foreground,
      selectedDayBackgroundColor: palette.primary,
      selectedDayTextColor: palette.primaryForeground,
      textDayFontWeight: '500' as const,
      textMonthFontWeight: '700' as const,
    }),
    [palette]
  );

  function handleDayPress(day: { dateString: string }) {
    onChange(day.dateString);
    setOpen(false);
  }

  return (
    <View>
      <Button
        variant="outline"
        size="lg"
        className="w-full justify-between gap-3"
        onPress={() => setOpen(true)}>
        <View className="flex-row items-center gap-2">
          <Icon as={CalendarIcon} className="size-5" />
          <Text className="font-semibold capitalize">{formatDayCompact(value)}</Text>
        </View>
      </Button>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/50 p-6"
          onPress={() => setOpen(false)}>
          <Pressable onPress={(event) => event.stopPropagation()} className="w-full max-w-sm">
            <Card className="gap-4 p-4">
              <Calendar
                key={theme}
                current={value}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                firstDay={1}
                enableSwipeMonths
                theme={calendarTheme}
                style={{ borderRadius: 12 }}
              />
              <Button
                variant="secondary"
                onPress={() => handleDayPress({ dateString: todayKey() })}>
                <Text>Ir a hoy</Text>
              </Button>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
