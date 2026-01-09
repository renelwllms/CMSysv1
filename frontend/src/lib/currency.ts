/**
 * Currency formatting utilities
 * Provides consistent currency formatting across the application
 */

// Currency configuration
const currencyConfig: Record<string, { locale: string; symbol?: string }> = {
  IDR: { locale: 'id-ID' },
  USD: { locale: 'en-US' },
  NZD: { locale: 'en-NZ' },
  EUR: { locale: 'de-DE' },
  GBP: { locale: 'en-GB' },
  AUD: { locale: 'en-AU' },
  SGD: { locale: 'en-SG' },
  MYR: { locale: 'ms-MY' },
  THB: { locale: 'th-TH' },
  JPY: { locale: 'ja-JP' },
};

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currencyCode - The currency code (IDR, USD, NZD, etc.)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string, currencyCode: string = 'IDR'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return '0';
  }

  const config = currencyConfig[currencyCode] || { locale: 'en-US' };
  const currencyDefaults = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currencyCode,
  }).resolvedOptions();
  const minDefaultFractions = currencyDefaults.minimumFractionDigits ?? 0;
  const maxDefaultFractions = currencyDefaults.maximumFractionDigits ?? 2;

  // Preserve cents when a fractional value is provided (e.g., $3.50 should stay $3.50)
  const hasFraction = typeof amount === 'string'
    ? (amount.includes('.') && Number(amount.split('.')[1]) > 0)
    : !Number.isInteger(numAmount);
  const shouldShowCents = hasFraction && minDefaultFractions > 0;
  const fractionDigits = shouldShowCents
    ? Math.max(minDefaultFractions, 2)
    : Math.min(minDefaultFractions, maxDefaultFractions);

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(numAmount);
  } catch (error) {
    // Fallback if currency code is not supported
    return `${currencyCode} ${numAmount.toLocaleString(config.locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })}`;
  }
}

/**
 * Get currency symbol for a given currency code
 * @param currencyCode - The currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currencyCode: string = 'IDR'): string {
  const config = currencyConfig[currencyCode] || { locale: 'en-US' };

  try {
    const formatter = new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    // Format a small number and extract the symbol
    const formatted = formatter.format(0);
    return formatted.replace(/[\d\s.,]/g, '').trim();
  } catch (error) {
    return currencyCode;
  }
}

/**
 * Parse a currency string to a number
 * @param currencyString - The currency string to parse
 * @returns Parsed number
 */
export function parseCurrency(currencyString: string): number {
  if (!currencyString) return 0;

  // Remove all non-numeric characters except decimal point and minus sign
  const cleaned = currencyString.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format a number as currency without the currency symbol
 * @param amount - The amount to format
 * @param currencyCode - The currency code for locale formatting
 * @returns Formatted number string
 */
export function formatAmount(amount: number | string, currencyCode: string = 'IDR'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return '0';
  }

  const config = currencyConfig[currencyCode] || { locale: 'en-US' };

  return numAmount.toLocaleString(config.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
