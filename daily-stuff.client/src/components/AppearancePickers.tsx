import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Check from '@mui/icons-material/Check';
import { COLORS } from '@/lib/colors';
import { ICON_KEYS } from '@/lib/icon-registry';
import { ItemIcon } from '@/lib/icons';
import { tint } from '@/lib/ui';


interface PickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ value, onChange }: PickerProps) {
  return (
    <Box role="radiogroup" aria-label="Color" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {COLORS.map((color) => (
        <ButtonBase
          key={color}
          role="radio"
          aria-checked={value === color}
          aria-label={color}
          onClick={() => onChange(color)}
          sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: color, color: '#fff' }}
        >
          {value === color && <Check fontSize="small" />}
        </ButtonBase>
      ))}
    </Box>
  );
}

export function IconPicker({ value, onChange, color }: PickerProps & { color: string }) {
  return (
    <Box role="radiogroup" aria-label="Icono" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {ICON_KEYS.map((key) => {
        const selected = value === key;
        return (
          <ButtonBase
            key={key}
            role="radio"
            aria-checked={selected}
            aria-label={key}
            onClick={() => onChange(key)}
            sx={{
              width: 40,
              height: 40,
              borderRadius: 3,
              color: selected ? color : 'text.secondary',
              bgcolor: selected ? tint(color, 16) : 'background.default',
            }}
          >
            <ItemIcon name={key} fontSize="small" />
          </ButtonBase>
        );
      })}
    </Box>
  );
}
