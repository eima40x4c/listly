/**
 * useZodForm Hook
 *
 * Custom hook that combines react-hook-form with Zod validation.
 * Provides type-safe form handling with automatic schema validation.
 *
 * @module hooks/useZodForm
 */

import { zodResolver } from '@hookform/resolvers/zod';
import type { FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import type { z, ZodSchema } from 'zod';

/**
 * Create a type-safe form with Zod validation
 *
 * @template TSchema - Zod schema type
 * @template TFieldValues - Inferred form field values from schema
 * @param schema - Zod validation schema
 * @param options - Additional react-hook-form options
 * @returns Form instance with Zod validation
 *
 * @example
 * ```tsx
 * const loginSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8)
 * });
 *
 * function LoginForm() {
 *   const form = useZodForm(loginSchema, {
 *     defaultValues: { email: '', password: '' }
 *   });
 *
 *   async function onSubmit(data: z.infer<typeof loginSchema>) {
 *     await login(data);
 *   }
 *
 *   return (
 *     <form onSubmit={form.handleSubmit(onSubmit)}>
 *       <input {...form.register('email')} />
 *       <input {...form.register('password')} />
 *     </form>
 *   );
 * }
 * ```
 */
export function useZodForm<
  TSchema extends ZodSchema,
  TFieldValues extends FieldValues = z.infer<TSchema>,
>(
  schema: TSchema,
  options?: Omit<UseFormProps<TFieldValues>, 'resolver'>
): UseFormReturn<TFieldValues> {
  return useForm<TFieldValues>({
    resolver: zodResolver(schema),
    ...options,
  });
}
