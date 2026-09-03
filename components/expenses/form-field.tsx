import { Label } from '@/components/ui/label';
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

export function FormField({ label, hint, error, className, children }: FormFieldProps) {
  return (
    <View className={cn('gap-1.5', className)}>
      <View className="flex-row items-center justify-between">
        <Label>{label}</Label>
        {hint ? <Text className="text-muted-foreground text-xs">{hint}</Text> : null}
      </View>
      {children}
      {error ? <Text className="text-destructive text-xs">{error}</Text> : null}
    </View>
  );
}
