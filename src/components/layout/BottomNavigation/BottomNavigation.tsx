/**
 * Bottom Navigation Component
 *
 * Mobile-only bottom tab bar with 5 navigation items per wireframes:
 * Lists, Pantry, Meals, Budget, Settings.
 * Now with animated active indicator and spring-like tap feedback.
 *
 * @module components/layout/BottomNavigation
 */

'use client';

import {
  BarChart3,
  ClipboardList,
  CookingPot,
  Settings,
  UtensilsCrossed,
  Warehouse,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const navItems = [
  { href: '/lists', label: 'Lists', icon: ClipboardList },
  { href: '/pantry', label: 'Pantry', icon: Warehouse },
  { href: '/meals', label: 'Meals', icon: UtensilsCrossed },
  { href: '/recipes', label: 'Recipes', icon: CookingPot },
  { href: '/budget', label: 'Budget', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const;

/**
 * Mobile bottom navigation bar.
 * Shows 5 tabs matching wireframes. Hidden on desktop (md:hidden).
 * Active tab has animated indicator dot + spring scale effect.
 */
export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground active:scale-90'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-all duration-200',
                  isActive && '-translate-y-0.5 scale-110'
                )}
              />
              <span
                className={cn(
                  'transition-all duration-200',
                  isActive && 'font-semibold'
                )}
              >
                {item.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <span className="animate-scale-up absolute -bottom-1 h-1 w-4 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

BottomNavigation.displayName = 'BottomNavigation';
