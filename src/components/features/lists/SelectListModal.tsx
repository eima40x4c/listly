/**
 * SelectListModal Component
 *
 * Modal to pick an existing shopping list or create a new one
 * when adding recipe ingredients to a list.
 *
 * @module components/features/lists/SelectListModal
 */

'use client';

import { Plus, ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLists } from '@/hooks/api/useLists';
import { cn } from '@/lib/utils';

interface SelectListModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: string[];
  recipeName: string;
}

export function SelectListModal({
  isOpen,
  onClose,
  ingredients,
  recipeName,
}: SelectListModalProps) {
  const { data: lists, isLoading } = useLists({ status: 'ACTIVE' });
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');
  const [showNewList, setShowNewList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!selectedListId && !newListName.trim()) return;

    setIsSubmitting(true);
    try {
      // TODO: Wire to actual list items API when ready
      const listName = selectedListId
        ? lists?.find((l) => l.id === selectedListId)?.name
        : newListName;

      toast.success(`Added ${ingredients.length} ingredients to "${listName}"`);
      onClose();
    } catch {
      toast.error('Failed to add ingredients');
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
        <div className="animate-modal-enter relative max-h-[85vh] w-full overflow-y-auto rounded-t-2xl border bg-background shadow-2xl sm:max-w-md sm:rounded-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Add to List</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">
              Add {ingredients.length} ingredient
              {ingredients.length !== 1 ? 's' : ''} from{' '}
              <strong className="text-foreground">{recipeName}</strong> to a
              shopping list.
            </p>

            {/* Existing Lists */}
            {!showNewList && (
              <div className="space-y-2">
                {isLoading ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Loading lists...
                  </div>
                ) : lists && lists.length > 0 ? (
                  lists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => setSelectedListId(list.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                        selectedListId === list.id
                          ? 'border-primary bg-primary/10'
                          : 'hover:bg-muted'
                      )}
                    >
                      <span className="text-lg">{list.icon || '🛒'}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{list.name}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No lists found. Create a new one below.
                  </p>
                )}

                <button
                  onClick={() => setShowNewList(true)}
                  className="flex w-full items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Create new list
                </button>
              </div>
            )}

            {/* New List Input */}
            {showNewList && (
              <div className="space-y-2">
                <Input
                  placeholder="New list name..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={() => {
                    setShowNewList(false);
                    setNewListName('');
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ← Back to existing lists
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleAdd}
                disabled={
                  (!selectedListId && !newListName.trim()) || isSubmitting
                }
                isLoading={isSubmitting}
                className="flex-1"
              >
                Add Ingredients
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
