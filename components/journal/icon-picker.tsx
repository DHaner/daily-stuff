import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import {
  ALL_ICONS,
  ICON_CATEGORIES,
  getLabelIcon,
  matchesIconQuery,
  type IconEntry,
} from '@/lib/journal-icons';
import { cn } from '@/lib/utils';
import { FlashList } from '@shopify/flash-list';
import { SearchXIcon, XIcon } from 'lucide-react-native';
import * as React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLUMNS = 5;
const ALL_CATEGORY_ID = 'todos';

/** Curated categories only store names, so give them the same shape as the full catalog. */
const ENTRIES_BY_CATEGORY: Record<string, IconEntry[]> = Object.fromEntries([
  [ALL_CATEGORY_ID, ALL_ICONS],
  ...ICON_CATEGORIES.map((category) => [
    category.id,
    category.names.map((name) => ({ name, searchKey: name.toLowerCase() })),
  ]),
]);

const CATEGORY_CHIPS = [{ id: ALL_CATEGORY_ID, label: 'Todos' }, ...ICON_CATEGORIES];

type IconPickerProps = {
  visible: boolean;
  /** Currently chosen icon name, highlighted in the grid. */
  value: string | null;
  onSelect: (name: string) => void;
  onClose: () => void;
};

/**
 * Full-screen icon chooser: a grid grouped by category with a search bar. While there is
 * a search query it looks through the whole Lucide set, ignoring the selected category.
 */
export function IconPicker({ visible, value, onSelect, onClose }: IconPickerProps) {
  const [query, setQuery] = React.useState('');
  const [categoryId, setCategoryId] = React.useState(ICON_CATEGORIES[0].id);

  const isSearching = query.trim().length > 0;

  const entries = React.useMemo(() => {
    if (isSearching) {
      return ALL_ICONS.filter((entry) => matchesIconQuery(entry, query));
    }

    return ENTRIES_BY_CATEGORY[categoryId] ?? ALL_ICONS;
  }, [categoryId, isSearching, query]);

  const renderItem = React.useCallback(
    ({ item }: { item: IconEntry }) => {
      const isSelected = item.name === value;

      return (
        <View className="items-center p-1">
          <Pressable
            onPress={() => onSelect(item.name)}
            accessibilityRole="button"
            accessibilityLabel={item.name}
            accessibilityState={{ selected: isSelected }}
            className={cn(
              'size-14 items-center justify-center rounded-lg border active:opacity-70',
              isSelected ? 'bg-primary border-transparent' : 'border-border bg-card'
            )}>
            <Icon
              as={getLabelIcon(item.name)}
              className={cn('size-6', isSelected ? 'text-primary-foreground' : 'text-foreground')}
            />
          </Pressable>
        </View>
      );
    },
    [onSelect, value]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View className="bg-background flex-1">
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <View className="flex-row items-center justify-between px-4 py-3">
            <Text className="text-lg font-semibold">Elegir icono</Text>
            <Button variant="ghost" size="icon" accessibilityLabel="Cerrar" onPress={onClose}>
              <Icon as={XIcon} className="size-5" />
            </Button>
          </View>

          <View className="px-4">
            <Input
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar icono (en inglés, ej. heart)"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              returnKeyType="search"
            />
          </View>

          <View className="py-3">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerClassName="gap-2 px-4">
              {CATEGORY_CHIPS.map((chip) => {
                const isActive = !isSearching && chip.id === categoryId;

                return (
                  <Pressable
                    key={chip.id}
                    onPress={() => {
                      setQuery('');
                      setCategoryId(chip.id);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    className={cn(
                      'rounded-full border px-3 py-1.5 active:opacity-80',
                      isActive ? 'bg-primary border-transparent' : 'border-border bg-card'
                    )}>
                    <Text
                      className={cn(
                        'text-sm',
                        isActive ? 'text-primary-foreground font-semibold' : 'text-muted-foreground'
                      )}>
                      {chip.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <FlashList
            data={entries}
            keyExtractor={(entry) => entry.name}
            numColumns={COLUMNS}
            renderItem={renderItem}
            extraData={value}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}
            ListEmptyComponent={
              <View className="items-center gap-3 px-6 py-12">
                <Icon as={SearchXIcon} className="text-muted-foreground size-10" />
                <Text className="text-muted-foreground text-center">
                  Ningún icono coincide con la búsqueda.
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}
