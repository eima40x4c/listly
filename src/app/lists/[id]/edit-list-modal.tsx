'use client';

import { Palette, Tag, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { Button, Input } from '@/components/ui';

interface EditListModalProps {
  listId: string;
  listName: string;
  listIcon?: string;
  listColor?: string;
  listBudget?: number;
  onClose: () => void;
  onUpdate: () => void;
}

const ICONS = ['🛒', '📝', '🏪', '🏠', '🎁', '🎉', '💼', '🌟'];
const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#64748b', // slate
];

export function EditListModal({
  listId,
  listName,
  listIcon,
  listColor,
  listBudget,
  onClose,
  onUpdate,
}: EditListModalProps) {
  const router = useRouter();
  const [name, setName] = useState(listName);
  const [icon, setIcon] = useState(listIcon || '🛒');
  const [color, setColor] = useState(listColor || COLORS[0]);
  const [budget, setBudget] = useState(listBudget?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!name.trim()) {
        setError('List name is required');
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await fetch(`/api/v1/lists/${listId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            icon,
            color,
            budget: budget ? parseFloat(budget) : null,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to update list');
        }

        onUpdate();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update list');
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, icon, color, budget, listId, onClose, onUpdate]
  );

  const handleDelete = useCallback(async () => {
    if (!confirm(`Delete "${listName}"? This action cannot be undone.`)) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/v1/lists/${listId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete list');
      }

      router.push('/lists');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete list');
      setIsSubmitting(false);
    }
  }, [listId, listName, router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit List</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              List Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="My Shopping List"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              <Tag className="mb-1 inline h-4 w-4" /> Icon
            </label>
            <div className="grid grid-cols-8 gap-2">
              {ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`rounded border-2 p-2 text-2xl transition-colors ${
                    icon === emoji
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent hover:border-muted'
                  }`}
                  disabled={isSubmitting}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              <Palette className="mb-1 inline h-4 w-4" /> Color
            </label>
            <div className="grid grid-cols-8 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-10 w-10 rounded-full border-2 transition-transform ${
                    color === c
                      ? 'scale-110 border-primary'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  disabled={isSubmitting}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="budget" className="mb-2 block text-sm font-medium">
              Budget (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="pl-7"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          <div className="border-t pt-4">
            <Button
              type="button"
              variant="danger"
              className="w-full"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete List
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
