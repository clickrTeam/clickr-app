import * as React from 'react'
import { cn } from '@renderer/lib/utils'

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, ...props }, ref) => {
    return (
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="sr-only peer"
          {...props}
        />
        <div
          className={cn(
            'relative w-11 h-6 bg-gray-200 rounded-full transition-colors duration-200',
            checked ? 'bg-cyan-600' : 'bg-gray-200',
            'peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500 peer-focus:ring-offset-2',
            className
          )}
        >
          <div
            className={cn(
              'absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform duration-200 shadow-sm',
              checked ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </div>
      </label>
    )
  }
)
Switch.displayName = 'Switch'

export { Switch }
