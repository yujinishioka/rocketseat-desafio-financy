import * as RadixSelect from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { ReactNode } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  options: SelectOption[]
  label?: string
  error?: string
  disabled?: boolean
}

export function Select({ value, onValueChange, placeholder, options, label, error, disabled }: Readonly<SelectProps>) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RadixSelect.Trigger
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-gray-400',
            error && 'border-red-500'
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content
            className="z-50 max-h-60 w-[var(--radix-select-trigger-width)] overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
            position="popper"
            sideOffset={4}
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className="relative flex cursor-pointer select-none items-center rounded px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-50 data-[highlighted]:bg-gray-50 data-[state=checked]:font-medium data-[state=checked]:text-primary-600"
                >
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="absolute right-3">
                    <Check className="h-4 w-4 text-primary-600" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  children: ReactNode
}

export function NativeSelect({ label, error, children, className, ...props }: Readonly<NativeSelectProps>) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <select
          className={cn(
            'h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 pr-8 text-sm text-gray-900 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
