# SOP-303: Form Handling

## Purpose

Implement consistent, user-friendly form handling with proper validation, error display, and submission management. Good form handling improves UX and reduces user frustration.

---

## Scope

- **Applies to:** All forms in the application
- **Covers:** Form state, validation, error handling, submission
- **Does not cover:** Backend validation (SOP-204), API design (SOP-200)

---

## Prerequisites

- [ ] SOP-300 (Component Architecture) completed
- [ ] SOP-204 (Validation) completed — Zod schemas exist
- [ ] UI form components created

---

## Procedure

### 1. Install Form Library

```bash
pnpm add react-hook-form @hookform/resolvers
```

### 2. Create Form Components

```typescript
// src/components/ui/Form/Form.tsx

import * as React from 'react';
import { useFormContext, Controller, FormProvider } from 'react-hook-form';
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
    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props} />
    );
  }
);
FormItem.displayName = 'FormItem';

// Form label
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, ...props }, ref) => {
    const { error } = useFormField();
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-medium leading-none',
          error && 'text-destructive',
          className
        )}
        {...props}
      />
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
interface FormDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

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
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
};
```

### 3. Create Input Component

```typescript
// src/components/ui/Input/Input.tsx

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'aria-[invalid=true]:border-destructive',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
```

### 4. Create Select Component

```typescript
// src/components/ui/Select/Select.tsx

'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
      'placeholder:text-muted-foreground',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
      'focus:bg-accent focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
};
```

Install Radix:

```bash
pnpm add @radix-ui/react-select
```

### 5. Create Form Hook Utility

```typescript
// src/hooks/useZodForm.ts

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormProps, type FieldValues } from 'react-hook-form';
import type { ZodSchema } from 'zod';

export function useZodForm<
  TSchema extends ZodSchema,
  TFieldValues extends FieldValues = z.infer<TSchema>,
>(schema: TSchema, options?: Omit<UseFormProps<TFieldValues>, 'resolver'>) {
  return useForm<TFieldValues>({
    resolver: zodResolver(schema),
    ...options,
  });
}
```

### 6. Complete Form Example

```typescript
// src/components/features/auth/LoginForm/LoginForm.tsx

'use client';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { useZodForm } from '@/hooks/useZodForm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/Form';
import { toast } from 'sonner';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useZodForm(loginSchema, {
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid email or password');
        return;
      }

      toast.success('Welcome back!');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField name="email">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...form.register('email')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="password">
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...form.register('password')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign In
        </Button>
      </form>
    </Form>
  );
}
```

### 7. Form with API Mutation

```typescript
// src/components/features/products/ProductForm/ProductForm.tsx

'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useZodForm } from '@/hooks/useZodForm';
import { useCreateProduct, useUpdateProduct } from '@/hooks/api/useProducts';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/Form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { toast } from 'sonner';
import { Controller } from 'react-hook-form';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().positive('Price must be positive'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  categoryId: z.string().min(1, 'Please select a category'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    categoryId: string;
  };
  categories: { id: string; name: string }[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const form = useZodForm(productSchema, {
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
      categoryId: product?.categoryId ?? '',
    },
  });

  async function onSubmit(data: ProductFormData) {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: product.id, data });
        toast.success('Product updated!');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Product created!');
      }
      router.push('/admin/products');
    } catch (error) {
      toast.error('Failed to save product');
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField name="name">
          <FormItem>
            <FormLabel>Product Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter product name"
                {...form.register('name')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="description">
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Product description (optional)"
                {...form.register('description')}
              />
            </FormControl>
            <FormDescription>
              Describe the product in detail.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField name="price">
            <FormItem>
              <FormLabel>Price ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...form.register('price')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="stock">
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  {...form.register('stock')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <FormField name="categoryId">
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Controller
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormMessage />
          </FormItem>
        </FormField>

        <div className="flex gap-4">
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? 'Update Product' : 'Create Product'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### 8. Server Action Forms (Next.js 14+)

```typescript
// src/app/contact/actions.ts

'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type ContactFormState = {
  errors?: {
    name?: string[];
    email?: string[];
    message?: string[];
  };
  message?: string;
  success?: boolean;
};

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const validatedFields = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Send email, save to database, etc.
  // await sendEmail(validatedFields.data);

  revalidatePath('/contact');

  return {
    success: true,
    message: "Thanks for your message! We'll be in touch.",
  };
}
```

```tsx
// src/app/contact/ContactForm.tsx

'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitContactForm, type ContactFormState } from './actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const initialState: ContactFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      Send Message
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useFormState(submitContactForm, initialState);

  if (state.success) {
    return (
      <div className="p-8 text-center">
        <p className="text-green-600">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <Input id="name" name="name" required />
        {state.errors?.name && (
          <p className="text-destructive mt-1 text-sm">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input id="email" name="email" type="email" required />
        {state.errors?.email && (
          <p className="text-destructive mt-1 text-sm">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          className="border-input bg-background flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm"
          required
        />
        {state.errors?.message && (
          <p className="text-destructive mt-1 text-sm">
            {state.errors.message[0]}
          </p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}
```

---

## Review Checklist

- [ ] React Hook Form installed
- [ ] Zod resolver configured
- [ ] Form components created (Form, FormField, etc.)
- [ ] Input components with proper styling
- [ ] Select component with Radix
- [ ] useZodForm hook created
- [ ] Forms validate on submit
- [ ] Error messages display clearly
- [ ] Loading states during submission
- [ ] Success feedback (toast/redirect)
- [ ] Accessibility (labels, aria attributes)

---

## AI Agent Prompt Template

```
Implement form handling for this project.

Read:
- `/docs/tech-stack.md` for framework
- `src/lib/validation/schemas/` for existing Zod schemas

Execute SOP-303 (Form Handling):
1. Install react-hook-form and resolvers
2. Create Form components
3. Create Input, Select components
4. Create useZodForm hook
5. Build main forms (Login, Register, etc.)
6. Integrate with API mutations
```

---

## Outputs

- [ ] `src/components/ui/Form/` — Form components
- [ ] `src/components/ui/Input/` — Input component
- [ ] `src/components/ui/Select/` — Select component
- [ ] `src/hooks/useZodForm.ts` — Form hook
- [ ] Feature forms in `src/components/features/*/`

---

## Related SOPs

- **SOP-204:** Validation (Zod schemas)
- **SOP-300:** Component Architecture (component patterns)
- **SOP-302:** API Integration (mutation hooks)
