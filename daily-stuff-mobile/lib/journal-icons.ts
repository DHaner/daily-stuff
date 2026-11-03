import * as LucideIcons from 'lucide-react-native';
import { TagIcon, type LucideIcon } from 'lucide-react-native';

/**
 * Every Lucide export, keyed by its PascalCase name (e.g. `Dumbbell`). The main entry point
 * also carries the legacy aliases (`Smile`, `Github`-style names), which the stored icon
 * names rely on; non-icon exports (`createLucideIcon`, `Icon`, …) are filtered out below.
 */
const ICONS = LucideIcons as unknown as Record<string, LucideIcon>;

const NON_ICON_EXPORTS = new Set(['Icon', 'LucideProvider']);

function isIconExport(name: string) {
  return (
    /^[A-Z]/.test(name) &&
    !NON_ICON_EXPORTS.has(name) &&
    !name.startsWith('Lucide') &&
    !name.endsWith('Icon')
  );
}

export type IconCategory = {
  id: string;
  label: string;
  names: string[];
};

/**
 * Hand-picked groups so common icons are easy to find; the "Todos" view in the picker
 * still exposes the full Lucide set. Names that don't exist in the installed Lucide
 * version are dropped by `CATEGORIES` below.
 */
const CURATED: IconCategory[] = [
  {
    id: 'emociones',
    label: 'Emociones',
    names: [
      'Smile',
      'Laugh',
      'Meh',
      'Frown',
      'Angry',
      'Annoyed',
      'SmilePlus',
      'Heart',
      'HeartCrack',
      'HeartPulse',
      'Sparkles',
      'Star',
      'ThumbsUp',
      'ThumbsDown',
      'PartyPopper',
      'Ghost',
      'Skull',
      'Zap',
      'Flame',
      'Sun',
      'Moon',
      'CloudRain',
      'Rainbow',
      'Brain',
      'Eye',
      'HandHeart',
    ],
  },
  {
    id: 'comida',
    label: 'Comida y bebida',
    names: [
      'Pizza',
      'Coffee',
      'Beer',
      'Wine',
      'Martini',
      'Utensils',
      'UtensilsCrossed',
      'Apple',
      'Banana',
      'Cherry',
      'Citrus',
      'Grape',
      'Salad',
      'Soup',
      'Sandwich',
      'Cookie',
      'Croissant',
      'Cake',
      'CakeSlice',
      'IceCreamCone',
      'IceCreamBowl',
      'Candy',
      'Egg',
      'EggFried',
      'Beef',
      'Drumstick',
      'Fish',
      'Carrot',
      'Milk',
      'GlassWater',
      'CupSoda',
      'Popcorn',
      'Donut',
      'Hamburger',
      'Ham',
      'Wheat',
      'Vegan',
      'ChefHat',
      'CookingPot',
      'Refrigerator',
    ],
  },
  {
    id: 'salud',
    label: 'Salud y deporte',
    names: [
      'Dumbbell',
      'Bike',
      'Footprints',
      'Activity',
      'HeartPulse',
      'Pill',
      'Stethoscope',
      'Syringe',
      'Bandage',
      'Thermometer',
      'Brain',
      'Bed',
      'BedDouble',
      'Trophy',
      'Medal',
      'Volleyball',
      'Goal',
      'PersonStanding',
      'Waves',
      'Mountain',
      'Timer',
      'Flame',
      'Droplet',
      'Cross',
      'Hospital',
      'Ambulance',
      'Bone',
      'Ear',
      'Eye',
      'Smile',
      'Weight',
      'Swords',
    ],
  },
  {
    id: 'trabajo',
    label: 'Trabajo y estudio',
    names: [
      'Briefcase',
      'Laptop',
      'Monitor',
      'Code',
      'Terminal',
      'BookOpen',
      'Book',
      'GraduationCap',
      'Pencil',
      'PenLine',
      'NotebookPen',
      'FileText',
      'Calendar',
      'CalendarDays',
      'Clock',
      'Presentation',
      'Building',
      'Building2',
      'Mail',
      'Phone',
      'Users',
      'Handshake',
      'ClipboardList',
      'ChartBar',
      'ChartLine',
      'Target',
      'Lightbulb',
      'Library',
      'School',
      'Backpack',
      'Paperclip',
      'Folder',
      'Inbox',
      'Send',
      'Languages',
      'Calculator',
    ],
  },
  {
    id: 'social',
    label: 'Social y familia',
    names: [
      'Users',
      'User',
      'UserRound',
      'Baby',
      'Heart',
      'HeartHandshake',
      'Handshake',
      'MessageCircle',
      'MessageSquare',
      'PartyPopper',
      'Gift',
      'Cake',
      'Smile',
      'Phone',
      'Video',
      'Contact',
      'Dog',
      'Cat',
      'PawPrint',
      'House',
      'Church',
      'Hand',
      'HandHeart',
      'Cigarette',
      'Martini',
      'Beer',
      'Wine',
      'Mic',
      'Share2',
      'AtSign',
    ],
  },
  {
    id: 'viajes',
    label: 'Viajes y transporte',
    names: [
      'Plane',
      'Car',
      'Bus',
      'Train',
      'TrainFront',
      'Bike',
      'Ship',
      'Sailboat',
      'Rocket',
      'Map',
      'MapPin',
      'Compass',
      'Globe',
      'Luggage',
      'Tent',
      'TreePalm',
      'Mountain',
      'Fuel',
      'Navigation',
      'Hotel',
      'Ticket',
      'Anchor',
      'Truck',
      'Motorbike',
      'Caravan',
      'Route',
      'Signpost',
      'Backpack',
      'Camera',
      'Umbrella',
      'Sunrise',
      'Sunset',
    ],
  },
  {
    id: 'naturaleza',
    label: 'Naturaleza y clima',
    names: [
      'Sun',
      'Moon',
      'Cloud',
      'CloudRain',
      'CloudSnow',
      'CloudLightning',
      'Snowflake',
      'Wind',
      'Rainbow',
      'Umbrella',
      'Flower',
      'Flower2',
      'TreePine',
      'TreeDeciduous',
      'Leaf',
      'Sprout',
      'Mountain',
      'Waves',
      'Droplet',
      'Flame',
      'Bird',
      'Bug',
      'Fish',
      'Squirrel',
      'Rabbit',
      'Turtle',
      'Shell',
      'Clover',
      'Cloudy',
      'Sunrise',
      'Sunset',
      'Thermometer',
      'Earth',
    ],
  },
  {
    id: 'ocio',
    label: 'Ocio y entretenimiento',
    names: [
      'Gamepad2',
      'Music',
      'Headphones',
      'Guitar',
      'Film',
      'Clapperboard',
      'Tv',
      'Camera',
      'Image',
      'Palette',
      'Brush',
      'Paintbrush',
      'Drama',
      'Ticket',
      'Book',
      'Dices',
      'Puzzle',
      'Popcorn',
      'Mic',
      'Radio',
      'Piano',
      'Podcast',
      'Joystick',
      'Drum',
      'Fish',
      'Spade',
      'Sparkles',
      'PartyPopper',
      'Telescope',
      'Dumbbell',
    ],
  },
  {
    id: 'hogar',
    label: 'Hogar y compras',
    names: [
      'House',
      'Sofa',
      'Bath',
      'ShowerHead',
      'Lamp',
      'WashingMachine',
      'Shirt',
      'ShoppingCart',
      'ShoppingBag',
      'Store',
      'Package',
      'Wrench',
      'Hammer',
      'Key',
      'Trash2',
      'BrushCleaning',
      'Refrigerator',
      'Microwave',
      'CookingPot',
      'Armchair',
      'Bed',
      'DoorOpen',
      'Fan',
      'Plug',
      'Paintbrush',
      'Scissors',
      'Glasses',
      'Watch',
      'Gem',
      'ShoppingBasket',
    ],
  },
  {
    id: 'finanzas',
    label: 'Finanzas',
    names: [
      'Wallet',
      'CreditCard',
      'Banknote',
      'Coins',
      'PiggyBank',
      'Receipt',
      'TrendingUp',
      'TrendingDown',
      'DollarSign',
      'Landmark',
      'BadgeDollarSign',
      'Percent',
      'ChartPie',
      'ChartBar',
      'HandCoins',
      'Scale',
      'Calculator',
      'Bitcoin',
      'Euro',
    ],
  },
  {
    id: 'tecnologia',
    label: 'Tecnología',
    names: [
      'Smartphone',
      'Laptop',
      'Wifi',
      'Battery',
      'Bluetooth',
      'Cpu',
      'Server',
      'Database',
      'Cloud',
      'Mouse',
      'Keyboard',
      'Printer',
      'Usb',
      'Bot',
      'QrCode',
      'Monitor',
      'Tablet',
      'Watch',
      'Gamepad2',
      'Webcam',
      'Radio',
      'Satellite',
      'Code',
      'Terminal',
      'Github',
    ],
  },
  {
    id: 'simbolos',
    label: 'Símbolos',
    names: [
      'Star',
      'Flag',
      'Bookmark',
      'Bell',
      'Lightbulb',
      'Target',
      'Award',
      'Crown',
      'Gem',
      'Lock',
      'Shield',
      'Check',
      'X',
      'Circle',
      'Square',
      'Triangle',
      'Hash',
      'Tag',
      'Infinity',
      'Sparkle',
      'Heart',
      'Zap',
      'Flame',
      'Eye',
      'Clock',
      'Hourglass',
      'Pin',
      'Link',
      'CircleAlert',
      'CircleHelp',
      'Ban',
      'Repeat',
      'Bolt',
      'Anchor',
      'Feather',
    ],
  },
];

export const ICON_CATEGORIES: IconCategory[] = CURATED.map((category) => ({
  ...category,
  names: [...new Set(category.names)].filter((name) => name in ICONS),
}));

export type IconEntry = {
  /** Name stored on the label. */
  name: string;
  /** Lowercase concatenation of every alias of the icon, searched by the picker. */
  searchKey: string;
};

/**
 * One entry per distinct icon, alphabetically. Lucide exports several names for the same
 * component (`Angry` / `FaceAngry`), so aliases are folded into the entry's `searchKey`.
 */
export const ALL_ICONS: IconEntry[] = (() => {
  const namesByIcon = new Map<LucideIcon, string[]>();

  for (const name of Object.keys(ICONS).filter(isIconExport)) {
    const names = namesByIcon.get(ICONS[name]) ?? [];
    names.push(name);
    namesByIcon.set(ICONS[name], names);
  }

  return [...namesByIcon.values()]
    .map((names) => {
      const [name] = [...names].sort((a, b) => a.length - b.length || a.localeCompare(b));

      return { name, searchKey: names.join(' ').toLowerCase() };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
})();

export const DEFAULT_LABEL_ICON = 'Tag';

/** Resolves a stored icon name to its component, falling back to a generic tag. */
export function getLabelIcon(name: string): LucideIcon {
  return ICONS[name] ?? TagIcon;
}

/** Case-insensitive match against the icon's names; spaces and hyphens in the query are ignored. */
export function matchesIconQuery(entry: IconEntry, query: string) {
  const normalizedQuery = query.toLowerCase().replace(/[\s-]+/g, '');

  return normalizedQuery.length === 0 || entry.searchKey.includes(normalizedQuery);
}
