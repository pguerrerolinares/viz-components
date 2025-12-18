/**
 * Number formatting utilities for viz-components
 * Uses Intl.NumberFormat for locale-aware formatting
 */

export type NumberFormat = 'number' | 'currency' | 'percent' | 'compact';

export interface FormatOptions {
  format?: NumberFormat;
  decimals?: number;
  prefix?: string;
  unit?: string;
  locale?: string;
  currency?: string;
}

/**
 * Format a number according to the specified options
 */
export function formatNumber(value: number, options: FormatOptions = {}): string {
  const {
    format = 'number',
    decimals = 0,
    prefix = '',
    unit = '',
    locale = 'en-US',
    currency = 'USD',
  } = options;

  let formatted: string;

  switch (format) {
    case 'currency':
      formatted = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
      break;

    case 'percent':
      formatted = new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value / 100);
      break;

    case 'compact':
      formatted = new Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay: 'short',
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals > 0 ? decimals : 1,
      }).format(value);
      break;

    default:
      formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
  }

  // Add prefix/unit for non-currency formats
  if (format !== 'currency') {
    if (prefix) formatted = prefix + formatted;
    if (unit) formatted = formatted + unit;
  }

  return formatted;
}

/**
 * Format a change value with sign
 */
export function formatChange(
  value: number,
  options: FormatOptions = {}
): string {
  const { decimals = 1 } = options;
  const sign = value >= 0 ? '+' : '';
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  return sign + formatted;
}

/**
 * Format a percentage change
 */
export function formatPercentChange(value: number, decimals = 1): string {
  const sign = value >= 0 ? '+' : '';
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  return `${sign}${formatted}%`;
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}
