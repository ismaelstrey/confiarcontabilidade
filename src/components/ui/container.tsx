'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const containerVariants = cva(
  'mx-auto w-full',
  {
    variants: {
      size: {
        sm: 'max-w-3xl',
        md: 'max-w-5xl',
        lg: 'max-w-6xl',
        xl: 'max-w-7xl',
        full: 'max-w-full',
      },
      padding: {
        none: 'px-0',
        sm: 'px-4 sm:px-6',
        md: 'px-4 sm:px-6 lg:px-8',
        lg: 'px-6 sm:px-8 lg:px-12',
      },
      center: {
        true: 'text-center',
        false: '',
      },
    },
    defaultVariants: {
      size: 'xl',
      padding: 'md',
      center: false,
    },
  }
)

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  as?: React.ElementType
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, padding, center, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(containerVariants({ size, padding, center, className }))}
        {...props}
      />
    )
  }
)
Container.displayName = 'Container'

// Componente especializado para seções
export interface SectionProps extends ContainerProps {
  background?: 'white' | 'gray' | 'primary' | 'accent' | 'gradient'
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
}

const sectionVariants = cva(
  'w-full',
  {
    variants: {
      background: {
        white: 'bg-white',
        gray: 'bg-gray-50',
        primary: 'bg-primary-600 text-white',
        accent: 'bg-accent-500 text-white',
        gradient: 'bg-gradient-to-br from-primary-600 to-accent-500 text-white',
      },
      spacing: {
        sm: 'py-8 sm:py-12',
        md: 'py-12 sm:py-16',
        lg: 'py-16 sm:py-20',
        xl: 'py-20 sm:py-24',
      },
    },
    defaultVariants: {
      background: 'white',
      spacing: 'lg',
    },
  }
)

const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      className,
      size,
      padding,
      center,
      background,
      spacing,
      children,
      as: Component = 'section',
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(sectionVariants({ background, spacing }), className)}
        {...props}
      >
        <Container size={size} padding={padding} center={center}>
          {children}
        </Container>
      </Component>
    )
  }
)
Section.displayName = 'Section'

export { Container, Section, containerVariants, sectionVariants }