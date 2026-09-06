import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

type FormFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
};

export function FormField({ hint, error, className, children }: FormFieldProps) {
  return (
    <View className={cn('gap-1.5', className)}>
      {hint ? (
        <View className="flex-row items-center justify-end">
          <Text className="text-muted-foreground text-xs">{hint}</Text>
        </View>
      ) : null}
      {children}
      {error ? <Text className="text-destructive text-xs">{error}</Text> : null}
    </View>
  );
}
