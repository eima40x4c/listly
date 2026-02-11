/**
 * ShoppingListForm Component
 *
 * Form for creating and editing shopping lists with name, description,
 * budget, color, and store selection.
 *
 * @module components/features/lists/ShoppingListForm
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller } from 'react-hook-form';

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
import {
  RadixSelect,
  RadixSelectContent,
  RadixSelectItem,
  RadixSelectTrigger,
  RadixSelectValue,
} from '@/components/ui/RadixSelect';
import { useCreateList, useUpdateList } from '@/hooks/api/useLists';
import { useZodForm } from '@/hooks/useZodForm';
import {
  type CreateShoppingListInput,
  createShoppingListSchema,
} from '@/lib/validation/schemas/shopping-list';

export interface ShoppingListFormProps {
  /** Existing list for editing */
  list?: {
    id: string;
    name: string;
    description?: string | null;
    budget?: number | null;
    color?: string | null;
    icon?: string | null;
    storeId?: string | null;
  };
  /** Available stores for selection */
  stores?: Array<{ id: string; name: string }>;
  /** Callback after successful save */
  onSuccess?: () => void;
}

/**
 * Shopping list creation/editing form
 *
 * @example
 * ```tsx
 * <ShoppingListForm stores={stores} />
 * <ShoppingListForm list={existingList} stores={stores} />
 * ```
 */
export function ShoppingListForm({
  list,
  stores = [],
  onSuccess,
}: ShoppingListFormProps) {
  const router = useRouter();
  const isEditing = !!list;
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateList();
  const updateMutation = useUpdateList();

  const form = useZodForm(createShoppingListSchema, {
    defaultValues: {
      name: list?.name ?? '',
      description: list?.description ?? '',
      budget: list?.budget ?? undefined,
      color: list?.color ?? undefined,
      icon: list?.icon ?? undefined,
      storeId: list?.storeId ?? undefined,
      isTemplate: false,
    },
  });

  async function onSubmit(data: CreateShoppingListInput) {
    setError(null);

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: list.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Failed to save shopping list. Please try again.');
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <FormField name="name">
          <FormItem>
            <FormLabel required>List Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Grocery Shopping"
                disabled={isLoading}
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
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Add notes about this list (optional)"
                disabled={isLoading}
                {...form.register('description')}
              />
            </FormControl>
            <FormDescription>
              Optional notes or reminders for this shopping list
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField name="budget">
            <FormItem>
              <FormLabel>Budget ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  disabled={isLoading}
                  {...form.register('budget')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="color">
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Input
                  type="color"
                  disabled={isLoading}
                  {...form.register('color')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        {stores.length > 0 && (
          <FormField name="storeId">
            <FormItem>
              <FormLabel>Store</FormLabel>
              <Controller
                control={form.control}
                name="storeId"
                render={({ field }) => (
                  <RadixSelect
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <RadixSelectTrigger>
                        <RadixSelectValue placeholder="Select a store (optional)" />
                      </RadixSelectTrigger>
                    </FormControl>
                    <RadixSelectContent>
                      {stores.map((store) => (
                        <RadixSelectItem key={store.id} value={store.id}>
                          {store.name}
                        </RadixSelectItem>
                      ))}
                    </RadixSelectContent>
                  </RadixSelect>
                )}
              />
              <FormDescription>
                Choose a store for optimized aisle sorting
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>
        )}

        <div className="flex gap-4">
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? 'Update List' : 'Create List'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
