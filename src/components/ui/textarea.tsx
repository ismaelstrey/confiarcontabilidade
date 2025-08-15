'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-200',
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
        sm: 'min-h-[60px] px-2 py-1 text-xs',
        md: 'min-h-[80px] px-3 py-2 text-sm',
        lg: 'min-h-[120px] px-4 py-3 text-base',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      resize: 'vertical',
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string
  error?: string
  success?: string
  maxLength?: number
  showCount?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      size,
      resize,
      label,
      error,
      success,
      maxLength,
      showCount = false,
      id,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = React.useState(0)
    const generatedId = React.useId()
    const textareaId = id || generatedId

    React.useEffect(() => {
      if (typeof value === 'string') {
        setCharCount(value.length)
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      if (onChange) {
        onChange(e)
      }
    }

    const finalVariant = error ? 'error' : success ? 'success' : variant

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            className={cn(
              textareaVariants({ variant: finalVariant, size, resize, className })
            )}
            ref={ref}
            id={textareaId}
            maxLength={maxLength}
            value={value}
            onChange={handleChange}
            {...props}
          />
          {showCount && maxLength && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-1 rounded">
              {charCount}/{maxLength}
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
        {showCount && maxLength && !error && !success && (
          <p className="mt-1 text-xs text-gray-500 text-right">
            {charCount}/{maxLength} caracteres
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants }