/**
 * OnboardingFlow Component
 *
 * 4-step onboarding shown once after first sign-up.
 * Steps: Welcome → Quick Tour → Preferences → First List.
 * Tracked via hasCompletedOnboarding in settings store.
 *
 * @module components/features/onboarding/OnboardingFlow
 */

'use client';

import {
  BarChart3,
  ChefHat,
  ChevronRight,
  Package,
  ShoppingCart,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { Currency } from '@/stores/useSettingsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

interface OnboardingFlowProps {
  userName?: string | null;
}

const TOUR_SLIDES = [
  {
    icon: ShoppingCart,
    title: 'Smart Shopping Lists',
    description:
      'Create lists, add items, check them off, and collaborate in real-time.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Package,
    title: 'Pantry Tracker',
    description: 'Know what you have at home. Get alerts before items expire.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: ChefHat,
    title: 'Meal Planning',
    description:
      'Plan weekly meals and auto-generate shopping lists from recipes.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    icon: BarChart3,
    title: 'Budget Tracking',
    description:
      'Set budgets, track spending, and visualize your grocery costs.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
];

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'USD', label: '🇺🇸 USD — US Dollar' },
  { value: 'EUR', label: '🇪🇺 EUR — Euro' },
  { value: 'GBP', label: '🇬🇧 GBP — British Pound' },
  { value: 'EGP', label: '🇪🇬 EGP — Egyptian Pound' },
  { value: 'CAD', label: '🇨🇦 CAD — Canadian Dollar' },
  { value: 'AUD', label: '🇦🇺 AUD — Australian Dollar' },
];

export function OnboardingFlow({ userName }: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [tourIndex, setTourIndex] = useState(0);
  const { currency, setCurrency, setHasCompletedOnboarding } =
    useSettingsStore();

  const totalSteps = 4;

  const handleCreateFirst = () => {
    setHasCompletedOnboarding(true);
    router.push('/lists?createList=true');
  };

  const handleComplete = () => {
    setHasCompletedOnboarding(true);
    router.push('/lists');
  };

  const handleSkip = () => {
    setHasCompletedOnboarding(true);
    router.push('/lists');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      {/* Progress Dots */}
      <div className="absolute bottom-8 flex gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === step ? 'w-8 bg-primary' : 'w-2 bg-muted'
            )}
          />
        ))}
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute right-6 top-6 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Skip
      </button>

      {/* Step 0: Welcome */}
      {step === 0 && (
        <div className="animate-page-enter flex max-w-sm flex-col items-center px-8 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 shadow-lg">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">
            Welcome{userName ? `, ${userName}` : ''}!
          </h1>
          <p className="mb-8 text-muted-foreground">
            Let&apos;s get you set up in just a minute. Your smarter shopping
            experience starts now.
          </p>
          <Button size="lg" onClick={() => setStep(1)} className="w-full">
            Let&apos;s Go <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step 1: Quick Tour */}
      {step === 1 && (
        <div className="animate-page-enter flex max-w-sm flex-col items-center px-8 text-center">
          {(() => {
            const slide = TOUR_SLIDES[tourIndex];
            const Icon = slide.icon;
            return (
              <div key={tourIndex} className="animate-page-enter">
                <div
                  className={`mx-auto mb-6 inline-flex rounded-2xl p-5 ${slide.bg}`}
                >
                  <Icon className={`h-12 w-12 ${slide.color}`} />
                </div>
                <h2 className="mb-2 text-2xl font-bold">{slide.title}</h2>
                <p className="mb-6 text-muted-foreground">
                  {slide.description}
                </p>
              </div>
            );
          })()}

          {/* Tour Navigation */}
          <div className="flex w-full gap-2">
            {tourIndex < TOUR_SLIDES.length - 1 ? (
              <Button
                size="lg"
                onClick={() => setTourIndex((i) => i + 1)}
                className="flex-1"
              >
                Next
              </Button>
            ) : (
              <Button size="lg" onClick={() => setStep(2)} className="flex-1">
                Continue
              </Button>
            )}
          </div>

          {/* Tour Dots */}
          <div className="mt-4 flex gap-1.5">
            {TOUR_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setTourIndex(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === tourIndex ? 'w-4 bg-primary' : 'w-1.5 bg-muted'
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Preferences */}
      {step === 2 && (
        <div className="animate-page-enter flex max-w-sm flex-col items-center px-8 text-center">
          <h2 className="mb-2 text-2xl font-bold">Your Preferences</h2>
          <p className="mb-6 text-muted-foreground">
            Choose your currency. You can always change this later in Settings.
          </p>

          <div className="mb-6 w-full space-y-2">
            {CURRENCIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCurrency(c.value)}
                className={cn(
                  'flex w-full items-center rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                  currency === c.value
                    ? 'border-primary bg-primary/10 font-medium'
                    : 'hover:bg-muted'
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          <Button size="lg" onClick={() => setStep(3)} className="w-full">
            Continue
          </Button>
        </div>
      )}

      {/* Step 3: First List */}
      {step === 3 && (
        <div className="animate-page-enter flex max-w-sm flex-col items-center px-8 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <ShoppingCart className="h-10 w-10 text-primary" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">You&apos;re all set!</h2>
          <p className="mb-8 text-muted-foreground">
            Ready to create your first shopping list? You can start right away.
          </p>
          <Button size="lg" onClick={handleCreateFirst} className="w-full">
            Create My First List
          </Button>
          <button
            onClick={handleComplete}
            className="mt-3 text-sm text-muted-foreground hover:text-foreground"
          >
            I&apos;ll do it later
          </button>
        </div>
      )}
    </div>
  );
}
