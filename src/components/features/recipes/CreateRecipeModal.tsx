/**
 * CreateRecipeModal Component
 *
 * Modal for creating new recipes with name, category, prep time,
 * servings, difficulty, ingredients, and instructions.
 *
 * @module components/features/recipes/CreateRecipeModal
 */

'use client';

import { BookOpen, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateRecipe } from '@/hooks/useRecipes';
import { cn } from '@/lib/utils';
import type { CreateRecipeInput } from '@/lib/validation/schemas/recipe';

interface CreateRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export function CreateRecipeModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRecipeModalProps) {
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Dinner');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('4');
  const [difficulty, setDifficulty] = useState('Medium');
  const [ingredients, setIngredients] = useState<
    { name: string; quantity: number | string; unit: string }[]
  >([{ name: '', quantity: '', unit: '' }]);
  const [instructions, setInstructions] = useState<string[]>(['']);

  const createRecipe = useCreateRecipe();
  const isSubmitting = createRecipe.isPending;

  // Handlers
  const addIngredient = () =>
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  const removeIngredient = (i: number) =>
    setIngredients(ingredients.filter((_, idx) => idx !== i));
  const updateIngredient = (
    i: number,
    field: 'name' | 'quantity' | 'unit',
    value: string
  ) => {
    const updated = [...ingredients];
    updated[i] = { ...updated[i], [field]: value };
    setIngredients(updated);
  };

  const addInstruction = () => setInstructions([...instructions, '']);
  const removeInstruction = (i: number) =>
    setInstructions(instructions.filter((_, idx) => idx !== i));
  const updateInstruction = (i: number, value: string) => {
    const updated = [...instructions];
    updated[i] = value;
    setInstructions(updated);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('Dinner');
    setPrepTime('');
    setCookTime('');
    setServings('4');
    setDifficulty('Medium');
    setIngredients([{ name: '', quantity: '', unit: '' }]);
    setInstructions(['']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Filter out empty ingredients/instructions
    const validIngredients = ingredients
      .filter((i) => i.name.trim())
      .map((i, idx) => ({
        name: i.name.trim(),
        quantity: parseFloat(String(i.quantity)) || 0,
        unit: i.unit.trim(),
        sortOrder: idx,
      }));

    const validInstructions = instructions.filter((i) => i.trim()).join('\n'); // Join as single string for now as per schema or change schema to array

    const payload: CreateRecipeInput = {
      title: name,
      description,
      instructions: validInstructions,
      prepTime: parseInt(prepTime) || 0,
      cookTime: parseInt(cookTime) || 0,
      servings: parseInt(servings) || 1,
      difficulty: difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
      isPublic: false,
      ingredients: validIngredients,
    };

    try {
      await createRecipe.mutateAsync(payload);
      onSuccess?.();
      resetForm();
      onClose();
    } catch (error) {
      console.error(error);
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
        <div className="animate-modal-enter relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border bg-background shadow-2xl sm:max-w-lg sm:rounded-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">New Recipe</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Recipe Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Chicken Stir Fry"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Description{' '}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </label>
              <textarea
                className="flex min-h-[60px] w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Brief description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Category & Difficulty */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                        category === cat
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Difficulty
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DIFFICULTIES.map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                        difficulty === diff
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      )}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Prep Time & Servings */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Prep (min)
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="15"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Cook (min)
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="30"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Servings
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="4"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                />
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Ingredients
              </label>
              <div className="space-y-2">
                {ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Item"
                      className="flex-[2]"
                      value={ing.name}
                      onChange={(e) =>
                        updateIngredient(i, 'name', e.target.value)
                      }
                    />
                    <Input
                      placeholder="Qty"
                      className="flex-1"
                      type="number"
                      value={ing.quantity}
                      onChange={(e) =>
                        updateIngredient(i, 'quantity', e.target.value)
                      }
                    />
                    <Input
                      placeholder="Unit"
                      className="flex-1"
                      value={ing.unit}
                      onChange={(e) =>
                        updateIngredient(i, 'unit', e.target.value)
                      }
                    />
                    {ingredients.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIngredient(i)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addIngredient}
                  className="w-full"
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Ingredient
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Instructions
              </label>
              <div className="space-y-2">
                {instructions.map((inst, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="mt-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <textarea
                      className="flex min-h-[50px] w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder={`Step ${i + 1}...`}
                      value={inst}
                      onChange={(e) => updateInstruction(i, e.target.value)}
                    />
                    {instructions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInstruction(i)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addInstruction}
                  className="w-full"
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Step
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                isLoading={isSubmitting}
                className="flex-1"
              >
                Create Recipe
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
