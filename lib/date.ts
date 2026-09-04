import { addDays, format, isToday, isYesterday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/** `yyyy-MM-dd` — the canonical day key stored in SQLite and used as a query key. */
export type DayKey = string;

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
