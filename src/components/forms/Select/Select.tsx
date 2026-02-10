/**
 * Select Component
 *
 * A styled select dropdown component with label and error support.
 *
 * @module components/forms/Select
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type SelectHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const selectVariants = cva(
  'flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
  {
    variants: {
      variant: {
        default: 'border-input',
        error: 'border-destructive focus-visible:ring-destructive',
      },
      selectSize: {
        sm: 'h-9 text-xs',
        md: 'h-10',
        lg: 'h-11 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      selectSize: 'md',
    },
  }
);

export interface SelectProps
  extends
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  /** Error message */
  error?: string;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Options array */
  options?: Array<{ value: string; label: string }>;
}

/**
 * Select dropdown component.
 *
 * @example
 * ```tsx
 * <Select
 *   label="Category"
 *   options={[
 *     { value: 'produce', label: 'Produce' },
 *     { value: 'dairy', label: 'Dairy' }
 *   ]}
 * />
 * ```
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      variant,
      selectSize,
      className,
      error,
      label,
      helperText,
      options,
      children,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substring(7)}`;
    const hasError = !!error;
    const finalVariant = hasError ? 'error' : variant;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {props.required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            selectVariants({ variant: finalVariant, selectSize }),
            className
          )}
          {...props}
        >
          {options
            ? options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            : children}
        </select>
        {(error || helperText) && (
          <p
            className={cn(
              'text-xs',
              error ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { selectVariants };
