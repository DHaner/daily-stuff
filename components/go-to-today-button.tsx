import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ArrowUpIcon } from 'lucide-react-native';
import { View } from 'react-native';

type GoToTodayButtonProps = {
  visible: boolean;
  onPress: () => void;
  /** Distance from the bottom edge of the screen, to clear any bar or inset. */
  bottom: number;
};

/** Small floating pill, centered at the bottom, that returns a long list to its newest record. */
export function GoToTodayButton({ visible, onPress, bottom }: GoToTodayButtonProps) {
  if (!visible) return null;

  return (
    <View className="absolute inset-x-0 items-center" style={{ bottom }} pointerEvents="box-none">
      <Button
        size="sm"
        variant="secondary"
        className="rounded-full"
        onPress={onPress}>
        <Icon as={ArrowUpIcon} className="size-4" />
        <Text variant="small">Ir a hoy</Text>
      </Button>
    </View>
  );
}
