import { Icon } from '@/components/ui/icon';
import { RipplePressable } from '@/components/ui/ripple-pressable';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

/** Strips the box styling from `Input` / `Textarea` so a field reads as a plain row. */
export const PLAIN_INPUT = 'h-8 rounded-none border-0 bg-transparent px-0 dark:bg-transparent';

type FormFieldProps = {
  /** Accessibility label for the icon. */
  label: string;
  /** Small text above the content. */
  caption?: string;
  /** Omit for fields that stand on their own (e.g. the concept title). */
  icon?: LucideIcon;
  iconClassName?: string;
  /** Hex colour for the icon, for icons tinted by data (a category's colour). */
  iconColor?: string;
  /** Drops the hairline under the row (last field before the buttons). */
  last?: boolean;
  /** Pins the icon to the top for multi-line content (description, category chips). */
  alignTop?: boolean;
  /** Makes the whole row pressable, with a ripple edge to edge between the hairlines. */
  onPress?: () => void;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * A borderless row: representative icon on the left, content on the right, hairline below.
 * The row bleeds out of the screen padding (`-mx-4`) so hairlines and ripples reach both edges.
 */
export function FormField({
  label,
  caption,
  icon,
  iconClassName,
  iconColor,
  last,
  alignTop,
  onPress,
  hint,
  error,
  className,
  children,
}: FormFieldProps) {
  const rowClassName = 'flex-row items-start gap-3 px-4 py-1.5';
  const content = (
    <>
      {icon ? (
        // Sits on the value's first line, not centred against the caption above it.
        <View className={cn('items-center justify-center', 'h-8', caption && 'mt-3.5')}>
          <Icon
            as={icon}
            color={iconColor}
            className={cn('text-muted-foreground size-5', iconClassName)}
            accessibilityLabel={label}
          />
        </View>
      ) : null}
      <View className="flex-1">
        {caption ? <Text className="text-muted-foreground text-xs">{caption}</Text> : null}
        {children}
      </View>
      {hint ? <Text className="text-muted-foreground text-xs">{hint}</Text> : null}
    </>
  );

  return (
    <View className={cn('-mx-4', !last && 'border-border/60 border-b', className)}>
      {onPress ? (
        <RipplePressable onPress={onPress} accessibilityRole="button" className={rowClassName}>
          {content}
        </RipplePressable>
      ) : (
        <View className={rowClassName}>{content}</View>
      )}
      {error ? (
        <Text className={cn('text-destructive px-4 pb-2 text-xs', icon && 'pl-12')}>{error}</Text>
      ) : null}
    </View>
  );
}
