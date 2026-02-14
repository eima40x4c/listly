/**
 * Recipes Collection Screen
 *
 * Wireframe §9: Recipe grid with category tabs,
 * sort, grid/list view toggle, and recipe cards.
 * "New" and "Add Recipe" buttons now open CreateRecipeModal.
 */

'use client';

import { Grid3X3, Link as LinkIcon, List, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { CreateRecipeModal } from '@/components/features/recipes/CreateRecipeModal';
import { AppShell } from '@/components/layout/AppShell';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useComingSoon } from '@/hooks/useComingSoon';
import { useRecipes } from '@/hooks/useRecipes';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores';

// --- Constants ---
const CATEGORIES = [
  'All',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Dessert',
] as const;
const SORT_OPTIONS = ['Recent', 'Name', 'Time', 'Rating'] as const;

export default function RecipesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('Recent');
  const { viewMode, setViewMode } = useSettingsStore();
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const { showComingSoon } = useComingSoon();

  const { data, isLoading } = useRecipes();
  const recipes = data?.data || [];

  const filtered = recipes
    .filter((r) => {
      // Note: We don't strictly have a category field on recipe schema yet (it's implicit or missing),
      // but for now we might filter by checking if any text matches or just ignore.
      // Re-reading schema: Recipe table has NO category field. It has `cuisine`.
      // The mock data had category. I'll rely on client side filtering if we had it, or ignore for now.
      // Actually, let's filter by nothing for category unless we add it to schema.
      // Wait, let's filter by cuisine if it matches category name, or just ignore since we lack metadata.
      // For now, I will NOT filter by category strictly unless I update schema, but I'll leave the UI there.

      if (search && !r.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'Name') return a.title.localeCompare(b.title);
      if (sortBy === 'Time')
        return (
          (a.prepTime || 0) +
          (a.cookTime || 0) -
          ((b.prepTime || 0) + (b.cookTime || 0))
        );
      // Recent is default (by createdAt usually)
      return 0;
    });

  return (
    <AppShell>
      <Container className="py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Recipes</h1>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Import recipe URL"
              onClick={() => showComingSoon('Recipe Import')}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => setShowRecipeModal(true)}>
              <Plus className="mr-1 h-4 w-4" />
              New
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Tabs (Visual only for now as schema lacks category) */}
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort & View Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border bg-background px-2 py-1 text-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="flex rounded-lg border">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-l-lg p-2 transition-colors',
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded-r-lg p-2 transition-colors',
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading recipes...
          </div>
        ) : (
          <>
            {/* Recipe Cards */}
            <div
              className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-2 gap-4 lg:grid-cols-3'
                  : 'space-y-3'
              )}
            >
              {filtered.map((recipe) => (
                <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                  <Card
                    className={cn(
                      'animate-fade-in cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg',
                      viewMode === 'list' && 'flex flex-row items-center'
                    )}
                  >
                    {/* Placeholder Image */}
                    <div
                      className={cn(
                        'flex items-center justify-center bg-muted',
                        // recipe.imageColor, // We don't save color yet
                        viewMode === 'grid'
                          ? 'h-32 w-full'
                          : 'h-20 w-20 shrink-0'
                      )}
                    >
                      <span className="text-3xl">🍲</span>
                    </div>
                    <div className="p-3">
                      <p className="font-medium">{recipe.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min ·{' '}
                        {recipe.servings} servings
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {recipe.cuisine || 'Unknown Cuisine'}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-muted text-3xl">
                  👨‍🍳
                </div>
                <h3 className="mb-2 text-lg font-semibold">No recipes yet</h3>
                <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                  Add your favorite recipes or import them from a URL.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setShowRecipeModal(true)}>
                    Add Recipe
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => showComingSoon('Recipe Import')}
                  >
                    <LinkIcon className="mr-1 h-4 w-4" />
                    Import URL
                  </Button>
                </div>
              </div>
            )}

            {/* FAB */}
            <Button
              className="fixed bottom-20 right-4 z-30 h-14 w-14 rounded-full shadow-lg md:bottom-4"
              size="icon"
              aria-label="Add recipe"
              onClick={() => setShowRecipeModal(true)}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </>
        )}
      </Container>

      {/* Create Recipe Modal */}
      <CreateRecipeModal
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
      />
    </AppShell>
  );
}
