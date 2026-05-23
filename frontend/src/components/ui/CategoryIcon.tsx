import {
  ArrowUpDown, BaggageClaim, BookOpen, BriefcaseBusiness, CarFront,
  Dumbbell, Gift, HeartPulse, House, PawPrint, PiggyBank,
  ReceiptText, ShoppingCart, Ticket, Utensils, Wallet, Tag,
  Mailbox, type LucideIcon,
} from 'lucide-react'

export const CATEGORY_ICONS: { name: string; Icon: LucideIcon }[] = [
  { name: 'utensils', Icon: Utensils },
  { name: 'shopping-cart', Icon: ShoppingCart },
  { name: 'house', Icon: House },
  { name: 'car-front', Icon: CarFront },
  { name: 'heart-pulse', Icon: HeartPulse },
  { name: 'dumbbell', Icon: Dumbbell },
  { name: 'book-open', Icon: BookOpen },
  { name: 'briefcase-business', Icon: BriefcaseBusiness },
  { name: 'piggy-bank', Icon: PiggyBank },
  { name: 'wallet', Icon: Wallet },
  { name: 'receipt-text', Icon: ReceiptText },
  { name: 'gift', Icon: Gift },
  { name: 'ticket', Icon: Ticket },
  { name: 'paw-print', Icon: PawPrint },
  { name: 'tag', Icon: Tag },
  { name: 'baggage-claim', Icon: BaggageClaim },
  { name: 'arrow-up-down', Icon: ArrowUpDown },
  { name: 'mailbox', Icon: Mailbox },
]

export const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORY_ICONS.map(({ name, Icon }) => [name, Icon])
)

export const CATEGORY_COLORS = [
  // Lima
  '#65A30D',
  // Verdes
  '#14532D', '#1F6F43', '#15803D',
  // Esmeralda
  '#065F46', '#059669',
  // Teal → Ciano
  '#134E4A', '#0F766E', '#0E7490',
  // Azuis
  '#1E3A8A', '#1D4ED8', '#2563EB', '#0284C7',
  // Índigo → Roxo
  '#3730A3', '#4F46E5', '#5B21B6', '#7C3AED',
  // Rosa → Pink
  '#9D174D', '#BE185D', '#DB2777',
  // Vermelho
  '#7F1D1D', '#DC2626',
  // Laranja
  '#C2410C', '#EA580C',
  // Âmbar
  '#B45309', '#D97706',
  // Amarelo
  '#CA8A04',
]

interface CategoryIconDisplayProps {
  icon: string
  color: string
  size?: 'sm' | 'md' | 'lg'
}

export function CategoryIconDisplay({ icon, color, size = 'md' }: Readonly<CategoryIconDisplayProps>) {
  const Icon = ICON_MAP[icon] ?? Tag
  const sizes = {
    sm: { wrapper: 'h-8 w-8 rounded-lg', icon: 'h-4 w-4' },
    md: { wrapper: 'h-10 w-10 rounded-xl', icon: 'h-5 w-5' },
    lg: { wrapper: 'h-12 w-12 rounded-xl', icon: 'h-6 w-6' },
  }
  return (
    <div
      className={`flex items-center justify-center ${sizes[size].wrapper}`}
      style={{ backgroundColor: `${color}25` }}
    >
      <Icon className={sizes[size].icon} style={{ color }} />
    </div>
  )
}
