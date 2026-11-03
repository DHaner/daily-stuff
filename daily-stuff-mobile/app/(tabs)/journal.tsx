import { EntryCard } from '@/components/journal/entry-card';
import { GoToTodayButton } from '@/components/go-to-today-button';
import { MonthNav } from '@/components/month-nav';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ProfileButton } from '@/components/profile-button';
import { useJournalEntriesByRange, useJournalLabels } from '@/hooks/use-journal';
import { useMonthScroll } from '@/hooks/use-month-scroll';
import { ALL_TIME, todayKey } from '@/lib/date';
import type { JournalEntry } from '@/lib/schemas/journal';
import { FlashList } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import { BookHeartIcon, PlusIcon } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function JournalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const entriesQuery = useJournalEntriesByRange(ALL_TIME.start, ALL_TIME.end);
  const labelsQuery = useJournalLabels();
  const entries = entriesQuery.data ?? [];
  // One entry per day, and each card is titled with its day, so cards double as day separators.
  const {
    listRef,
    month,
    months,
    goToMonth,
    showTop,
    onScroll,
    scrollToTop,
    onViewableItemsChanged,
    viewabilityConfig,
  } =
    useMonthScroll(entries);

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
          headerTitleAlign: 'center',
          headerTitle: () => <MonthNav months={months} value={month} onChange={goToMonth} />,
          headerLeft: () => <ProfileButton />,
        }}
      />

      <FlashList
        ref={listRef}
        data={entries}
        keyExtractor={(entry) => entry.id}
        renderItem={renderItem}
        extraData={labelsById}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
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
        ListEmptyComponent={
          entriesQuery.isPending ? (
            <View className="items-center py-12">
              <ActivityIndicator />
            </View>
          ) : (
            <View className="items-center gap-3 px-6 py-12">
              <Icon as={BookHeartIcon} className="text-muted-foreground size-10" />
              <Text className="text-muted-foreground text-center">
                Aún no hay entradas del diario.
              </Text>
            </View>
          )
        }
      />

      <GoToTodayButton visible={showTop} onPress={scrollToTop} bottom={insets.bottom + 40} />

      <View className="absolute right-5" style={{ bottom: insets.bottom + 24 }}>
        <Button
          size="icon"
          className="size-16 rounded-full"
          accessibilityLabel="Escribir la entrada de hoy"
          onPress={() => openEntry(todayKey())}>
          <Icon as={PlusIcon} className="size-7" />
        </Button>
      </View>
    </View>
  );
}
