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
  '#1F6F43', '#2563EB', '#7C3AED', '#DB2777', '#DC2626',
  '#EA580C', '#D97706', '#65A30D', '#0891B2', '#0F766E',
  '#4F46E5', '#BE185D', '#B45309', '#15803D', '#1D4ED8',
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
