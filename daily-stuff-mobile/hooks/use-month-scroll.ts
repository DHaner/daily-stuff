import { toMonthKey, todayKey, type DayKey, type MonthKey } from '@/lib/date';
import type { FlashListRef, ViewToken } from '@shopify/flash-list';
import * as React from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/** After jumping to a month, scroll-driven updates are ignored while the list is still moving. */
const JUMP_LOCK_MS = 700;

/** Scroll distance (px) past which the "Ir a hoy" button appears. */
const SHOW_TOP_OFFSET = 800;

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 10 };

/**
 * Keeps the header month in sync with a newest-first list: scrolling moves it to the month of
 * the topmost visible row, and picking a month scrolls the list to that month's first row.
 * `rows` must be sorted newest first; `track: false` pauses the sync (e.g. a summary mode
 * whose rows are not days), leaving the month fully controlled by `goToMonth`.
 */
export function useMonthScroll<T extends { date: DayKey }>(rows: T[], track = true) {
  const listRef = React.useRef<FlashListRef<T>>(null);
  const lockedUntil = React.useRef(0);
  const [selected, setSelected] = React.useState<MonthKey | null>(null);
  const [showTop, setShowTop] = React.useState(false);

  const { months, firstIndexByMonth } = React.useMemo(() => {
    const firstIndex = new Map<MonthKey, number>();

    rows.forEach((row, index) => {
      const month = toMonthKey(row.date);

      if (!firstIndex.has(month)) firstIndex.set(month, index);
    });

    return { months: [...firstIndex.keys()], firstIndexByMonth: firstIndex };
  }, [rows]);

  // Until the user scrolls or picks, show the newest month; a stale pick falls back to it too.
  const month =
    selected && (months.includes(selected) || !track)
      ? selected
      : (months[0] ?? toMonthKey(todayKey()));

  const goToMonth = React.useCallback(
    (next: MonthKey) => {
      setSelected(next);

      if (!track) return;

      lockedUntil.current = Date.now() + JUMP_LOCK_MS;
      listRef.current?.scrollToIndex({ index: firstIndexByMonth.get(next) ?? 0, animated: true });
    },
    [firstIndexByMonth, track]
  );

  const onScroll = React.useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setShowTop(event.nativeEvent.contentOffset.y > SHOW_TOP_OFFSET);
  }, []);

  /** Back to the newest record, and the header back to the newest month. */
  const scrollToTop = React.useCallback(() => {
    lockedUntil.current = Date.now() + JUMP_LOCK_MS;
    setSelected(null);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const onViewableItemsChanged = React.useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<T>[] }) => {
      if (!track || Date.now() < lockedUntil.current) return;

      const top = viewableItems.find((token) => token.item)?.item;

      if (top) setSelected(toMonthKey(top.date));
    },
    [track]
  );

  return {
    listRef,
    month,
    months,
    goToMonth,
    showTop,
    onScroll,
    scrollToTop,
    onViewableItemsChanged,
    viewabilityConfig: VIEWABILITY_CONFIG,
  };
}
