/**
 * Theme Provider Component
 *
 * Wraps the application with next-themes provider to enable dark mode support.
 * Handles theme persistence, system preference detection, and theme switching.
 *
 * @module components/ThemeProvider
 */

'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

/**
 * Theme provider that wraps the application.
 * Provides theme context to all child components.
 *
 * @param children - Child components to wrap
 * @param props - Next-themes provider props
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * <ThemeProvider
 *   attribute="class"
 *   defaultTheme="system"
 *   enableSystem
 *   disableTransitionOnChange
 * >
 *   {children}
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
