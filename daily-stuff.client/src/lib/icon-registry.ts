import type { SvgIconComponent } from '@mui/icons-material';
import AccountBalance from '@mui/icons-material/AccountBalance';
import AccountBalanceWallet from '@mui/icons-material/AccountBalanceWallet';
import Bolt from '@mui/icons-material/Bolt';
import Book from '@mui/icons-material/MenuBook';
import Coffee from '@mui/icons-material/Coffee';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import FitnessCenter from '@mui/icons-material/FitnessCenter';
import Flight from '@mui/icons-material/Flight';
import Home from '@mui/icons-material/Home';
import Laptop from '@mui/icons-material/Laptop';
import LocalHospital from '@mui/icons-material/LocalHospital';
import Mood from '@mui/icons-material/Mood';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import Movie from '@mui/icons-material/Movie';
import MusicNote from '@mui/icons-material/MusicNote';
import Nightlight from '@mui/icons-material/Nightlight';
import Paid from '@mui/icons-material/Paid';
import Pets from '@mui/icons-material/Pets';
import Refresh from '@mui/icons-material/Autorenew';
import Restaurant from '@mui/icons-material/Restaurant';
import Savings from '@mui/icons-material/Savings';
import School from '@mui/icons-material/School';
import ShoppingBag from '@mui/icons-material/ShoppingBag';
import Star from '@mui/icons-material/Star';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Work from '@mui/icons-material/Work';
import CardGiftcard from '@mui/icons-material/CardGiftcard';

/** Icons the user can pick for categories, labels and lists. The key is what the API stores. */
export const ICONS: Record<string, SvgIconComponent> = {
  UtensilsCrossed: Restaurant,
  Coffee: Coffee,
  Car: DirectionsCar,
  Plane: Flight,
  House: Home,
  ShoppingBag: ShoppingBag,
  HeartPulse: LocalHospital,
  Clapperboard: Movie,
  Music: MusicNote,
  Zap: Bolt,
  GraduationCap: School,
  BookOpen: Book,
  Wallet: AccountBalanceWallet,
  Landmark: AccountBalance,
  Laptop: Laptop,
  TrendingUp: TrendingUp,
  Briefcase: Work,
  Gift: CardGiftcard,
  RefreshCcw: Refresh,
  PiggyBank: Savings,
  Banknote: Paid,
  PawPrint: Pets,
  Dumbbell: FitnessCenter,
  PartyPopper: Mood,
  Moon: Nightlight,
  Star: Star,
  Ellipsis: MoreHoriz,
};

export const ICON_KEYS = Object.keys(ICONS);

