import type { DayKey } from '@/lib/date';

export type DayRow<T> =
  | { type: 'header'; date: DayKey }
  | { type: 'item'; date: DayKey; item: T };

/** Inserts a day header before the first item of each day; `items` must already be sorted by day. */
export function groupByDay<T>(items: T[], getDate: (item: T) => DayKey): DayRow<T>[] {
  const rows: DayRow<T>[] = [];
  let lastDate: DayKey | null = null;

  for (const item of items) {
    const date = getDate(item);

    if (date !== lastDate) {
      rows.push({ type: 'header', date });
      lastDate = date;
    }

    rows.push({ type: 'item', date, item });
  }

  return rows;
}
