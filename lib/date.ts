import { format, isToday, isYesterday, parseISO } from 'date-fns';
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
