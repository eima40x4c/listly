/**
 * RegisterForm Component
 *
 * Form for user registration with name, email, and password.
 * Creates a new user account via API endpoint.
 *
 * @module components/features/auth/RegisterForm
 */

'use client';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { useZodForm } from '@/hooks/useZodForm';
import {
  type RegisterInput,
  registerSchema,
} from '@/lib/validation/schemas/user';

export interface RegisterFormProps {
  /** Callback URL after successful registration */
  callbackUrl?: string;
}

/**
 * Registration form with name, email, and password fields
 *
 * @example
 * ```tsx
 * <RegisterForm callbackUrl="/dashboard" />
 * ```
 */
export function RegisterForm({
  callbackUrl = '/dashboard',
}: RegisterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useZodForm(registerSchema, {
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    setError(null);

    try {
      // Register user via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
        return;
      }

      // Auto-login after successful registration
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          'Registration successful but login failed. Please try logging in.'
        );
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <FormField name="name">
          <FormItem>
            <FormLabel required>Name</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                disabled={isLoading}
                {...form.register('name')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="email">
          <FormItem>
            <FormLabel required>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isLoading}
                {...form.register('email')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="password">
          <FormItem>
            <FormLabel required>Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                {...form.register('password')}
              />
            </FormControl>
            <FormDescription>
              Must be at least 8 characters with uppercase, lowercase, number,
              and special character
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create Account
        </Button>
      </form>
    </Form>
  );
}
