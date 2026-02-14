'use client';

import { GripVertical, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Button, Checkbox, Input } from '@/components/ui';
import { useDeleteItem, useUpdateItem } from '@/hooks/api/useItems';
import { cn } from '@/lib/utils';
import { getCurrencySymbol } from '@/lib/utils/formatCurrency';
import { useSettingsStore } from '@/stores/useSettingsStore';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editQuantity, setEditQuantity] = useState(item.quantity);
  const [showMenu, setShowMenu] = useState(false);
  const currency = useSettingsStore((s) => s.currency);
  const currencySymbol = getCurrencySymbol(currency);

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

  const handleDelete = useCallback(async () => {
    if (confirm(`Delete "${item.name}"?`)) {
      try {
        await deleteItem.mutateAsync(item.id);
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
    setShowMenu(false);
  }, [item.id, item.name, deleteItem]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setShowMenu(false);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editName.trim()) {
      setIsEditing(false);
      setEditName(item.name);
      setEditQuantity(item.quantity);
      return;
    }

    const changes: Record<string, unknown> = {};
    if (editName.trim() !== item.name) changes.name = editName.trim();
    if (editQuantity !== item.quantity) changes.quantity = editQuantity;

    if (Object.keys(changes).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      await updateItem.mutateAsync({
        itemId: item.id,
        data: changes,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update item:', error);
      setEditName(item.name);
      setEditQuantity(item.quantity);
    }
  }, [editName, editQuantity, item.id, item.name, item.quantity, updateItem]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditName(item.name);
    setEditQuantity(item.quantity);
  }, [item.name, item.quantity]);

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
            {isEditing ? (
              <div className="flex gap-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  autoFocus
                  className="h-8 flex-1"
                  placeholder="Item name"
                />
                <input
                  type="number"
                  min={1}
                  value={editQuantity}
                  onChange={(e) =>
                    setEditQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  className="h-8 w-16 rounded-lg border border-input bg-background px-2 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            ) : (
              <p
                className={cn(
                  'font-medium',
                  item.isChecked && 'text-muted-foreground line-through'
                )}
                onDoubleClick={mode === 'edit' ? handleEdit : undefined}
              >
                {item.name}
              </p>
            )}

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
                <span>
                  {currencySymbol}
                  {typeof item.estimatedPrice === 'number'
                    ? item.estimatedPrice.toFixed(2)
                    : parseFloat(item.estimatedPrice as any).toFixed(2)}
                </span>
              )}

              {mode === 'edit' && item.addedBy && (
                <span>Added by {item.addedBy.name}</span>
              )}
            </div>
          </div>

          {/* Price (prominent in shopping mode) */}
          {mode === 'shopping' && item.estimatedPrice && (
            <div className="text-right">
              <p className="font-semibold">
                {currencySymbol}
                {item.estimatedPrice.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions Menu (edit mode only) */}
      {mode === 'edit' && !isEditing && (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            aria-label="Item options"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-md border bg-popover p-1 shadow-lg">
                <button
                  onClick={handleEdit}
                  className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-destructive hover:bg-accent"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
