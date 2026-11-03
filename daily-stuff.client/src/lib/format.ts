const LOCALE = 'es-MX';
const CURRENCY = 'MXN';

const currency = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY });
const compactCurrency = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const formatCurrency = (amount: number) => currency.format(amount);
export const formatCurrencyCompact = (amount: number) => compactCurrency.format(amount);

const pad = (n: number) => String(n).padStart(2, '0');

/** `yyyy-MM-dd` in local time. */
export const toDayKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** `yyyy-MM` in local time. */
export const toMonthKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

export const todayKey = () => toDayKey(new Date());
export const currentMonthKey = () => toMonthKey(new Date());

export function parseDayKey(day: string) {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function parseMonthKey(month: string) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1);
}

export function shiftMonth(month: string, delta: number) {
  const date = parseMonthKey(month);
  date.setMonth(date.getMonth() + delta);
  return toMonthKey(date);
}

/** First and last day (`yyyy-MM-dd`) of a `yyyy-MM` month. */
export function monthRange(month: string) {
  const start = parseMonthKey(month);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  return { from: toDayKey(start), to: toDayKey(end) };
}

const monthLabel = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' });
const monthShort = new Intl.DateTimeFormat(LOCALE, { month: 'short' });
const dayShort = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' });
const dayLong = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const formatMonth = (month: string) => capitalize(monthLabel.format(parseMonthKey(month)));
export const formatMonthShort = (month: string) => capitalize(monthShort.format(parseMonthKey(month)).replace('.', ''));
export const formatDay = (day: string) => dayShort.format(parseDayKey(day));
export const formatDayLong = (day: string) => capitalize(dayLong.format(parseDayKey(day)));
