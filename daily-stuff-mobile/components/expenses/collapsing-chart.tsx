import { ExpensesDoughnut } from '@/components/expenses/expenses-doughnut';
import { Text } from '@/components/ui/text';
import type { CategorySlice } from '@/lib/breakdown';
import { formatCurrencyCompact } from '@/lib/format';
import * as React from 'react';
import { ActivityIndicator, Pressable, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

/** Height of the card once it has collapsed into a bar. */
export const COLLAPSED_HEIGHT = 72;
/** Gap between the card and the edges of the pinned area. */
export const CHART_MARGIN = 8;

/** Height of the pinned area when collapsed; the list starts right below it. */
export const COLLAPSED_AREA = COLLAPSED_HEIGHT + CHART_MARGIN * 2;

const EXPANDED_FALLBACK = 330;
/** Scroll distance (px) after a manual expand before the scroll takes control again. */
const OVERRIDE_RELEASE = 24;

type CollapsingChartProps = {
  slices: CategorySlice[];
  total: number;
  isPending?: boolean;
  /** Scroll offset of the list underneath; the card collapses as it scrolls. */
  scrollY: SharedValue<number>;
  /**
   * Manual adjustment from tapping the card, added to the scroll-driven progress: 1 forces it
   * collapsed, a negative value holds it open. Shared with `ChartSpacer`.
   */
  delta: SharedValue<number>;
  /** Total height the pinned area takes when expanded, so the list can leave room for it. */
  onExpandedHeightChange: (height: number) => void;
};

/**
 * The summary doughnut, pinned to the top of the screen. Scrolling the list shrinks it into a
 * thin stacked bar (period, one segment per category, total); scrolling back up restores it.
 * The collapse distance equals the height it loses, so the list content meets the bar exactly.
 */
export function CollapsingChart({
  slices,
  total,
  isPending,
  scrollY,
  delta,
  onExpandedHeightChange,
}: CollapsingChartProps) {
  const expandedHeight = useSharedValue(EXPANDED_FALLBACK);

  function handleLayout(event: LayoutChangeEvent) {
    const height = event.nativeEvent.layout.height;

    expandedHeight.value = height;
    onExpandedHeightChange(height + CHART_MARGIN * 2);
  }

  const anchor = useSharedValue(0);

  /** 0 = fully expanded, 1 = fully collapsed. */
  const progress = useDerivedValue(() => {
    const distance = Math.max(expandedHeight.value - COLLAPSED_HEIGHT, 1);
    const scrolled = Math.min(Math.max(scrollY.value / distance, 0), 1);

    return Math.min(Math.max(scrolled + delta.value, 0), 1);
  });

  // A card held open by hand goes back to following the scroll once the user moves the list.
  useAnimatedReaction(
    () => scrollY.value,
    (y) => {
      if (delta.value < 0 && Math.abs(y - anchor.value) > OVERRIDE_RELEASE) {
        delta.value = withTiming(0, { duration: 200 });
      }
    }
  );

  /** Tap: collapse if it is (mostly) open, otherwise open it, wherever the list is scrolled. */
  function toggle() {
    const distance = Math.max(expandedHeight.value - COLLAPSED_HEIGHT, 1);
    const scrolled = Math.min(Math.max(scrollY.value / distance, 0), 1);

    anchor.value = scrollY.value;
    delta.value = withTiming(progress.value > 0.5 ? -scrolled : 1 - scrolled, { duration: 280 });
  }

  const cardStyle = useAnimatedStyle(() => ({
    height: interpolate(
      progress.value,
      [0, 1],
      [expandedHeight.value, COLLAPSED_HEIGHT],
      Extrapolation.CLAMP
    ),
  }));
  const expandedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.6], [1, 0], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 0.9], Extrapolation.CLAMP) }],
  }));
  const collapsedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.5, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(progress.value, [0.5, 1], [8, 0], Extrapolation.CLAMP) }],
  }));

  const hasData = slices.some((slice) => slice.percentage > 0);

  return (
    <View
      pointerEvents="box-none"
      className="bg-background absolute top-0 right-0 left-0 px-4"
      style={{ paddingVertical: CHART_MARGIN }}>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel="Expandir o contraer la gráfica">
        <Animated.View
          className="bg-card border-border overflow-hidden rounded-xl border"
          style={cardStyle}>
          {/* Natural-size content; measured once, then clipped by the shrinking card. */}
          <Animated.View
            className="absolute top-0 right-0 left-0 items-center py-3"
            onLayout={handleLayout}
            style={expandedStyle}>
            {isPending ? (
              <View className="h-[180px] justify-center">
                <ActivityIndicator />
              </View>
            ) : (
              <ExpensesDoughnut slices={slices} total={total} />
            )}
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            className="absolute right-0 bottom-0 left-0 justify-center gap-2 px-4"
            style={[{ height: COLLAPSED_HEIGHT }, collapsedStyle]}>
            <View className="bg-muted h-2.5 flex-row overflow-hidden rounded-full">
              {hasData
                ? slices.map((slice) => (
                    <View
                      key={slice.categoryId}
                      style={{ flex: slice.percentage, backgroundColor: slice.color }}
                    />
                  ))
                : null}
            </View>
            <Text className="text-center text-lg font-semibold">
              {formatCurrencyCompact(total)}
            </Text>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

/** Empty space at the top of the list that keeps its rows clear of the expanded chart. */
export function ChartSpacer({
  chartHeight,
  delta,
}: {
  chartHeight: number;
  delta: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    height: Math.max(chartHeight - COLLAPSED_AREA, 0) * (1 - Math.min(Math.max(delta.value, 0), 1)),
  }));

  return <Animated.View style={style} />;
}
