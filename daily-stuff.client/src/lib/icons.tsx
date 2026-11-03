import Label from '@mui/icons-material/Label';
import type { SvgIconComponent } from '@mui/icons-material';
import { ICONS } from './icon-registry';

export function ItemIcon({ name, ...props }: { name: string } & React.ComponentProps<SvgIconComponent>) {
  const Icon = ICONS[name] ?? Label;
  return <Icon {...props} />;
}
