import {
  BriefcaseIcon,
  CarIcon,
  ClapperboardIcon,
  EllipsisIcon,
  GiftIcon,
  GraduationCapIcon,
  HeartPulseIcon,
  HouseIcon,
  LaptopIcon,
  LandmarkIcon,
  RefreshCcwIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  UtensilsCrossedIcon,
  WalletIcon,
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

export const EXPENSE_CATEGORY_IDS = [
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

export const INCOME_CATEGORY_IDS = [
  'salario',
  'freelance',
  'inversiones',
  'negocio',
  'regalo',
  'reembolso',
  'otros_ingreso',
] as const;

export const CATEGORY_IDS = [...EXPENSE_CATEGORY_IDS, ...INCOME_CATEGORY_IDS] as const;

export type ExpenseCategoryId = (typeof EXPENSE_CATEGORY_IDS)[number];
export type IncomeCategoryId = (typeof INCOME_CATEGORY_IDS)[number];
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
  salario: { id: 'salario', label: 'Salario', color: '#22c55e', icon: WalletIcon },
  freelance: { id: 'freelance', label: 'Freelance', color: '#0ea5e9', icon: LaptopIcon },
  inversiones: { id: 'inversiones', label: 'Inversiones', color: '#a855f7', icon: TrendingUpIcon },
  negocio: { id: 'negocio', label: 'Negocio', color: '#f97316', icon: BriefcaseIcon },
  regalo: { id: 'regalo', label: 'Regalo', color: '#ec4899', icon: GiftIcon },
  reembolso: { id: 'reembolso', label: 'Reembolso', color: '#eab308', icon: RefreshCcwIcon },
  otros_ingreso: { id: 'otros_ingreso', label: 'Otros', color: '#94a3b8', icon: LandmarkIcon },
};

export const EXPENSE_CATEGORY_LIST = EXPENSE_CATEGORY_IDS.map((id) => CATEGORIES[id]);
export const INCOME_CATEGORY_LIST = INCOME_CATEGORY_IDS.map((id) => CATEGORIES[id]);

/** @deprecated Use `EXPENSE_CATEGORY_LIST` — kept for expense-only call sites. */
export const CATEGORY_LIST = EXPENSE_CATEGORY_LIST;

export const DEFAULT_CATEGORY: CategoryId = 'otros';
export const DEFAULT_INCOME_CATEGORY: CategoryId = 'otros_ingreso';

export function getCategory(id: string): Category {
  return CATEGORIES[id as CategoryId] ?? CATEGORIES[DEFAULT_CATEGORY];
}
