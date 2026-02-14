/**
 * Recipe Detail Screen
 *
 * Wireframe §10: Recipe detail page with hero image,
 * ingredients/instructions/notes tabs, and action buttons.
 */

'use client';

import {
  ArrowLeft,
  Clock,
  Heart,
  Minus,
  Pencil,
  Plus,
  ShoppingCart,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { AppShell } from '@/components/layout/AppShell';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useRecipe } from '@/hooks/useRecipes';
import { cn } from '@/lib/utils';

// --- Constants ---
const TABS = ['Ingredients', 'Instructions', 'Notes'] as const;

export default function RecipeDetailPage() {
  const params = useParams();
  const recipeId = params.id as string;
  const { data, isLoading, error } = useRecipe(recipeId);

  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]>('Ingredients');
  const [servingsMultiplier, setServingsMultiplier] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const recipe = data?.data;

  const currentServings = recipe
    ? Math.round((recipe.servings || 0) * servingsMultiplier)
    : 0;

  const handleUpdateServings = (newMultiplier: number) => {
    if (newMultiplier < 0.1) return;
    setServingsMultiplier(newMultiplier);
  };

  if (isLoading) {
    return (
      <AppShell>
        <Container className="flex items-center justify-center py-20">
          <div className="text-muted-foreground">Loading recipe...</div>
        </Container>
      </AppShell>
    );
  }

  if (error || !recipe) {
    return (
      <AppShell>
        <Container className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 text-destructive">Failed to load recipe</div>
          <Link
            href="/recipes"
            className={buttonVariants({ variant: 'outline' })}
          >
            Go Back
          </Link>
        </Container>
      </AppShell>
    );
  }

  // Parse ingredients from JSON or use relationship if structured
  // The repository returns `RecipeWithDetails` which has `ingredients: RecipeIngredient[]`.
  // RecipeIngredient has `name`, `quantity`, `unit`.

  const ingredients = recipe.ingredients || [];

  // Instructions are stored as a single string (often) or we need to standardized it.
  // The schema says `instructions` is `String` (Text). So we split by newline.
  const instructionsList = recipe.instructions
    .split('\n')
    .filter((line) => line.trim() !== '');

  return (
    <AppShell>
      {/* Hero Section */}
      <div
        className={cn(
          'relative flex h-48 items-center justify-center bg-muted'
          // recipe.imageColor
        )}
      >
        <Link
          href="/recipes"
          className="absolute left-4 top-4 rounded-full bg-background/80 p-2 backdrop-blur hover:bg-background"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="absolute right-4 top-4 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="rounded-full bg-background/80 p-2 backdrop-blur hover:bg-background"
          >
            <Heart
              className={cn(
                'h-5 w-5',
                isFavorite && 'fill-red-500 text-red-500'
              )}
            />
          </button>
          <button className="rounded-full bg-background/80 p-2 backdrop-blur hover:bg-background">
            <Pencil className="h-4 w-4" />
          </button>
        </div>
        <span className="text-6xl">🍲</span>
      </div>

      <Container className="py-6">
        {/* Recipe Info */}
        <h1 className="mb-2 text-2xl font-bold">{recipe.title}</h1>
        {recipe.description && (
          <p className="mb-4 text-sm text-muted-foreground">
            {recipe.description}
          </p>
        )}

        {/* Meta */}
        <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {recipe.servings} servings (orig)
          </div>
          {recipe.cuisine && <span>{recipe.cuisine}</span>}
        </div>

        {/* Tags - We don't have tags in schema yet, but if we did: */}
        {/*
        <div className="mb-6 flex flex-wrap gap-2">
          {mockRecipe.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        */}

        {/* Servings Control */}
        <Card className="mb-6 flex items-center justify-between p-3">
          <span className="text-sm font-medium">Yields</span>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleUpdateServings(servingsMultiplier - 0.5)}
              disabled={servingsMultiplier <= 0.5}
              aria-label="Decrease servings"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-semibold">
              {currentServings}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleUpdateServings(servingsMultiplier + 0.5)}
              aria-label="Increase servings"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <div className="mb-4 flex border-b">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'Ingredients' && (
            <div className="space-y-2">
              {ingredients.map((ing, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-sm">{ing.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {(Number(ing.quantity) * servingsMultiplier).toFixed(
                      Number.isInteger(
                        Number(ing.quantity) * servingsMultiplier
                      )
                        ? 0
                        : 2
                    )}{' '}
                    {ing.unit}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Instructions' && (
            <ol className="space-y-4">
              {instructionsList.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed">{step}</p>
                </li>
              ))}
              {instructionsList.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No instructions provided.
                </p>
              )}
            </ol>
          )}

          {activeTab === 'Notes' && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              No notes available for this recipe.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-3">
          <Button
            className="flex-1"
            onClick={() => toast.info('Coming soon: Add to shopping list')}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Shopping List
          </Button>
        </div>
      </Container>
    </AppShell>
  );
}
