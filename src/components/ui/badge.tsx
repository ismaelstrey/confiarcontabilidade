'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary-600 text-white hover:bg-primary-700',
        secondary:
          'border-transparent bg-accent-500 text-white hover:bg-accent-600',
        success:
          'border-transparent bg-success-500 text-white hover:bg-success-600',
        warning:
          'border-transparent bg-warning-500 text-white hover:bg-warning-600',
        error:
          'border-transparent bg-error-500 text-white hover:bg-error-600',
        outline:
          'border-primary-600 text-primary-600 hover:bg-primary-50',
        ghost:
          'border-transparent text-primary-600 hover:bg-primary-50',
        neutral:
          'border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  removable?: boolean
  onRemove?: () => void
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      leftIcon,
      rightIcon,
      removable = false,
      onRemove,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {leftIcon && (
          <span className="mr-1 flex items-center">{leftIcon}</span>
        )}
        {children}
        {rightIcon && !removable && (
          <span className="ml-1 flex items-center">{rightIcon}</span>
        )}
        {removable && (
          <button
            type="button"
            className="ml-1 flex items-center hover:bg-black/10 rounded-full p-0.5 transition-colors"
            onClick={onRemove}
            aria-label="Remover"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    )
  }
)
Badge.displayName = 'Badge'

// Componente especializado para status
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled'
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, ...props }, ref) => {
    const statusConfig = {
      active: { variant: 'success' as const, text: 'Ativo' },
      inactive: { variant: 'neutral' as const, text: 'Inativo' },
      pending: { variant: 'warning' as const, text: 'Pendente' },
      completed: { variant: 'success' as const, text: 'Concluído' },
      cancelled: { variant: 'error' as const, text: 'Cancelado' },
    }

    const config = statusConfig[status]

    return (
      <Badge ref={ref} variant={config.variant} {...props}>
        {config.text}
      </Badge>
    )
  }
)
StatusBadge.displayName = 'StatusBadge'

export { Badge, StatusBadge, badgeVariants }