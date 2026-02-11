'use client';

import { ArrowLeft, Mic, MoreVertical, Plus, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { Container, Header } from '@/components/layout';
import { Badge, Button, Input } from '@/components/ui';
import { ErrorMessage } from '@/components/ui';
import { useCreateItem, useListItems } from '@/hooks/api/useItems';
import { useList } from '@/hooks/api/useLists';

import { CategorySection } from './category-section';
import { EmptyItemsState } from './empty-items-state';

interface ListDetailContentProps {
  listId: string;
}

type ViewMode = 'edit' | 'shopping';

export function ListDetailContent({ listId }: ListDetailContentProps) {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>('edit');
  const [itemInput, setItemInput] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['all'])
  );

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

  const list = listResponse?.data;
  const items = useMemo(() => itemsResponse?.data || [], [itemsResponse?.data]);

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

  // Handle 404
  if (listError && (listError as { status?: number }).status === 404) {
    notFound();
  }

  // Error state
  if (listError || itemsError) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
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

        <Button variant="ghost" size="icon" aria-label="Share list">
          <Share2 className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" aria-label="More options">
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
            </div>
          )}
        </Container>
      </main>
    </div>
  );
}

export default ListDetailContent;
