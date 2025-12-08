import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@renderer/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-blue-600/80 text-white hover:bg-blue-600 border border-blue-500/40 focus:ring-blue-500',
        destructive:
          'bg-red-600/80 text-white hover:bg-red-600 border border-red-500/40 focus:ring-red-500',
        outline:
          'bg-white/10 text-white hover:bg-white/20 border border-white/20 focus:ring-white/50',
        secondary:
          'bg-gray-600/80 text-white hover:bg-gray-600 border border-gray-500/40 focus:ring-gray-500',
        ghost: 'hover:bg-white/10 text-white',
        link: 'text-blue-400 underline-offset-4 hover:underline',
        success:
          'bg-green-600/80 text-white hover:bg-green-600 border border-green-500/40 focus:ring-green-500',
      },
      size: {
        default: 'px-4 py-2',
        sm: 'px-3 py-1 text-xs',
        lg: 'px-6 py-3',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
