/**
 * Landing Page Content (Client Component)
 *
 * Mobile-first landing page with hero, features, and CTA.
 * Dark/light mode aware. Premium glassmorphism design.
 *
 * @module app/landing-content
 */

'use client';

import {
  BarChart3,
  ChefHat,
  Package,
  ShoppingCart,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';

const features = [
  {
    icon: ShoppingCart,
    title: 'Smart Lists',
    description: 'Create organized shopping lists with real-time collaboration',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Package,
    title: 'Pantry Tracker',
    description: 'Track expiry dates and never waste food again',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: ChefHat,
    title: 'Meal Planning',
    description: 'Plan your weekly meals and auto-generate shopping lists',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    icon: BarChart3,
    title: 'Budget Control',
    description: 'Set budgets, track spending, and save money',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
];

export function LandingContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground shadow-lg">
            L
          </div>
          <span className="text-xl font-bold">Listly</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pb-8 pt-12 text-center sm:pb-16 sm:pt-20">
        <div className="mx-auto max-w-2xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">Free forever</span>
          </div>

          {/* Headline */}
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Your{' '}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Smart Shopping
            </span>{' '}
            Companion
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-8 max-w-lg text-lg text-muted-foreground sm:text-xl">
            Organize lists, track your pantry, plan meals, and stay on budget —
            all in one beautiful app.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full px-8 sm:w-auto">
                Get Started — It&apos;s Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                I have an account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 pb-16 sm:pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div
                    className={`mb-4 inline-flex rounded-xl p-3 ${feature.bg}`}
                  >
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-t px-6 pb-12 pt-10 text-center">
        <div className="mx-auto max-w-xl">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Real-time collaboration</span>
            </div>
            <div className="flex items-center gap-1">
              <span>📱</span>
              <span>Works on all devices</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🔒</span>
              <span>Secure & private</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Listly. Built with ❤️</p>
      </footer>
    </div>
  );
}
