/**
 * Container Component
 *
 * A responsive container component for page layouts.
 * Centers content and applies max-width constraints.
 *
 * @module components/layout/Container
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const containerVariants = cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-7xl',
      xl: 'max-w-[1920px]',
      full: 'max-w-full',
    },
  },
  defaultVariants: {
    size: 'lg',
  },
});

export interface ContainerProps
  extends
    HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

/**
 * Container component for page layouts.
 *
 * @example
 * ```tsx
 * <Container>
 *   <h1>Page Content</h1>
 * </Container>
 * <Container size="sm">Narrow content</Container>
 * ```
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(containerVariants({ size }), className)}
        {...props}
      />
    );
  }
);

Container.displayName = 'Container';

export { containerVariants };
