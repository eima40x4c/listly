/**
 * LoginForm Component
 *
 * Form for user authentication with email and password.
 * Integrates with NextAuth for session management.
 *
 * @module components/features/auth/LoginForm
 */

'use client';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { useZodForm } from '@/hooks/useZodForm';
import { type LoginInput, loginSchema } from '@/lib/validation/schemas/user';

export interface LoginFormProps {
  /** Callback URL after successful login */
  callbackUrl?: string;
  /** Show toast notifications */
  showToast?: boolean;
}

/**
 * Login form with email and password fields
 *
 * @example
 * ```tsx
 * <LoginForm callbackUrl="/dashboard" />
 * ```
 */
export function LoginForm({ callbackUrl = '/dashboard' }: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useZodForm(loginSchema, {
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
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
                autoComplete="current-password"
                disabled={isLoading}
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
