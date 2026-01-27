export const currencySymbols: Record<string, string> = {
  BDT: '৳',
  USD: '$',
  EUR: '€',
  CNY: '¥',
  INR: '₹',
  GBP: '£',
};

/**
 * Format amount with currency symbol
 * @param amount - The amount to format
 * @param currency - Currency code (BDT, USD, EUR, etc.). Defaults to BDT if not provided.
 * @returns Formatted currency string with symbol
 */
export function formatCurrency(amount: number | string | null | undefined, currency?: string): string {
  const numAmount = Number(amount || 0);
  const currencyCode = currency || 'BDT';
  const symbol = currencySymbols[currencyCode] || currencyCode;
  return `${symbol}${numAmount.toLocaleString()}`;
}

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currency: string): string {
  return currencySymbols[currency] || currency;
}
