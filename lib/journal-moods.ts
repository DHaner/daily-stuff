import {
  AngryIcon,
  FrownIcon,
  LaughIcon,
  MehIcon,
  SmileIcon,
  type LucideIcon,
} from 'lucide-react-native';

/** Ordered from best to worst. */
export const MOOD_IDS = ['good', 'normal', 'meh', 'bad', 'awful'] as const;

export type MoodId = (typeof MOOD_IDS)[number];

export type Mood = {
  id: MoodId;
  label: string;
  /** Hex, because the color is applied through `style` rather than a Tailwind class. */
  color: string;
  icon: LucideIcon;
};

export const MOODS: Record<MoodId, Mood> = {
  good: { id: 'good', label: 'Bien', color: '#22c55e', icon: LaughIcon },
  normal: { id: 'normal', label: 'Normal', color: '#84cc16', icon: SmileIcon },
  meh: { id: 'meh', label: 'Meh', color: '#eab308', icon: MehIcon },
  bad: { id: 'bad', label: 'Mal', color: '#f97316', icon: FrownIcon },
  awful: { id: 'awful', label: 'Horrible', color: '#ef4444', icon: AngryIcon },
};

export const MOOD_LIST: Mood[] = MOOD_IDS.map((id) => MOODS[id]);

export function getMood(id: string): Mood {
  return MOODS[id as MoodId] ?? MOODS.normal;
}
