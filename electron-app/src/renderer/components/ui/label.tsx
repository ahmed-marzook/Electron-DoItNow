import * as React from 'react'
import { cn } from '@renderer/lib/utils'

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'block text-sm font-medium text-white/80 mb-1',
        className,
      )}
      {...props}
    />
  ),
)
Label.displayName = 'Label'

export { Label }
