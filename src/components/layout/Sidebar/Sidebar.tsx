/**
 * Sidebar Navigation Component
 *
 * Desktop sidebar navigation per wireframes.
 * Visible only on md+ breakpoints. Shows all main nav items.
 *
 * @module components/layout/Sidebar
 */

'use client';

import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CookingPot,
  Settings,
  UtensilsCrossed,
  Warehouse,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores';

const navItems = [
  { href: '/lists', label: 'Lists', icon: ClipboardList, emoji: '📝' },
  { href: '/pantry', label: 'Pantry', icon: Warehouse, emoji: '🏺' },
  { href: '/meals', label: 'Meals', icon: UtensilsCrossed, emoji: '🍽️' },
  { href: '/recipes', label: 'Recipes', icon: CookingPot, emoji: '👨‍🍳' },
  {
    href: '/budget',
    label: 'Budget',
    icon: BarChart3,
    emoji: '📊',
  },
  { href: '/settings', label: 'Settings', icon: Settings, emoji: '⚙️' },
] as const;

/**
 * Desktop sidebar navigation.
 * Hidden on mobile, shows on md+ breakpoints.
 * Supports collapsed state via Zustand app store.
 *
 * @example
 * ```tsx
 * <Sidebar />
 * ```
 */
export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        'sticky top-16 hidden h-[calc(100vh-4rem)] flex-col border-r bg-background transition-all duration-300 md:flex',
        sidebarCollapsed ? 'w-16' : 'w-56'
      )}
    >
      <nav className="flex flex-1 flex-col gap-1 p-2" aria-label="Sidebar">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                sidebarCollapsed && 'justify-center px-2'
              )}
              aria-current={isActive ? 'page' : undefined}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn('w-full', !sidebarCollapsed && 'justify-start gap-2')}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs text-muted-foreground">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

Sidebar.displayName = 'Sidebar';
