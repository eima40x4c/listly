/**
 * Checkbox Component
 *
 * A checkbox input component with label support.
 *
 * @module components/ui/Checkbox
 */

import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
}

/**
 * Checkbox component with label and error support.
 *
 * @example
 * ```tsx
 * <Checkbox label="Accept terms and conditions" />
 * <Checkbox checked onChange={handleChange} />
 * <Checkbox error="This field is required" />
 * ```
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, helperText, error, className, id, ...props }, ref) => {
    const checkboxId =
      id || `checkbox-${Math.random().toString(36).substring(7)}`;

    if (!label) {
      return (
        <input
          type="checkbox"
          ref={ref}
          id={checkboxId}
          className={cn(
            'border-input text-primary focus:ring-ring h-4 w-4 rounded focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            ref={ref}
            id={checkboxId}
            className={cn(
              'border-input text-primary focus:ring-ring mt-0.5 h-4 w-4 rounded focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        </div>
        {(error || helperText) && (
          <p
            className={cn(
              'ml-6 text-xs',
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

Checkbox.displayName = 'Checkbox';
