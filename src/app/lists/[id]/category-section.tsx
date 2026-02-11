'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';

import { ListItemCard } from './list-item-card';

interface Item {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  isChecked: boolean;
  estimatedPrice?: number;
  actualPrice?: number;
  notes?: string;
  priority?: number;
  category?: {
    id: string;
    name: string;
    icon?: string;
  };
  addedBy?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  checkedBy?: {
    id: string;
    name: string;
  };
  checkedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface CategorySectionProps {
  categoryName: string;
  items: Item[];
  isExpanded: boolean;
  onToggle: () => void;
  mode: 'edit' | 'shopping';
  listId: string;
}

export function CategorySection({
  categoryName,
  items,
  isExpanded,
  onToggle,
  mode,
  listId,
}: CategorySectionProps) {
  // In shopping mode, separate checked and unchecked items
  const { activeItems, checkedItems } =
    mode === 'shopping'
      ? items.reduce(
          (acc, item) => {
            if (item.isChecked) {
              acc.checkedItems.push(item);
            } else {
              acc.activeItems.push(item);
            }
            return acc;
          },
          { activeItems: [] as Item[], checkedItems: [] as Item[] }
        )
      : { activeItems: items, checkedItems: [] as Item[] };

  return (
    <div className="space-y-2">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-muted"
      >
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">{categoryName}</h2>
          <span className="text-sm text-muted-foreground">
            ({items.length})
          </span>
        </div>

        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Items List */}
      {isExpanded && (
        <div className="space-y-2 pl-2">
          {/* Active items */}
          {activeItems.map((item) => (
            <ListItemCard
              key={item.id}
              item={item}
              listId={listId}
              mode={mode}
            />
          ))}

          {/* Checked items (in shopping mode) */}
          {mode === 'shopping' && checkedItems.length > 0 && (
            <>
              {activeItems.length > 0 && (
                <div className="my-2 border-t pt-2">
                  <span className="text-xs text-muted-foreground">
                    Completed
                  </span>
                </div>
              )}
              {checkedItems.map((item) => (
                <ListItemCard
                  key={item.id}
                  item={item}
                  listId={listId}
                  mode={mode}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
