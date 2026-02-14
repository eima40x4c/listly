'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  RadixSelect as Select,
  RadixSelectContent as SelectContent,
  RadixSelectItem as SelectItem,
  RadixSelectTrigger as SelectTrigger,
  RadixSelectValue as SelectValue,
} from '@/components/ui/RadixSelect/RadixSelect';
import { useCreatePantryItem } from '@/hooks/usePantry';
import type { CreatePantryItemInput } from '@/lib/validation/schemas/pantry-item';
import { createPantryItemSchema } from '@/lib/validation/schemas/pantry-item';

interface AddPantryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOCATIONS = ['Pantry', 'Fridge', 'Freezer', 'Cabinet'];

export function AddPantryItemModal({
  isOpen,
  onClose,
}: AddPantryItemModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createItem = useCreatePantryItem();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePantryItemInput>({
    resolver: zodResolver(createPantryItemSchema),
    defaultValues: {
      quantity: 1,
      unit: 'pcs',
      location: 'Pantry',
    },
  });

  const location = watch('location');

  const onSubmit = async (data: CreatePantryItemInput) => {
    setIsSubmitting(true);
    try {
      await createItem.mutateAsync(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to add item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="animate-modal-backdrop fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
        <div className="animate-modal-enter relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border bg-background shadow-2xl sm:max-w-lg sm:rounded-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Add Pantry Item</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Item Name <span className="text-destructive">*</span>
              </label>
              <Input
                {...register('name')}
                placeholder="e.g. Milk"
                autoFocus
                error={errors.name?.message}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Quantity & Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Quantity
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('quantity', { valueAsNumber: true })}
                />
                {errors.quantity && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Unit</label>
                <Input {...register('unit')} placeholder="e.g. pcs, kg, L" />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Location
              </label>
              <Select
                value={location}
                onValueChange={(val) => setValue('location', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expiration Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Expiration Date
              </label>
              <Input
                type="date"
                {...register('expirationDate', {
                  setValueAs: (v) => (v ? new Date(v) : undefined),
                })}
              />
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                isLoading={isSubmitting}
                className="flex-1"
              >
                Add Item
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
