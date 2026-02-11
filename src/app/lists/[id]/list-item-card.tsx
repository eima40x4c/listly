'use client';

import { GripVertical, MoreVertical } from 'lucide-react';
import { useCallback } from 'react';

import { Button, Checkbox } from '@/components/ui';
import { useDeleteItem, useUpdateItem } from '@/hooks/api/useItems';
import { cn } from '@/lib/utils';

interface Item {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  isChecked: boolean;
  estimatedPrice?: number;
  actualPrice?: number;
  notes?: string;
  addedBy?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

interface ListItemCardProps {
  item: Item;
  listId: string;
  mode: 'edit' | 'shopping';
}

export function ListItemCard({ item, listId, mode }: ListItemCardProps) {
  const updateItem = useUpdateItem(listId);
  const deleteItem = useDeleteItem(listId);

  const handleCheck = useCallback(async () => {
    try {
      await updateItem.mutateAsync({
        itemId: item.id,
        data: { isChecked: !item.isChecked },
      });
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  }, [item.id, item.isChecked, updateItem]);

  const _handleDelete = useCallback(async () => {
    if (confirm('Delete this item?')) {
      try {
        await deleteItem.mutateAsync(item.id);
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
  }, [item.id, deleteItem]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-card p-3 transition-opacity',
        item.isChecked && mode === 'shopping' && 'opacity-50'
      )}
    >
      {/* Drag Handle (edit mode only) */}
      {mode === 'edit' && (
        <button
          className="cursor-grab text-muted-foreground hover:text-foreground"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}

      {/* Checkbox */}
      <Checkbox
        checked={item.isChecked}
        onChange={handleCheck}
        className={cn(mode === 'shopping' && 'h-6 w-6')}
      />

      {/* Item Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'font-medium',
                item.isChecked && 'text-muted-foreground line-through'
              )}
            >
              {item.name}
            </p>

            {item.notes && (
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {item.notes}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {item.quantity > 1 && (
                <span>
                  {item.quantity} {item.unit || 'qty'}
                </span>
              )}

              {item.estimatedPrice && (
                <span>${item.estimatedPrice.toFixed(2)}</span>
              )}

              {mode === 'edit' && item.addedBy && (
                <span>Added by {item.addedBy.name}</span>
              )}
            </div>
          </div>

          {/* Price (prominent in shopping mode) */}
          {mode === 'shopping' && item.estimatedPrice && (
            <div className="text-right">
              <p className="font-semibold">${item.estimatedPrice.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions Menu (edit mode only) */}
      {mode === 'edit' && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Open dropdown menu
          }}
          aria-label="Item options"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
