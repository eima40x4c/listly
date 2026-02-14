/**
 * CreateListModal Component
 *
 * Modal for creating new shopping lists.
 * Layout order: Name → Description → Items (mandatory, with quantity) → Budget (optional)
 * Icon picker and Color picker live in a collapsed "Customize" section.
 * Create button pulses when all required fields are filled.
 *
 * @module components/features/lists/CreateListModal
 */

'use client';

import {
  ChevronDown,
  Minus,
  Palette,
  Plus,
  ShoppingCart,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { getCurrencySymbol } from '@/lib/utils/formatCurrency';
import { useSettingsStore } from '@/stores/useSettingsStore';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ListItem {
  name: string;
  quantity: number;
}

const ICON_OPTIONS = [
  '🛒',
  '🏠',
  '🎄',
  '⭐',
  '🍽️',
  '🚗',
  '📚',
  '🎁',
  '🐶',
  '🌿',
  '💊',
  '🔧',
  '👶',
  '🧹',
  '🎉',
  '💄',
  '🏋️',
  '🎮',
  '📱',
  '✈️',
  '🎵',
  '🍎',
  '☕',
  '🍰',
  '🥩',
  '🐟',
  '🧀',
  '🥛',
  '🍜',
  '🥗',
  '🧃',
  '🍺',
];

const COLOR_OPTIONS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#64748b',
  '#78716c',
];

export function CreateListModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateListModalProps) {
  const router = useRouter();
  const currency = useSettingsStore((s) => s.currency);
  const currencySymbol = getCurrencySymbol(currency);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🛒');
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [budget, setBudget] = useState('');
  const [items, setItems] = useState<ListItem[]>([]);
  const [itemInput, setItemInput] = useState('');
  const [showCustomize, setShowCustomize] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Button pulse animation state
  const [shouldPulse, setShouldPulse] = useState(false);

  // Required: name + at least 1 item
  const isFormValid = useMemo(
    () => name.trim().length > 0 && items.length > 0,
    [name, items]
  );

  useEffect(() => {
    if (isFormValid) {
      setShouldPulse(true);
      const timer = setTimeout(() => setShouldPulse(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [isFormValid]);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setSelectedIcon('🛒');
      setSelectedColor('#6366f1');
      setBudget('');
      setItems([]);
      setItemInput('');
      setShowCustomize(false);
      setShouldPulse(false);
    }
  }, [isOpen]);

  const handleAddItem = useCallback(() => {
    const trimmed = itemInput.trim();
    if (trimmed && !items.some((i) => i.name === trimmed)) {
      setItems((prev) => [...prev, { name: trimmed, quantity: 1 }]);
      setItemInput('');
      // Pulse the create button after adding item
      setShouldPulse(true);
      setTimeout(() => setShouldPulse(false), 1200);
    }
  }, [itemInput, items]);

  const handleRemoveItem = useCallback((itemName: string) => {
    setItems((prev) => prev.filter((i) => i.name !== itemName));
  }, []);

  const handleQuantityChange = useCallback(
    (itemName: string, delta: number) => {
      setItems((prev) =>
        prev.map((i) =>
          i.name === itemName
            ? { ...i, quantity: Math.max(1, i.quantity + delta) }
            : i
        )
      );
    },
    []
  );

  const handleItemKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddItem();
      }
    },
    [handleAddItem]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Use the correct API endpoint
      const response = await fetch('/api/v1/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          icon: selectedIcon,
          color: selectedColor,
          budget: budget ? parseFloat(budget) : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to create list');

      const data = await response.json();
      const newList = data.data || data;

      // Add items if present
      if (items.length > 0 && newList.id) {
        await Promise.all(
          items.map((item) =>
            fetch(`/api/v1/lists/${newList.id}/items`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: item.name,
                quantity: item.quantity,
              }),
            })
          )
        );
      }

      onSuccess?.();
      onClose();
      router.refresh();
    } catch {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="animate-modal-backdrop fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
        <div
          className="animate-modal-enter relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border bg-background shadow-2xl sm:max-w-lg sm:rounded-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Create new list"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Create List</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            {/* ===== 1. List Name (required) ===== */}
            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                htmlFor="list-name"
              >
                List Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="list-name"
                placeholder="e.g. Weekly Groceries"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* ===== 2. Description (optional) ===== */}
            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                htmlFor="list-desc"
              >
                Description{' '}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </label>
              <textarea
                id="list-desc"
                className="flex min-h-[60px] w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Add notes about this list..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* ===== 3. Items (required — at least 1) ===== */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Items <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add an item..."
                  value={itemInput}
                  onChange={(e) => setItemInput(e.target.value)}
                  onKeyDown={handleItemKeyDown}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  disabled={!itemInput.trim()}
                  className="shrink-0 px-3"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Item List with Quantity Controls */}
              {items.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {items.map((item) => (
                    <div
                      key={item.name}
                      className="animate-slide-in-top flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2"
                    >
                      <span className="flex-1 text-sm">{item.name}</span>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.name, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.name, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:bg-muted"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.name)}
                        className="ml-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remove ${item.name}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {items.length === 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Add at least one item to create a list.
                </p>
              )}
            </div>

            {/* ===== 4. Budget (optional) ===== */}
            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                htmlFor="list-budget"
              >
                Budget{' '}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </label>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-sm font-medium text-muted-foreground">
                  {currencySymbol}
                </span>
                <input
                  id="list-budget"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm [appearance:textfield] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* ===== 5. Collapsed "Customize" Section (icon + color) ===== */}
            <div className="rounded-lg border">
              <button
                type="button"
                onClick={() => setShowCustomize(!showCustomize)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Customize
                  <span className="text-lg leading-none">{selectedIcon}</span>
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    showCustomize && 'rotate-180'
                  )}
                />
              </button>

              {showCustomize && (
                <div className="animate-dropdown-enter space-y-4 border-t px-4 py-4">
                  {/* Icon Picker */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">
                      Icon
                    </label>
                    <div className="grid grid-cols-8 gap-1.5">
                      {ICON_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setSelectedIcon(emoji)}
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all',
                            selectedIcon === emoji
                              ? 'scale-110 bg-primary/15 ring-2 ring-primary'
                              : 'bg-muted/50 hover:bg-muted'
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            'h-8 w-8 rounded-full transition-all',
                            selectedColor === color
                              ? 'scale-110'
                              : 'hover:scale-105'
                          )}
                          style={{
                            backgroundColor: color,
                            ...(selectedColor === color
                              ? {
                                  boxShadow: `0 0 0 2px var(--background), 0 0 0 4px ${color}`,
                                }
                              : {}),
                          }}
                          aria-label={`Color ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ===== Footer ===== */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                isLoading={isSubmitting}
                className={cn(
                  'flex-1',
                  shouldPulse && isFormValid && 'animate-button-pulse-ready'
                )}
              >
                Create List
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

CreateListModal.displayName = 'CreateListModal';
