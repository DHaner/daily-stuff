import {
  CarIcon,
  ClapperboardIcon,
  EllipsisIcon,
  GraduationCapIcon,
  HeartPulseIcon,
  HouseIcon,
  ShoppingBagIcon,
  UtensilsCrossedIcon,
  ZapIcon,
  type LucideIcon,
} from 'lucide-react-native';

export type Category = {
  id: CategoryId;
  label: string;
  /** Hex color: consumed by react-native-chart-kit, which cannot read Tailwind classes. */
  color: string;
  icon: LucideIcon;
};

export const CATEGORY_IDS = [
  'comida',
  'transporte',
  'hogar',
  'compras',
  'salud',
  'ocio',
  'servicios',
  'educacion',
  'otros',
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export const CATEGORIES: Record<CategoryId, Category> = {
  comida: { id: 'comida', label: 'Comida', color: '#f97316', icon: UtensilsCrossedIcon },
  transporte: { id: 'transporte', label: 'Transporte', color: '#0ea5e9', icon: CarIcon },
  hogar: { id: 'hogar', label: 'Hogar', color: '#14b8a6', icon: HouseIcon },
  compras: { id: 'compras', label: 'Compras', color: '#a855f7', icon: ShoppingBagIcon },
  salud: { id: 'salud', label: 'Salud', color: '#ef4444', icon: HeartPulseIcon },
  ocio: { id: 'ocio', label: 'Ocio', color: '#ec4899', icon: ClapperboardIcon },
  servicios: { id: 'servicios', label: 'Servicios', color: '#eab308', icon: ZapIcon },
  educacion: { id: 'educacion', label: 'Educación', color: '#22c55e', icon: GraduationCapIcon },
  otros: { id: 'otros', label: 'Otros', color: '#94a3b8', icon: EllipsisIcon },
};

export const CATEGORY_LIST = CATEGORY_IDS.map((id) => CATEGORIES[id]);

export const DEFAULT_CATEGORY: CategoryId = 'otros';

export function getCategory(id: string): Category {
  return CATEGORIES[id as CategoryId] ?? CATEGORIES[DEFAULT_CATEGORY];
}
