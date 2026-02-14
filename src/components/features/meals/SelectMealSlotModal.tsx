/**
 * SelectMealSlotModal Component
 *
 * Modal to pick a day + meal slot (Breakfast/Lunch/Dinner)
 * when adding a recipe to the meal plan.
 *
 * @module components/features/meals/SelectMealSlotModal
 */

'use client';

import { Calendar, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SelectMealSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeName: string;
  recipeId: string;
}

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'] as const;

function getWeekDates(): { day: string; date: string }[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));

  return DAYS.map((day, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return {
      day,
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    };
  });
}

export function SelectMealSlotModal({
  isOpen,
  onClose,
  recipeName,
  recipeId: _recipeId,
}: SelectMealSlotModalProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weekDates = getWeekDates();

  const handleAdd = async () => {
    if (selectedDay === null || !selectedMeal) return;

    setIsSubmitting(true);
    try {
      // TODO: Wire to actual meal plan API when backend is ready
      toast.success(
        `Added "${recipeName}" to ${weekDates[selectedDay].day} ${selectedMeal}`
      );
      onClose();
    } catch {
      toast.error('Failed to add to meal plan');
    } finally {
      setIsSubmitting(false);
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
        <div className="animate-modal-enter relative max-h-[85vh] w-full overflow-y-auto rounded-t-2xl border bg-background shadow-2xl sm:max-w-md sm:rounded-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Add to Meal Plan</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">
              Select a day and meal for{' '}
              <strong className="text-foreground">{recipeName}</strong>
            </p>

            {/* Day Selection */}
            <div className="grid grid-cols-7 gap-1">
              {weekDates.map((d, i) => (
                <button
                  key={d.day}
                  onClick={() => setSelectedDay(i)}
                  className={cn(
                    'flex flex-col items-center rounded-lg p-2 text-xs transition-colors',
                    selectedDay === i
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <span className="font-medium">{d.day.slice(0, 3)}</span>
                  <span className="text-[10px] opacity-75">{d.date}</span>
                </button>
              ))}
            </div>

            {/* Meal Type Selection */}
            {selectedDay !== null && (
              <div className="flex gap-2">
                {MEAL_TYPES.map((meal) => (
                  <button
                    key={meal}
                    onClick={() => setSelectedMeal(meal)}
                    className={cn(
                      'flex-1 rounded-lg border p-3 text-sm font-medium transition-colors',
                      selectedMeal === meal
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    )}
                  >
                    {meal}
                  </button>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleAdd}
                disabled={selectedDay === null || !selectedMeal || isSubmitting}
                isLoading={isSubmitting}
                className="flex-1"
              >
                Add to Plan
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
