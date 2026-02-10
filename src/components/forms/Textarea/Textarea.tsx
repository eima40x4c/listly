/**
 * Textarea Component
 *
 * A styled textarea component with label, error, and character count support.
 *
 * @module components/forms/Textarea
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-y',
  {
    variants: {
      variant: {
        default: 'border-input',
        error: 'border-destructive focus-visible:ring-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface TextareaProps
  extends
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  /** Error message */
  error?: string;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Show character count */
  showCount?: boolean;
}

/**
 * Textarea component.
 *
 * @example
 * ```tsx
 * <Textarea label="Description" rows={4} />
 * <Textarea showCount maxLength={500} />
 * <Textarea error="This field is required" />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      variant,
      className,
      error,
      label,
      helperText,
      showCount,
      maxLength,
      value,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).substring(7)}`;
    const hasError = !!error;
    const finalVariant = hasError ? 'error' : variant;
    const currentLength =
      typeof value === 'string' ? value.length : value?.toString().length || 0;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {props.required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(textareaVariants({ variant: finalVariant }), className)}
          maxLength={maxLength}
          value={value}
          {...props}
        />
        <div className="flex items-center justify-between">
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
          {showCount && maxLength && (
            <p className="ml-auto text-xs text-muted-foreground">
              {currentLength} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { textareaVariants };
