/**
 * Label Component
 *
 * A label component for form inputs with proper accessibility support.
 *
 * @module components/ui/Label
 */

import { forwardRef, type LabelHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Show required indicator */
  required?: boolean;
}

/**
 * Label component for form inputs.
 *
 * @example
 * ```tsx
 * <Label htmlFor="email">Email Address</Label>
 * <Label required>Required Field</Label>
 * ```
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';
