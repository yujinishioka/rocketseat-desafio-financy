import { cn } from '../../lib/utils'

interface BadgeProps {
  label: string
  color?: string
  className?: string
}

export function CategoryBadge({ label, color = '#1F6F43', className }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', className)}
      style={{ backgroundColor: `${color}20`, color }}
    >
      {label}
    </span>
  )
}

interface TypeBadgeProps {
  type: 'INCOME' | 'EXPENSE'
}

export function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        type === 'INCOME'
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-600'
      )}
    >
      {type === 'INCOME' ? 'Entrada' : 'Saída'}
    </span>
  )
}
