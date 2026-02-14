/**
 * formatCurrency Utility
 *
 * Formats a number as currency using Intl.NumberFormat.
 * Supports USD, EUR, GBP, CAD, AUD, and EGP.
 *
 * @module lib/utils/formatCurrency
 */

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'EGP';

const CURRENCY_CONFIG: Record<Currency, { locale: string; currency: string }> =
  {
    USD: { locale: 'en-US', currency: 'USD' },
    EUR: { locale: 'de-DE', currency: 'EUR' },
    GBP: { locale: 'en-GB', currency: 'GBP' },
    CAD: { locale: 'en-CA', currency: 'CAD' },
    AUD: { locale: 'en-AU', currency: 'AUD' },
    EGP: { locale: 'ar-EG', currency: 'EGP' },
  };

/**
 * Format a number as currency.
 *
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'USD')
 * @returns Formatted currency string
 *
 * @example
 * ```ts
 * formatCurrency(42.5, 'USD')  // "$42.50"
 * formatCurrency(42.5, 'EGP')  // "٤٢٫٥٠ ج.م."
 * formatCurrency(42.5, 'EUR')  // "42,50 €"
 * ```
 */
export function formatCurrency(
  amount: number,
  currency: Currency = 'USD'
): string {
  const config = CURRENCY_CONFIG[currency];

  // Use en-US locale for EGP to get Western Arabic numerals
  const locale = currency === 'EGP' ? 'en-EG' : config.locale;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get the currency symbol for a given currency code.
 */
export function getCurrencySymbol(currency: Currency = 'USD'): string {
  const config = CURRENCY_CONFIG[currency];
  const formatted = new Intl.NumberFormat(
    currency === 'EGP' ? 'en-EG' : config.locale,
    {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  ).format(0);

  // Extract symbol by removing the number
  return formatted.replace(/[\d,.]/g, '').trim();
}
