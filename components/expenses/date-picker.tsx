import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  formatDayCompact,
  formatPeriodLabel,
  fromDayKey,
  getPeriodRange,
  toDayKey,
  todayKey,
  type DayKey,
  type Period,
} from '@/lib/date';
import { PALETTE } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { addMonths, addYears, eachWeekOfInterval, endOfMonth, format, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react-native';
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

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Fixed height for the picker body so the modal doesn't resize (and the "Ir a hoy"
 * button doesn't jump around) as months with 5 vs. 6 week-rows, or week/month/year
 * lists of varying length, are shown.
 */
const PICKER_HEIGHT = 350;

type DatePickerProps = {
  value: DayKey;
  onChange: (day: DayKey) => void;
  /** Days that already have expenses; rendered with a dot. */
  markedDays?: DayKey[];
  /**
   * Granularity of `value`. Defaults to `'dia'` (a plain day calendar). For
   * `'semana'`/`'mes'`/`'anio'` the picker shows weeks/months/years to choose from
   * instead, and the trigger button shows the period label.
   */
  period?: Period;
};

export function DatePicker({ value, onChange, markedDays = [], period = 'dia' }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [cursor, setCursor] = React.useState(() => fromDayKey(value));
  const { theme } = useUniwind();
  const palette = PALETTE[theme ?? 'light'];

  // Re-anchor browsing (month/year page) to the current selection each time the picker opens.
  React.useEffect(() => {
    if (open) setCursor(fromDayKey(value));
  }, [open, value]);

  function commit(day: DayKey) {
    onChange(day);
    setOpen(false);
  }

  function hasMarkedDayIn(start: DayKey, end: DayKey) {
    return markedDays.some((day) => day >= start && day <= end);
  }

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

  function renderDayPicker() {
    return (
      <Calendar
        key={theme}
        current={value}
        onDayPress={(day: { dateString: string }) => commit(day.dateString)}
        markedDates={markedDates}
        firstDay={1}
        enableSwipeMonths
        theme={calendarTheme}
        style={{ borderRadius: 12 }}
      />
    );
  }

  function renderWeekPicker() {
    const weekStarts = eachWeekOfInterval(
      { start: startOfMonth(cursor), end: endOfMonth(cursor) },
      { weekStartsOn: 1 }
    );
    const selectedRange = getPeriodRange(value, 'semana');

    return (
      <View className="gap-3">
        <PagerHeader
          label={capitalize(format(cursor, "MMMM 'de' yyyy", { locale: es }))}
          onPrev={() => setCursor((current) => addMonths(current, -1))}
          onNext={() => setCursor((current) => addMonths(current, 1))}
        />

        <View className="gap-2">
          {weekStarts.map((weekStart) => {
            const start = toDayKey(weekStart);
            const { end } = getPeriodRange(start, 'semana');
            const isSelected = start === selectedRange.start;

            return (
              <Button
                key={start}
                variant={isSelected ? 'default' : 'outline'}
                className="w-full justify-between"
                onPress={() => commit(start)}>
                <Text className={cn(isSelected && 'text-primary-foreground')}>
                  {formatPeriodLabel(start, 'semana')}
                </Text>
                {!isSelected && hasMarkedDayIn(start, end) ? (
                  <View className="bg-muted-foreground size-1.5 rounded-full" />
                ) : null}
              </Button>
            );
          })}
        </View>
      </View>
    );
  }

  function renderMonthPicker() {
    const year = cursor.getFullYear();
    const selectedDate = fromDayKey(value);
    const isSelectedYear = selectedDate.getFullYear() === year;

    return (
      <View className="gap-3">
        <PagerHeader
          label={String(year)}
          onPrev={() => setCursor((current) => addYears(current, -1))}
          onNext={() => setCursor((current) => addYears(current, 1))}
        />

        <View className="flex-row flex-wrap gap-2">
          {Array.from({ length: 12 }, (_, monthIndex) => {
            const monthDate = new Date(year, monthIndex, 1);
            const dayKey = toDayKey(monthDate);
            const { start, end } = getPeriodRange(dayKey, 'mes');
            const isSelected = isSelectedYear && selectedDate.getMonth() === monthIndex;
            const label = capitalize(format(monthDate, 'MMM', { locale: es }).replace(/\.$/, ''));

            return (
              <Button
                key={monthIndex}
                variant={isSelected ? 'default' : 'outline'}
                className="basis-[30%] flex-row items-center justify-center gap-1.5"
                onPress={() => commit(dayKey)}>
                <Text className={cn(isSelected && 'text-primary-foreground')}>{label}</Text>
                {!isSelected && hasMarkedDayIn(start, end) ? (
                  <View className="bg-muted-foreground size-1.5 rounded-full" />
                ) : null}
              </Button>
            );
          })}
        </View>
      </View>
    );
  }

  function renderYearPicker() {
    const pageStart = cursor.getFullYear() - (cursor.getFullYear() % 12);
    const years = Array.from({ length: 12 }, (_, index) => pageStart + index);
    const selectedYear = fromDayKey(value).getFullYear();

    return (
      <View className="gap-3">
        <PagerHeader
          label={`${pageStart} - ${pageStart + 11}`}
          onPrev={() => setCursor((current) => addYears(current, -12))}
          onNext={() => setCursor((current) => addYears(current, 12))}
        />

        <View className="flex-row flex-wrap gap-2">
          {years.map((year) => {
            const dayKey = toDayKey(new Date(year, 0, 1));
            const { start, end } = getPeriodRange(dayKey, 'anio');
            const isSelected = year === selectedYear;

            return (
              <Button
                key={year}
                variant={isSelected ? 'default' : 'outline'}
                className="basis-[30%] flex-row items-center justify-center gap-1.5"
                onPress={() => commit(dayKey)}>
                <Text className={cn(isSelected && 'text-primary-foreground')}>{year}</Text>
                {!isSelected && hasMarkedDayIn(start, end) ? (
                  <View className="bg-muted-foreground size-1.5 rounded-full" />
                ) : null}
              </Button>
            );
          })}
        </View>
      </View>
    );
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
          <Text className="font-semibold capitalize">
            {period === 'dia' ? formatDayCompact(value) : formatPeriodLabel(value, period)}
          </Text>
        </View>
      </Button>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/50 p-6"
          onPress={() => setOpen(false)}>
          <Pressable onPress={(event) => event.stopPropagation()} className="w-full max-w-sm">
            <Card className="gap-4 p-4">
              <View style={{ height: PICKER_HEIGHT }} >
                {period === 'dia'
                  ? renderDayPicker()
                  : period === 'semana'
                    ? renderWeekPicker()
                    : period === 'mes'
                      ? renderMonthPicker()
                      : renderYearPicker()}
              </View>

              <Button variant="secondary" onPress={() => commit(todayKey())}>
                <Text>Ir a hoy</Text>
              </Button>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function PagerHeader({
  label,
  onPrev,
  onNext,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Button variant="ghost" size="icon" accessibilityLabel="Anterior" onPress={onPrev}>
        <Icon as={ChevronLeftIcon} className="size-5" />
      </Button>
      <Text className="font-semibold capitalize">{label}</Text>
      <Button variant="ghost" size="icon" accessibilityLabel="Siguiente" onPress={onNext}>
        <Icon as={ChevronRightIcon} className="size-5" />
      </Button>
    </View>
  );
}
