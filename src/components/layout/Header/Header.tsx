/**
 * Header Component
 *
 * Application header with navigation, user menu, and mobile support.
 *
 * @module components/layout/Header
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';

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

/**
 * Application header component.
 *
 * @example
 * ```tsx
 * <Header user={session?.user} />
 * ```
 */
export function Header({ user, className }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        'bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur',
        className
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg font-bold">
              L
            </div>
            <span className="text-lg font-bold">Listly</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/lists"
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                >
                  Lists
                </Link>
                <Link
                  href="/pantry"
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                >
                  Pantry
                </Link>
                <div className="ml-4">
                  <Avatar
                    src={user.image}
                    alt={user.name || user.email || 'User'}
                    size="sm"
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/lists"
                    className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                  >
                    Lists
                  </Link>
                  <Link
                    href="/pantry"
                    className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                  >
                    Pantry
                  </Link>
                  <div className="flex items-center gap-2 pt-2">
                    <Avatar
                      src={user.image}
                      alt={user.name || user.email || 'User'}
                      size="sm"
                    />
                    <span className="text-sm">{user.name || user.email}</span>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" fullWidth>
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button fullWidth>Get Started</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}

Header.displayName = 'Header';
