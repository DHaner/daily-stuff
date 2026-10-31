import { RIPPLE } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { Platform, Pressable } from 'react-native';
import { useUniwind } from 'uniwind';

type RipplePressableProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<React.ComponentRef<typeof Pressable>> & {
    /** Ripple colour; defaults to a neutral tint that follows the light/dark theme. */
    rippleColor?: string;
    /** Let the wave spill outside the view (icon buttons without a visible shape). */
    borderless?: boolean;
  };

/**
 * `Pressable` with the native Android ripple. The wave is drawn in the foreground so it also
 * shows over children with their own background (cards), and `overflow-hidden` clips it to the
 * corner radius given in `className`. Elsewhere it falls back to the usual opacity feedback.
 */
function RipplePressable({
  className,
  rippleColor,
  borderless = false,
  android_ripple,
  ...props
}: RipplePressableProps) {
  const { theme } = useUniwind();
  const isAndroid = Platform.OS === 'android';

  return (
    <Pressable
      android_ripple={
        android_ripple ?? {
          color: rippleColor ?? (theme === 'dark' ? RIPPLE.dark : RIPPLE.light),
          borderless,
          foreground: true,
        }
      }
      className={cn(isAndroid ? !borderless && 'overflow-hidden' : 'active:opacity-70', className)}
      {...props}
    />
  );
}

export { RipplePressable };
export type { RipplePressableProps };
