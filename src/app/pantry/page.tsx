/**
 * Pantry Screen
 *
 * Wireframe §6: Pantry inventory with location tabs,
 * expiring-soon section, and category groups.
 */

'use client';

import { AlertTriangle, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { AddPantryItemModal } from '@/components/features/pantry/AddPantryItemModal';
import { AppShell } from '@/components/layout/AppShell';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CustomSelect } from '@/components/ui/CustomSelect/CustomSelect';
import { Input } from '@/components/ui/Input';
import { useDeletePantryItem, usePantry } from '@/hooks/usePantry';
import { cn } from '@/lib/utils';
import type { PantryItemWithDetails } from '@/repositories/interfaces/pantry-repository.interface';

// --- Constants ---
const LOCATIONS = ['All', 'Pantry', 'Fridge', 'Freezer', 'Cabinet'] as const;
const SORT_OPTIONS = [
  'Expiring Soon',
  'Name',
  'Category',
  'Date Added',
] as const;

function ExpiryBadge({ date }: { date: Date | null | string }) {
  if (!date) return null;
  const expiry = new Date(date);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (days <= 3) {
    return (
      <Badge variant="danger" className="animate-pulse-warning text-xs">
        ⚠️ {days} days
      </Badge>
    );
  }
  if (days <= 7) {
    return (
      <Badge className="bg-orange-500/10 text-xs text-orange-600 dark:text-orange-400">
        ⚠️ {days} days
      </Badge>
    );
  }
  return <span className="text-xs text-muted-foreground">{days} days</span>;
}

export default function PantryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLocation, setActiveLocation] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('Expiring Soon');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch Data
  const { data, isLoading } = usePantry();
  const deleteItem = useDeletePantryItem();

  const items = data?.data || [];

  const filteredItems = items
    .filter((item) => {
      // Filter by Location
      if (activeLocation !== 'All' && item.location !== activeLocation)
        return false;

      // Filter by Search
      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;

      // Filter out consumed items (optional, depending on UX)
      if (item.isConsumed) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'Expiring Soon') {
        const dateA = a.expirationDate
          ? new Date(a.expirationDate).getTime()
          : Infinity;
        const dateB = b.expirationDate
          ? new Date(b.expirationDate).getTime()
          : Infinity;
        return dateA - dateB;
      }
      if (sortBy === 'Name') return a.name.localeCompare(b.name);
      if (sortBy === 'Date Added')
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      return 0;
    });

  const expiringItems = filteredItems.filter((i) => {
    if (!i.expirationDate) return false;
    const days = Math.ceil(
      (new Date(i.expirationDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    );
    return days <= 7;
  });

  const regularItems = filteredItems.filter((i) => !expiringItems.includes(i));

  // Group regular items by category
  const groupedItems = regularItems.reduce<
    Record<string, PantryItemWithDetails[]>
  >((acc, item) => {
    const categoryName = item.category?.name || 'Uncategorized';
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(item);
    return acc;
  }, {});

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteItem.mutateAsync(id);
    }
  };

  return (
    <AppShell>
      <Container className="py-6">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Pantry</h1>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search pantry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Location Tabs */}
        <div className="no-scrollbar mb-4 flex max-w-full gap-2 overflow-x-auto pb-2">
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              onClick={() => setActiveLocation(loc)}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                activeLocation === loc
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {loc}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Sort:</span>
          <CustomSelect
            options={SORT_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            className="w-44"
          />
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading pantry...
          </div>
        ) : (
          <>
            {/* Expiring Soon Section */}
            {expiringItems.length > 0 && (
              <div className="mb-6 animate-fade-in">
                <div className="mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    Expiring Soon
                  </h2>
                </div>
                <div className="space-y-2">
                  {expiringItems.map((item) => (
                    <Card
                      key={item.id}
                      className="animate-slide-in-top p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {item.category?.icon || '📦'}
                          </span>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity.toString()} {item.unit}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              📍 {item.location || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ExpiryBadge date={item.expirationDate} />
                          <button
                            onClick={(e) => handleDelete(e, item.id)}
                            className="p-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Category Groups */}
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="mb-6">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {category}
                  <span className="text-xs font-normal">({items.length})</span>
                </h2>
                <div className="space-y-2">
                  {items.map((item) => (
                    <Card
                      key={item.id}
                      className="p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {item.category?.icon || '📦'}
                          </span>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity.toString()} {item.unit}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              📍 {item.location || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ExpiryBadge date={item.expirationDate} />
                          <button
                            onClick={(e) => handleDelete(e, item.id)}
                            className="p-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-muted text-3xl">
                  🏺
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  Your pantry is empty
                </h3>
                <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                  Start tracking your inventory to reduce waste and save money!
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    Add Items to Pantry
                  </Button>
                  <Button variant="outline">📷 Scan Barcode</Button>
                </div>
              </div>
            )}
          </>
        )}
      </Container>

      <AddPantryItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </AppShell>
  );
}
