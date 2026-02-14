/**
 * Header Component
 *
 * Slim application header with logo, theme toggle, and enhanced user menu.
 * Navigation links removed — handled by Sidebar (desktop) and BottomNavigation (mobile).
 *
 * @module components/layout/Header
 */

'use client';

import {
  BarChart3,
  BookOpen,
  HelpCircle,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  UtensilsCrossed,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ThemeToggle } from '@/components/ThemeToggle';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

import { Container } from '../Container';

export interface HeaderProps {
  /** User data if authenticated */
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  /** Custom className */
  className?: string;
}

const dropdownNavItems = [
  { href: '/lists', label: 'Lists', icon: ShoppingCart },
  { href: '/pantry', label: 'Pantry', icon: Package },
  { href: '/meals', label: 'Meal Plan', icon: UtensilsCrossed },
  { href: '/recipes', label: 'Recipes', icon: BookOpen },
  { href: '/budget', label: 'Budget', icon: BarChart3 },
];

/**
 * Slim application header.
 *
 * @example
 * ```tsx
 * <Header user={session?.user} />
 * ```
 */
export function Header({ user, className }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  // Close dropdown on click outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsUserMenuOpen(false);
    }
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserMenuOpen, handleClickOutside]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <Container>
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
              L
            </div>
            <span className="text-lg font-bold">Listly</span>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="rounded-full transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <Avatar
                    src={user.image}
                    alt={user.name || user.email || 'User'}
                    size="sm"
                  />
                </button>

                {/* Enhanced Dropdown Menu */}
                {isUserMenuOpen && (
                  <div
                    className="animate-dropdown-enter absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border bg-background py-1 shadow-xl"
                    role="menu"
                  >
                    {/* User Info */}
                    <div className="border-b px-4 py-3">
                      <p className="text-sm font-semibold">
                        {user.name || 'User'}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>

                    {/* Quick Nav */}
                    <div className="border-b py-1">
                      {dropdownNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              'flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-muted',
                              isActive && 'bg-muted font-medium text-primary'
                            )}
                            role="menuitem"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>

                    {/* Account */}
                    <div className="border-b py-1">
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-muted"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-muted"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <HelpCircle className="h-4 w-4" />
                        Help & Support
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}

Header.displayName = 'Header';
