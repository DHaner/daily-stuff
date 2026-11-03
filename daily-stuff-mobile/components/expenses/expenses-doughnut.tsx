import { Text } from '@/components/ui/text';
import type { CategorySlice } from '@/lib/breakdown';
import { formatCurrencyCompact } from '@/lib/format';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const CHART_HEIGHT = 170;
const HORIZONTAL_PADDING = 32;

/** react-native-chart-kit needs it even though a pie chart never uses the gradient. */
const CHART_CONFIG = {
  backgroundColor: 'transparent',
  backgroundGradientFrom: 'transparent',
  backgroundGradientTo: 'transparent',
  backgroundGradientFromOpacity: 0,
  backgroundGradientToOpacity: 0,
  color: () => 'rgba(0, 0, 0, 1)',
};

type ExpensesDoughnutProps = {
  slices: CategorySlice[];
  total: number;
  className?: string;
};

/**
 * `PieChart` from react-native-chart-kit has no inner-radius prop, so the doughnut
 * hole is a card-coloured circle laid over the middle of the pie.
 */
export function ExpensesDoughnut({ slices, total, className }: ExpensesDoughnutProps) {
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.max(windowWidth - HORIZONTAL_PADDING * 2, 240);
  const outerRadius = CHART_HEIGHT / 2.5;
  const holeRadius = outerRadius * 0.64;
  const hasData = slices.some((slice) => slice.percentage > 0);

  const data = React.useMemo(
    () =>
      slices.map((slice) => ({
        name: slice.label,
        percentage: slice.percentage,
        color: slice.color,
        legendFontColor: '#000000',
        legendFontSize: 12,
      })),
    [slices]
  );

  return (
    <View className={cn('items-center', className)}>
      <View style={{ width, height: CHART_HEIGHT }}>
        {hasData ? (
          <PieChart
            data={data}
            width={width}
            height={CHART_HEIGHT}
            accessor="percentage"
            backgroundColor="transparent"
            // Shifts the pie centre from width/4 to width/2.
            paddingLeft={String(width / 4)}
            hasLegend={false}
            chartConfig={CHART_CONFIG}
          />
        ) : (
          <View
            className="border-muted absolute rounded-full border-[16px]"
            style={{
              width: outerRadius * 2,
              height: outerRadius * 2,
              left: width / 2 - outerRadius,
              top: CHART_HEIGHT / 2 - outerRadius,
            }}
          />
        )}

        <View
          pointerEvents="none"
          className="bg-card absolute items-center justify-center rounded-full"
          style={{
            width: holeRadius * 2,
            height: holeRadius * 2,
            left: width / 2 - holeRadius,
            top: CHART_HEIGHT / 2 - holeRadius,
          }}>
          <Text
            className="text-foreground text-2xl font-bold"
            numberOfLines={1}
            adjustsFontSizeToFit>
            {formatCurrencyCompact(total)}
          </Text>
        </View>
      </View>

      <View className="mt-1 w-full flex-row flex-wrap justify-center gap-x-4 gap-y-2">
        {slices.map((slice) => (
          <View key={slice.categoryId} className="flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
            <Text className="text-muted-foreground text-xs">
              {slice.label} · {formatCurrencyCompact(slice.amount)} ({Math.round(slice.percentage)}
              %)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
