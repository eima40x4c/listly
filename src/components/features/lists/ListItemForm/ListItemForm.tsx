/**
 * ListItemForm Component
 *
 * Form for adding and editing items in a shopping list with name,
 * quantity, unit, category, and price estimation.
 *
 * @module components/features/lists/ListItemForm
 */

'use client';

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
import { useCreateItem, useUpdateItem } from '@/hooks/api/useItems';
import { useZodForm } from '@/hooks/useZodForm';
import {
  type CreateListItemInput,
  createListItemSchema,
} from '@/lib/validation/schemas/list-item';

export interface ListItemFormProps {
  /** Shopping list ID */
  listId: string;
  /** Existing item for editing */
  item?: {
    id: string;
    name: string;
    quantity?: number | null;
    unit?: string | null;
    notes?: string | null;
    categoryId?: string | null;
    estimatedPrice?: number | null;
    priority?: number | null;
  };
  /** Available categories */
  categories?: Array<{ id: string; name: string }>;
  /** Callback after successful save */
  onSuccess?: () => void;
  /** Callback to cancel */
  onCancel?: () => void;
}

/**
 * List item creation/editing form
 *
 * @example
 * ```tsx
 * <ListItemForm listId="123" categories={categories} />
 * <ListItemForm listId="123" item={existingItem} categories={categories} />
 * ```
 */
export function ListItemForm({
  listId,
  item,
  categories = [],
  onSuccess,
  onCancel,
}: ListItemFormProps) {
  const isEditing = !!item;
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateItem(listId);
  const updateMutation = useUpdateItem(listId);

  const form = useZodForm(createListItemSchema, {
    defaultValues: {
      name: item?.name ?? '',
      quantity: item?.quantity ?? 1,
      unit: item?.unit ?? '',
      notes: item?.notes ?? '',
      categoryId: item?.categoryId ?? undefined,
      estimatedPrice: item?.estimatedPrice ?? undefined,
      priority: item?.priority ?? 0,
    },
  });

  async function onSubmit(data: CreateListItemInput) {
    setError(null);

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          itemId: item.id,
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }

      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('Failed to save item. Please try again.');
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

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
            <FormLabel required>Item Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Milk, Bread, Apples..."
                disabled={isLoading}
                {...form.register('name')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField name="quantity">
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="1"
                  disabled={isLoading}
                  {...form.register('quantity')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="unit">
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <FormControl>
                <Input
                  placeholder="lbs, oz, kg..."
                  disabled={isLoading}
                  {...form.register('unit')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        {categories.length > 0 && (
          <FormField name="categoryId">
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Controller
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <RadixSelect
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <RadixSelectTrigger>
                        <RadixSelectValue placeholder="Select category (optional)" />
                      </RadixSelectTrigger>
                    </FormControl>
                    <RadixSelectContent>
                      {categories.map((category) => (
                        <RadixSelectItem key={category.id} value={category.id}>
                          {category.name}
                        </RadixSelectItem>
                      ))}
                    </RadixSelectContent>
                  </RadixSelect>
                )}
              />
              <FormDescription>Helps with aisle sorting</FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>
        )}

        <FormField name="estimatedPrice">
          <FormItem>
            <FormLabel>Estimated Price ($)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                disabled={isLoading}
                {...form.register('estimatedPrice')}
              />
            </FormControl>
            <FormDescription>
              Optional price estimate for budget tracking
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="notes">
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <textarea
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Brand preferences, specific varieties..."
                disabled={isLoading}
                {...form.register('notes')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <div className="flex gap-2">
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? 'Update Item' : 'Add Item'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
