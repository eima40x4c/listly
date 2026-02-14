/**
 * Meal Plan Screen
 *
 * Wireframe §8: Weekly meal calendar with day sections,
 * meal slots (Breakfast/Lunch/Dinner), and week navigator.
 */

'use client';

import { ChevronLeft, ChevronRight, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AppShell } from '@/components/layout/AppShell';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useMealPlans } from '@/hooks/useMealPlans';

// --- Constants ---
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'] as const;

export default function MealsPage() {
  const [weekOffset, setWeekOffset] = useState(0);

  // Calculate start/end dates for the selected week
  const today = new Date();
  const currentDay = today.getDay(); // 0 (Sun) to 6 (Sat)
  // Adjust to make Monday the first day (optional, but typical)
  const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff + weekOffset * 7));
  // Start of week (Monday)
  const startOfWeek = new Date(monday);
  startOfWeek.setHours(0, 0, 0, 0);

  // End of week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Fetch Data
  const { data, isLoading } = useMealPlans({
    startDate: startOfWeek,
    endDate: endOfWeek,
  });

  const mealPlans = data?.data || [];

  // Generate Days for the view
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    days.push({
      date: d,
      dayLabel: d
        .toLocaleDateString('en-US', { weekday: 'short' })
        .toUpperCase(),
      dateLabel: d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    });
  }

  const weekLabel =
    weekOffset === 0
      ? `Week of ${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${endOfWeek.toLocaleDateString('en-US', { day: 'numeric' })}`
      : weekOffset > 0
        ? `${weekOffset} week${weekOffset > 1 ? 's' : ''} ahead`
        : `${Math.abs(weekOffset)} week${Math.abs(weekOffset) > 1 ? 's' : ''} ago`;

  const handleGenerateShoppingList = () => {
    // TODO: Implement shopping list generation API call
    toast.info('Generating shopping list... (Coming soon)');
  };

  return (
    <AppShell>
      <Container className="py-6">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Meal Plan</h1>
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add Meal
          </Button>
        </div>

        {/* Week Navigator */}
        <div className="mb-4 flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label="Previous week"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium">{weekLabel}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset((w) => w + 1)}
            aria-label="Next week"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Generate Shopping List */}
        <Button
          className="mb-6 w-full"
          variant="outline"
          onClick={handleGenerateShoppingList}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Generate Shopping List
        </Button>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading meal plans...
          </div>
        ) : (
          /* Day Sections */
          <div className="space-y-6">
            {days.map((day) => {
              const dayPlans = mealPlans.filter((mp) => {
                const mpDate = new Date(mp.date);
                return mpDate.toDateString() === day.date.toDateString();
              });

              return (
                <div key={day.dayLabel} className="animate-fade-in">
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    {day.dayLabel}{' '}
                    <span className="font-normal">{day.dateLabel}</span>
                  </h2>
                  <Card className="divide-y">
                    {MEAL_TYPES.map((type) => {
                      // Find plan for this type
                      const plan = dayPlans.find(
                        (p) => p.mealType === type.toUpperCase()
                      ); // Enum is typically UPPERCASE

                      return (
                        <div
                          key={type}
                          className="flex items-center justify-between p-3"
                        >
                          <div>
                            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              {type}
                            </p>
                            {plan && plan.recipe ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xl">🍲</span>
                                <div>
                                  <p className="text-sm font-medium">
                                    {plan.recipe.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {(plan.recipe.prepTime || 0) +
                                      (plan.recipe.cookTime || 0)}{' '}
                                    min · {plan.recipe.servings} servings
                                  </p>
                                </div>
                              </div>
                            ) : plan ? (
                              // Plan exists but no linked recipe (manual note?)
                              <p className="text-sm italic text-muted-foreground">
                                {plan.notes || 'Planned'}
                              </p>
                            ) : (
                              <button className="text-sm text-primary hover:underline">
                                + Add meal
                              </button>
                            )}
                          </div>
                          {plan && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <span className="text-xs">⋮</span>
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </AppShell>
  );
}
