import type { SvgIconComponent } from '@mui/icons-material';
import SentimentDissatisfied from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutral from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfied from '@mui/icons-material/SentimentSatisfied';
import SentimentVeryDissatisfied from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentVerySatisfied from '@mui/icons-material/SentimentVerySatisfied';
import type { Mood } from '@/api/types';

export interface MoodMeta {
  id: Mood;
  label: string;
  color: string;
  Icon: SvgIconComponent;
}

/** Ordered from best to worst. */
export const MOODS: MoodMeta[] = [
  { id: 'good', label: 'Bien', color: '#22c55e', Icon: SentimentVerySatisfied },
  { id: 'normal', label: 'Normal', color: '#84cc16', Icon: SentimentSatisfied },
  { id: 'meh', label: 'Meh', color: '#eab308', Icon: SentimentNeutral },
  { id: 'bad', label: 'Mal', color: '#f97316', Icon: SentimentDissatisfied },
  { id: 'awful', label: 'Horrible', color: '#ef4444', Icon: SentimentVeryDissatisfied },
];

export const getMood = (id: Mood) => MOODS.find((mood) => mood.id === id) ?? MOODS[1];
