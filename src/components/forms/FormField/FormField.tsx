/**
 * FormField Component
 *
 * A form field wrapper component that integrates with React Hook Form.
 * Provides consistent error handling and labeling.
 *
 * @module components/forms/FormField
 */

import { type HTMLAttributes } from 'react';

import { Label } from '@/components/ui/Label';
import { cn } from '@/lib/utils';

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Field label */
  label?: string;
  /** Field name/id */
  name: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Required field indicator */
  required?: boolean;
}

/**
 * FormField wrapper component for form inputs.
 *
 * @example
 * ```tsx
 * <FormField label="Email" name="email" error={errors.email?.message}>
 *   <Input {...register('email')} />
 * </FormField>
 * ```
 */
export function FormField({
  label,
  name,
  error,
  helperText,
  required,
  children,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {label && (
        <Label htmlFor={name} required={required}>
          {label}
        </Label>
      )}
      {children}
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

FormField.displayName = 'FormField';
