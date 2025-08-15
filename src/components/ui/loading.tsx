'use client';

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { HTMLAttributes, useState } from "react";

interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

// Componente Spinner
function Spinner({ size = 'md', className }: { size?: keyof typeof sizeClasses; className?: string }) {
  return (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  );
}

// Componente Dots
function Dots({ size = 'md' }: { size?: keyof typeof sizeClasses }) {
  const dotSize = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  }[size];

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-current rounded-full animate-pulse',
            dotSize
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
}

// Componente Pulse
function Pulse({ size = 'md' }: { size?: keyof typeof sizeClasses }) {
  return (
    <div className={cn('bg-current rounded-full animate-pulse', sizeClasses[size])} />
  );
}

// Componente Skeleton
function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
      {...props}
    />
  );
}

// Componente principal Loading
export function Loading({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
  className,
  ...props
}: LoadingProps) {
  const renderVariant = () => {
    switch (variant) {
      case 'spinner':
        return <Spinner size={size} />;
      case 'dots':
        return <Dots size={size} />;
      case 'pulse':
        return <Pulse size={size} />;
      case 'skeleton':
        return <Skeleton className={sizeClasses[size]} />;
      default:
        return <Spinner size={size} />;
    }
  };

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2',
        fullScreen && 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
        className
      )}
      {...props}
    >
      <div className="text-primary">
        {renderVariant()}
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  return content;
}

// Componentes específicos para diferentes casos de uso
export function PageLoading({ text = "Carregando..." }: { text?: string }) {
  return (
    <Loading
      variant="spinner"
      size="lg"
      text={text}
      fullScreen
      className="min-h-screen"
    />
  );
}

export function ButtonLoading({ size = 'sm' }: { size?: keyof typeof sizeClasses }) {
  return <Loading variant="spinner" size={size} />;
}

export function CardLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  );
}

export function FormLoading() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/5" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

// Hook para loading states
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);
  const toggleLoading = () => setIsLoading(prev => !prev);

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setIsLoading,
  };
}

// HOC para adicionar loading a componentes
export function withLoading<T extends object>(
  Component: React.ComponentType<T>,
  LoadingComponent: React.ComponentType = () => <Loading />
) {
  return function WrappedComponent(props: T & { isLoading?: boolean }) {
    const { isLoading, ...componentProps } = props;
    
    if (isLoading) {
      return <LoadingComponent />;
    }
    
    return <Component {...(componentProps as T)} />;
  };
}

export { Skeleton };