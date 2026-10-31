import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  DEFAULT_CATEGORY,
  DEFAULT_INCOME_CATEGORY,
  getCategory,
  useCategories,
  type CategoryId,
} from '@/lib/categories';
import type { DayKey } from '@/lib/date';
import { PALETTE } from '@/lib/theme';
import { formatAmountInput, parseAmountInput, sanitizeAmountInput } from '@/lib/format';
import { useCreateExpense } from '@/hooks/use-expenses';
import { useCreateIncome } from '@/hooks/use-incomes';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  ChevronUp,
  Minus,
  Plus,
} from 'lucide-react-native';
import * as React from 'react';
import { Keyboard, Platform, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { useUniwind } from 'uniwind';

type TransactionType = 'gasto' | 'ingreso';

export type QuickAddSheetHandle = {
  present: (day: DayKey) => void;
};

type QuickAddSheetProps = {
  animatedIndex?: SharedValue<number>;
};

const SHEET_COLORS = {
  light: { background: PALETTE.light.card, handle: PALETTE.light.border },
  dark: { background: PALETTE.dark.card, handle: PALETTE.dark.border },
} as const;

export const QuickAddSheet = React.forwardRef<QuickAddSheetHandle, QuickAddSheetProps>(
  function QuickAddSheet({ animatedIndex }, ref) {
    const { theme } = useUniwind();
    const colors = SHEET_COLORS[theme ?? 'light'];

    const sheetRef = React.useRef<BottomSheetModal>(null);
    const amountRef = React.useRef<React.ComponentRef<typeof BottomSheetTextInput>>(null);
    const conceptRef = React.useRef<React.ComponentRef<typeof BottomSheetTextInput>>(null);

    const categoryTriggerRef = React.useRef<React.ComponentRef<typeof DropdownMenuTrigger>>(null);

    const [day, setDay] = React.useState<DayKey>('');
    const [type, setType] = React.useState<TransactionType>('gasto');
    const [amount, setAmount] = React.useState('');
    const [concept, setConcept] = React.useState('');
    const [categoryId, setCategoryId] = React.useState<CategoryId>(DEFAULT_CATEGORY);

    const categories = useCategories();
    const categoryList = type === 'gasto' ? categories.expense : categories.income;

    function closeMenus() {
      categoryTriggerRef.current?.close();
    }

    function handleTypeChange(nextType: TransactionType) {
      setType(nextType);
      setCategoryId(nextType === 'gasto' ? DEFAULT_CATEGORY : DEFAULT_INCOME_CATEGORY);
      closeMenus();
    }

    const createExpense = useCreateExpense();
    const createIncome = useCreateIncome();
    const isSubmitting = createExpense.isPending || createIncome.isPending;

    const parsedAmount = parseAmountInput(amount);
    const canSubmit = amount.trim().length > 0 && parsedAmount > 0;

    React.useImperativeHandle(ref, () => ({
      present: (openDay: DayKey) => {
        setDay(openDay);
        setType('gasto');
        setAmount('');
        setConcept('');
        setCategoryId(DEFAULT_CATEGORY);
        closeMenus();
        createExpense.reset();
        createIncome.reset();
        sheetRef.current?.present();
      },
    }));

    function handleSheetChange(index: number) {
      if (index >= 0) {
        requestAnimationFrame(() => amountRef.current?.focus());
      }
    }

    function handleSubmit() {
      if (!canSubmit || isSubmitting) return;

      const values = {
        concept: concept.trim() || getCategory(categoryId).label,
        total: parsedAmount,
        description: '',
        categoryId,
        date: day,
      };

      function resetForm() {
        setAmount('');
        setConcept('');
        requestAnimationFrame(() => amountRef.current?.focus());
      }

      if (type === 'gasto') {
        createExpense.mutate(values, { onSuccess: resetForm });
      } else {
        createIncome.mutate(values, { onSuccess: resetForm });
      }
    }

    const renderBackdrop = React.useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      ),
      []
    );

    const category = getCategory(categoryId);

    return (
      <BottomSheetModal
        ref={sheetRef}
        enableDynamicSizing
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        animatedIndex={animatedIndex}
        onChange={handleSheetChange}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.background }}
        handleIndicatorStyle={{ backgroundColor: colors.handle }}>
        <BottomSheetView
          className="gap-3 px-4"
          style={{ paddingBottom: Platform.select({ ios: 24, default: 16 }) }}>
          <View className="flex-row items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="min-w-28"
              onPress={() => handleTypeChange(type === 'gasto' ? 'ingreso' : 'gasto')}>
              <Icon
                as={type === 'gasto' ? ArrowDownCircleIcon : ArrowUpCircleIcon}
                className={type === 'gasto' ? 'text-destructive size-4' : 'size-4 text-green-600'}
              />
              <Text variant="small">{type === 'gasto' ? 'Gasto' : 'Ingreso'}</Text>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger ref={categoryTriggerRef} size="sm" className="flex-1">
                <Icon as={category.icon} className="size-4" color={category.color} />
                <Text variant="small">{category.label}</Text>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top">
                <DropdownMenuRadioGroup
                  value={categoryId}
                  onValueChange={(value) => setCategoryId(value as CategoryId)}>
                  {categoryList.map((item) => (
                    <DropdownMenuRadioItem key={item.id} value={item.id}>
                      <Icon as={item.icon} className="size-4" color={item.color} />
                      <Text>{item.label}</Text>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </View>

          <View className="flex-row items-center">
            <Icon
              as={type === 'gasto' ? Minus : Plus}
              strokeWidth={3}
              className={type === 'gasto' ? 'text-destructive size-5' : 'size-5 text-green-600'}
            />
            <Text className="pl-2 text-3xl font-bold">$</Text>
            <BottomSheetTextInput
              ref={amountRef}
              className="flex-1"
              value={formatAmountInput(amount)}
              onChangeText={(text) => setAmount(sanitizeAmountInput(text))}
              onFocus={closeMenus}
              placeholder="0.00"
              keyboardType="decimal-pad"
              returnKeyType="next"
              onSubmitEditing={() => conceptRef.current?.focus()}
              submitBehavior="submit"
              selectTextOnFocus
              autoFocus
              style={{
                fontSize: 32,
                fontWeight: '700',
                color: PALETTE[theme ?? 'light'].foreground,
                paddingVertical: 8,
              }}
            />
            <Button size="icon" onPress={handleSubmit} disabled={!canSubmit || isSubmitting}>
              <Icon as={ChevronUp} className="size-5" />
            </Button>
          </View>

          <BottomSheetTextInput
            ref={conceptRef}
            value={concept}
            onChangeText={setConcept}
            onFocus={closeMenus}
            placeholder="Concepto"
            autoCapitalize="sentences"
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            style={{
              fontSize: 16,
              color: PALETTE[theme ?? 'light'].foreground,
            }}
          />
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);
