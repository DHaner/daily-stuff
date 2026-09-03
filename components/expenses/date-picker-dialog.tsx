import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatDayLabel, todayKey, type DayKey } from '@/lib/date';
import { PALETTE } from '@/lib/theme';
import { CalendarIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
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

type DatePickerDialogProps = {
  value: DayKey;
  onChange: (day: DayKey) => void;
  /** Days that already have expenses; rendered with a dot. */
  markedDays?: DayKey[];
};

export function DatePickerDialog({ value, onChange, markedDays = [] }: DatePickerDialogProps) {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="w-full justify-between gap-3">
          <View className="flex-row items-center gap-2">
            <Icon as={CalendarIcon} className="size-5" />
            <Text className="font-semibold capitalize">{formatDayLabel(value)}</Text>
          </View>
        </Button>
      </DialogTrigger>
      <DialogContent className="p-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecciona una fecha</DialogTitle>
        </DialogHeader>
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
        <Button variant="secondary" onPress={() => handleDayPress({ dateString: todayKey() })}>
          <Text>Ir a hoy</Text>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
