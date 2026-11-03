import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { formatMonth, shiftMonth } from '@/lib/format';

interface MonthNavProps {
  month: string;
  onChange: (month: string) => void;
}

export function MonthNav({ month, onChange }: MonthNavProps) {
  return (
    <Box
      sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: 'background.paper', borderRadius: 4, p: 0.5 }}
    >
      <IconButton aria-label="Mes anterior" onClick={() => onChange(shiftMonth(month, -1))}>
        <ChevronLeft />
      </IconButton>
      <Typography variant="subtitle1" sx={{ minWidth: 150, textAlign: 'center' }}>
        {formatMonth(month)}
      </Typography>
      <IconButton aria-label="Mes siguiente" onClick={() => onChange(shiftMonth(month, 1))}>
        <ChevronRight />
      </IconButton>
    </Box>
  );
}
