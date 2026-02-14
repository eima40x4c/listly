'use client';

import {
  ArrowLeft,
  CheckCircle,
  Mic,
  MoreVertical,
  Plus,
  Share2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCallback, useMemo, useState } from 'react';

import { Container, Header } from '@/components/layout';
import { Badge, Button, Input } from '@/components/ui';
import { ErrorMessage } from '@/components/ui';
import { useCreateItem, useListItems } from '@/hooks/api/useItems';
import { useList } from '@/hooks/api/useLists';
import { cn } from '@/lib/utils';
import { getCurrencySymbol } from '@/lib/utils/formatCurrency';
import { useSettingsStore } from '@/stores/useSettingsStore';

import { CategorySection } from './category-section';
import { EditListModal } from './edit-list-modal';
import { EmptyItemsState } from './empty-items-state';
import { ShareListModal } from './share-list-modal';

interface ListDetailContentProps {
  listId: string;
}

type ViewMode = 'edit' | 'shopping';

export function ListDetailContent({ listId }: ListDetailContentProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>('edit');
  const currency = useSettingsStore((s) => s.currency);
  const currencySymbol = getCurrencySymbol(currency);
  const [itemInput, setItemInput] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['all'])
  );
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch list and items
  const {
    data: listResponse,
    isLoading: listLoading,
    error: listError,
  } = useList(listId, 'items,collaborators');

  const {
    data: itemsResponse,
    isLoading: _itemsLoading,
    error: itemsError,
    refetch: refetchItems,
  } = useListItems(listId);

  const createItemMutation = useCreateItem(listId);

  const list = listResponse;
  const items = useMemo(() => itemsResponse || [], [itemsResponse]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof items> = {};

    items.forEach((item) => {
      const categoryName = item.category?.name || 'Uncategorized';
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(item);
    });

    return groups;
  }, [items]);

  // Sort categories for shopping mode (by aisle)
  const sortedCategories = useMemo(() => {
    const categories = Object.keys(groupedItems);

    if (mode === 'shopping') {
      // In shopping mode, sort by aisle/store layout
      // For now, just alphabetical - would use store layout in production
      return categories.sort();
    }

    return categories;
  }, [groupedItems, mode]);

  // Calculate progress
  const progress = useMemo(() => {
    if (items.length === 0) return { completed: 0, total: 0, percent: 0 };

    const completed = items.filter((item) => item.isChecked).length;
    const total = items.length;
    const percent = Math.round((completed / total) * 100);

    return { completed, total, percent };
  }, [items]);

  // Handlers
  const handleAddItem = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!itemInput.trim()) return;

      try {
        await createItemMutation.mutateAsync({
          name: itemInput.trim(),
          quantity: 1,
        });

        setItemInput('');
        refetchItems();
      } catch (error) {
        console.error('Failed to add item:', error);
      }
    },
    [itemInput, createItemMutation, refetchItems]
  );

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const handleFinishShopping = useCallback(async () => {
    if (!confirm('Mark all items as checked and finish shopping?')) return;

    try {
      // Mark all unchecked items as checked
      const uncheckedItems = items.filter((item) => !item.isChecked);

      for (const item of uncheckedItems) {
        await fetch(`/api/v1/lists/${listId}/items/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isChecked: true }),
        });
      }

      refetchItems();
      alert('Shopping completed!');
    } catch (error) {
      console.error('Failed to finish shopping:', error);
      alert('Failed to complete shopping. Please try again.');
    }
  }, [items, listId, refetchItems]);

  // Calculate budget totals
  const budgetInfo = useMemo(() => {
    if (!list || !list.budget) return null;

    const estimated = items.reduce(
      (sum, item) => sum + (Number(item.estimatedPrice) || 0) * item.quantity,
      0
    );
    const actual = items
      .filter((item) => item.isChecked)
      .reduce(
        (sum, item) =>
          sum +
          (Number(item.actualPrice) || Number(item.estimatedPrice) || 0) *
            item.quantity,
        0
      );

    const budget = Number(list.budget);
    const spent = mode === 'shopping' ? actual : estimated;
    const percent = Math.min(Math.round((spent / budget) * 100), 100);
    const isOverBudget = spent > budget;

    return { budget, spent, percent, isOverBudget };
  }, [list, items, mode]);

  // Handle 404
  if (listError && (listError as { status?: number }).status === 404) {
    notFound();
  }

  // Error state
  if (listError || itemsError) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header user={session?.user} />
        <Container className="flex flex-1 items-center justify-center py-12">
          <ErrorMessage
            error={listError || itemsError || new Error('Unknown error')}
            retry={() => window.location.reload()}
          />
        </Container>
      </div>
    );
  }

  // Loading state
  if (listLoading || !list) {
    return null; // Skeleton is shown by Suspense
  }

  const hasItems = items.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex flex-1 items-center gap-2">
          <span className="text-xl">{list.icon || '🛒'}</span>
          <h1 className="text-lg font-semibold">{list.name}</h1>
          {list.isTemplate && (
            <Badge variant="secondary" className="text-xs">
              Template
            </Badge>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Share list"
          onClick={() => setShowShareModal(true)}
        >
          <Share2 className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="More options"
          onClick={() => setShowEditModal(true)}
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </header>

      {/* Add Item Input (sticky) */}
      <div className="sticky top-14 z-10 border-b bg-background p-4">
        <form onSubmit={handleAddItem} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Add item..."
              value={itemInput}
              onChange={(e) => setItemInput(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0"
              aria-label="Voice input"
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
          <Button type="submit" size="icon" disabled={!itemInput.trim()}>
            <Plus className="h-5 w-5" />
          </Button>
        </form>
      </div>

      {/* Mode Toggle & Progress */}
      <div className="border-b bg-background px-4 py-3">
        <div className="mb-3 flex gap-2">
          <Button
            variant={mode === 'edit' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setMode('edit')}
          >
            Edit Mode
          </Button>
          <Button
            variant={mode === 'shopping' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setMode('shopping')}
          >
            Shopping Mode
          </Button>
        </div>

        {mode === 'shopping' && hasItems && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {progress.completed} of {progress.total} items
              </span>
              <span className="font-medium">{progress.percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}

        {budgetInfo && (
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget</span>
              <span
                className={cn(
                  'font-medium',
                  budgetInfo.isOverBudget && 'text-destructive'
                )}
              >
                {currencySymbol}
                {budgetInfo.spent.toFixed(2)} / {currencySymbol}
                {budgetInfo.budget.toFixed(2)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full transition-all',
                  budgetInfo.isOverBudget ? 'bg-destructive' : 'bg-success'
                )}
                style={{ width: `${budgetInfo.percent}%` }}
              />
            </div>
            {budgetInfo.isOverBudget && (
              <p className="text-xs text-destructive">
                Over budget by {currencySymbol}
                {(budgetInfo.spent - budgetInfo.budget).toFixed(2)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        <Container className="py-4">
          {!hasItems ? (
            <EmptyItemsState />
          ) : (
            <div className="space-y-6">
              {sortedCategories.map((categoryName) => (
                <CategorySection
                  key={categoryName}
                  categoryName={categoryName}
                  items={groupedItems[categoryName]}
                  isExpanded={
                    expandedCategories.has(categoryName) ||
                    expandedCategories.has('all')
                  }
                  onToggle={() => toggleCategory(categoryName)}
                  mode={mode}
                  listId={listId}
                />
              ))}

              {/* Finish Shopping Button */}
              {mode === 'shopping' && hasItems && (
                <div className="pt-4">
                  <Button
                    onClick={handleFinishShopping}
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={progress.percent < 100}
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    {progress.percent === 100
                      ? 'Finish Shopping'
                      : `Complete ${progress.total - progress.completed} more items`}
                  </Button>
                </div>
              )}
            </div>
          )}
        </Container>
      </main>

      {/* Modals */}
      {showShareModal && (
        <ShareListModal
          listId={listId}
          listName={list.name}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showEditModal && (
        <EditListModal
          listId={listId}
          listName={list.name}
          listIcon={list.icon}
          listColor={list.color}
          listBudget={list.budget ? Number(list.budget) : undefined}
          onClose={() => setShowEditModal(false)}
          onUpdate={() => window.location.reload()}
        />
      )}
    </div>
  );
}

export default ListDetailContent;
