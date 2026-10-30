import { EntryCard } from '@/components/journal/entry-card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ThemeToggle } from '@/components/theme-toggle';
import { useJournalEntriesByRange, useJournalLabels } from '@/hooks/use-journal';
import {
  formatPeriodLabel,
  getPeriodRange,
  isCurrentPeriod,
  shiftPeriod,
  todayKey,
} from '@/lib/date';
import type { JournalEntry } from '@/lib/schemas/journal';
import { FlashList } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import {
  BookHeartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TagsIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function JournalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [month, setMonth] = React.useState(todayKey);

  const range = React.useMemo(() => getPeriodRange(month, 'mes'), [month]);
  const entriesQuery = useJournalEntriesByRange(range.start, range.end);
  const labelsQuery = useJournalLabels();
  const isCurrentMonth = isCurrentPeriod(month, 'mes');

  const labelsById = React.useMemo(
    () => new Map((labelsQuery.data ?? []).map((label) => [label.id, label])),
    [labelsQuery.data]
  );

  const openEntry = React.useCallback(
    (date: string) => router.push({ pathname: '/journal/[date]', params: { date } }),
    [router]
  );

  const renderItem = React.useCallback(
    ({ item }: { item: JournalEntry }) => (
      <EntryCard
        entry={item}
        labels={item.labelIds.flatMap((id) => labelsById.get(id) ?? [])}
        onPress={() => openEntry(item.date)}
      />
    ),
    [labelsById, openEntry]
  );

  return (
    <View className="bg-background flex-1">
      <Stack.Screen
        options={{
          headerRight: () => (
            <View className="flex-row items-center">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                accessibilityLabel="Gestionar etiquetas"
                onPress={() => router.push('/journal/labels')}>
                <Icon as={TagsIcon} className="size-5" />
              </Button>
              <ThemeToggle />
            </View>
          ),
        }}
      />

      <FlashList
        data={entriesQuery.data ?? []}
        keyExtractor={(entry) => entry.id}
        renderItem={renderItem}
        extraData={labelsById}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 96,
        }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        refreshControl={
          <RefreshControl
            refreshing={entriesQuery.isRefetching}
            onRefresh={() => entriesQuery.refetch()}
          />
        }
        ListHeaderComponent={
          <View className="mb-4 w-full flex-row items-center justify-between gap-2">
            <Button
              variant="outline"
              size="icon"
              accessibilityLabel="Mes anterior"
              onPress={() => setMonth((current) => shiftPeriod(current, 'mes', -1))}>
              <Icon as={ChevronLeftIcon} className="size-5" />
            </Button>

            <Text className="flex-1 text-center text-base font-semibold">
              {formatPeriodLabel(month, 'mes')}
            </Text>

            {/* Keep the slot so the title stays centered when there is no next month to visit. */}
            {isCurrentMonth ? (
              <View className="size-10 sm:size-9" />
            ) : (
              <Button
                variant="outline"
                size="icon"
                accessibilityLabel="Mes siguiente"
                onPress={() => setMonth((current) => shiftPeriod(current, 'mes', 1))}>
                <Icon as={ChevronRightIcon} className="size-5" />
              </Button>
            )}
          </View>
        }
        ListEmptyComponent={
          entriesQuery.isPending ? (
            <View className="items-center py-12">
              <ActivityIndicator />
            </View>
          ) : (
            <View className="items-center gap-3 px-6 py-12">
              <Icon as={BookHeartIcon} className="text-muted-foreground size-10" />
              <Text className="text-muted-foreground text-center">
                Sin entradas del diario en este mes.
              </Text>
            </View>
          )
        }
      />

      <View className="absolute right-5" style={{ bottom: insets.bottom + 24 }}>
        <Button
          size="icon"
          className="size-16 rounded-full shadow-lg shadow-black/25"
          accessibilityLabel="Escribir la entrada de hoy"
          onPress={() => openEntry(todayKey())}>
          <Icon as={PlusIcon} className="size-7" />
        </Button>
      </View>
    </View>
  );
}
