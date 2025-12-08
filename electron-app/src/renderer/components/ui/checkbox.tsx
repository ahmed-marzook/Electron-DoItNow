import * as React from 'react'
import { cn } from '@renderer/lib/utils'

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={cn(
          'w-5 h-5 rounded cursor-pointer text-blue-600 bg-white/10 border-white/20 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
