/**
 * Form Component
 *
 * Form components built on top of react-hook-form for consistent
 * form handling, validation, and error display.
 *
 * @module components/ui/Form
 */

import * as React from 'react';
import { FormProvider, useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';

const Form = FormProvider;

// Form field context
interface FormFieldContextValue {
  name: string;
}

const FormFieldContext = React.createContext<FormFieldContextValue | undefined>(
  undefined
);

interface FormFieldProps {
  name: string;
  children: React.ReactNode;
}

function FormField({ name, children }: FormFieldProps) {
  return (
    <FormFieldContext.Provider value={{ name }}>
      {children}
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error('useFormField must be used within <FormField>');
  }

  const fieldState = getFieldState(fieldContext.name, formState);

  return {
    name: fieldContext.name,
    ...fieldState,
  };
}

// Form item wrapper
interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('space-y-2', className)} {...props} />;
  }
);
FormItem.displayName = 'FormItem';

// Form label
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, required, children, ...props }, ref) => {
    const { error } = useFormField();
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          error && 'text-destructive',
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
    );
  }
);
FormLabel.displayName = 'FormLabel';

// Form control wrapper
const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  const { error, name } = useFormField();

  return (
    <div
      ref={ref}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

// Form description
interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  FormDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

// Form error message
interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, ...props }, ref) => {
    const { error, name } = useFormField();
    const body = error?.message || children;

    if (!body) return null;

    return (
      <p
        ref={ref}
        id={`${name}-error`}
        className={cn('text-sm font-medium text-destructive', className)}
        {...props}
      >
        {body}
      </p>
    );
  }
);
FormMessage.displayName = 'FormMessage';

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
