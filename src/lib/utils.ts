/**
 * Utility Functions
 *
 * Common utility functions used throughout the application.
 *
 * @module lib/utils
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge.
 * Handles conditional classes and resolves conflicts.
 *
 * @param inputs - Class names to merge
 * @returns Merged class string
 *
 * @example
 * ```ts
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 * cn('text-red-500', condition && 'text-blue-500') // Conditional classes
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price value as currency.
 *
 * @param amount - Amount in cents
 * @param currency - Currency code (default: USD)
 * @returns Formatted price string
 *
 * @example
 * ```ts
 * formatPrice(1099) // => '$10.99'
 * formatPrice(1099, 'EUR') // => '€10.99'
 * ```
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

/**
 * Format a date relative to now.
 *
 * @param date - Date to format
 * @returns Relative date string
 *
 * @example
 * ```ts
 * formatRelativeDate(new Date('2026-02-09')) // => 'Today'
 * formatRelativeDate(new Date('2026-02-08')) // => 'Yesterday'
 * formatRelativeDate(new Date('2026-02-01')) // => '9 days ago'
 * ```
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

/**
 * Truncate a string to a maximum length.
 *
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string with ellipsis
 *
 * @example
 * ```ts
 * truncate('Hello World', 5) // => 'Hello...'
 * ```
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Debounce a function call.
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 *
 * @example
 * ```ts
 * const debouncedSearch = debounce((query: string) => {
 *   fetchResults(query);
 * }, 300);
 * ```
 */
export function debounce<T extends (..._args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (..._args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (..._args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(..._args), delay);
  };
}

/**
 * Sleep for a specified duration.
 *
 * @param ms - Duration in milliseconds
 * @returns Promise that resolves after the duration
 *
 * @example
 * ```ts
 * await sleep(1000); // Wait 1 second
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
