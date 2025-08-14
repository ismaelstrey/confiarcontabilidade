'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
  {
    variants: {
      variant: {
        default:
          'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20',
        error:
          'border-error-500 focus:border-error-500 focus:ring-error-500/20 bg-error-50',
        success:
          'border-success-500 focus:border-success-500 focus:ring-success-500/20 bg-success-50',
      },
      size: {
        sm: 'h-9 px-2 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-11 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  success?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      type,
      label,
      error,
      success,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [inputType, setInputType] = React.useState(type)
    const inputId = id || React.useId()

    React.useEffect(() => {
      if (type === 'password' && showPasswordToggle) {
        setInputType(showPassword ? 'text' : 'password')
      } else {
        setInputType(type)
      }
    }, [type, showPassword, showPasswordToggle])

    const finalVariant = error ? 'error' : success ? 'success' : variant

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            type={inputType}
            className={cn(
              inputVariants({ variant: finalVariant, size, className }),
              leftIcon && 'pl-10',
              (rightIcon || (type === 'password' && showPasswordToggle)) && 'pr-10'
            )}
            ref={ref}
            id={inputId}
            {...props}
          />
          {type === 'password' && showPasswordToggle && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
          {rightIcon && !showPasswordToggle && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-error-600 flex items-center gap-1">
            <span className="w-1 h-1 bg-error-600 rounded-full" />
            {error}
          </p>
        )}
        {success && (
          <p className="mt-1 text-sm text-success-600 flex items-center gap-1">
            <span className="w-1 h-1 bg-success-600 rounded-full" />
            {success}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input, inputVariants }