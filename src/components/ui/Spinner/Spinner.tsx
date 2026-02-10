/**
 * Spinner Component
 *
 * A loading spinner component with various sizes.
 *
 * @module components/ui/Spinner
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface SpinnerProps
  extends
    Omit<HTMLAttributes<SVGSVGElement>, 'children'>,
    VariantProps<typeof spinnerVariants> {}

/**
 * Spinner component for loading states.
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="lg" />
 * <Spinner className="text-primary" />
 * ```
 */
export function Spinner({ size, className, ...props }: SpinnerProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

Spinner.displayName = 'Spinner';

export { spinnerVariants };
