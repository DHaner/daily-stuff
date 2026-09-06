import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isToday,
  isYesterday,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import { es } from 'date-fns/locale';

/** `yyyy-MM-dd` — the canonical day key stored in SQLite and used as a query key. */
export type DayKey = string;

/** Granularity for the home screen's date filter. */
export type Period = 'dia' | 'semana' | 'mes' | 'anio';

export type DateRange = { start: DayKey; end: DayKey };

export function toDayKey(date: Date): DayKey {
  return format(date, 'yyyy-MM-dd');
}

export function fromDayKey(day: DayKey): Date {
  return parseISO(day);
}

export function todayKey(): DayKey {
  return toDayKey(new Date());
}

export function shiftDayKey(day: DayKey, amount: number): DayKey {
  return toDayKey(addDays(fromDayKey(day), amount));
}

/** The `[start, end]` `DayKey` range that contains `day` for the given period. */
export function getPeriodRange(day: DayKey, period: Period): DateRange {
  const date = fromDayKey(day);

  switch (period) {
    case 'dia':
      return { start: day, end: day };
    case 'semana':
      return {
        start: toDayKey(startOfWeek(date, { weekStartsOn: 1 })),
        end: toDayKey(endOfWeek(date, { weekStartsOn: 1 })),
      };
    case 'mes':
      return { start: toDayKey(startOfMonth(date)), end: toDayKey(endOfMonth(date)) };
    case 'anio':
      return { start: toDayKey(startOfYear(date)), end: toDayKey(endOfYear(date)) };
  }
}

/** Whether `day` falls within the current (today-containing) instance of `period`. */
export function isCurrentPeriod(day: DayKey, period: Period): boolean {
  const range = getPeriodRange(day, period);
  const todayRange = getPeriodRange(todayKey(), period);
  return range.start === todayRange.start && range.end === todayRange.end;
}

/** Moves `day` forward/back by one whole period (e.g. `amount: 1` on `'mes'` goes to next month). */
export function shiftPeriod(day: DayKey, period: Period, amount: number): DayKey {
  const date = fromDayKey(day);

  switch (period) {
    case 'dia':
      return toDayKey(addDays(date, amount));
    case 'semana':
      return toDayKey(addWeeks(date, amount));
    case 'mes':
      return toDayKey(addMonths(date, amount));
    case 'anio':
      return toDayKey(addYears(date, amount));
  }
}

/** e.g. "1 de septiembre" / "1 - 7 de septiembre" / "Septiembre 2026" / "2026". */
export function formatPeriodLabel(day: DayKey, period: Period): string {
  if (period === 'dia') {
    return formatDayCompact(day);
  }

  const { start, end } = getPeriodRange(day, period);

  if (period === 'semana') {
    const startDate = fromDayKey(start);
    const endDate = fromDayKey(end);
    const sameMonth = format(startDate, 'MM') === format(endDate, 'MM');
    const startLabel = format(startDate, sameMonth ? 'd' : "d 'de' MMM", { locale: es });
    const endLabel = format(endDate, "d 'de' MMM", { locale: es });
    return `${capitalize(startLabel)} - ${endLabel}`;
  }

  if (period === 'mes') {
    return capitalize(format(fromDayKey(start), "MMMM 'de' yyyy", { locale: es }));
  }

  return format(fromDayKey(start), 'yyyy');
}

/** e.g. "Hoy · 1 de septiembre" / "lunes, 1 de septiembre de 2026". */
export function formatDayLabel(day: DayKey) {
  const date = fromDayKey(day);

  if (isToday(date)) {
    return `Hoy · ${format(date, "d 'de' MMMM", { locale: es })}`;
  }

  if (isYesterday(date)) {
    return `Ayer · ${format(date, "d 'de' MMMM", { locale: es })}`;
  }

  return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
}

export function formatDayShort(day: DayKey) {
  return format(fromDayKey(day), "d 'de' MMM yyyy", { locale: es });
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** e.g. "Mar. 1 Sep, 2026". */
export function formatDayCompact(day: DayKey) {
  const date = fromDayKey(day);
  const weekday = format(date, 'EEE', { locale: es }).replace(/\.$/, '');
  const month = format(date, 'MMM', { locale: es }).replace(/\.$/, '');
  const dayNumber = format(date, 'd', { locale: es });
  const year = format(date, 'yyyy', { locale: es });

  return `${capitalize(weekday)}. ${dayNumber} ${capitalize(month)}, ${year}`;
}
