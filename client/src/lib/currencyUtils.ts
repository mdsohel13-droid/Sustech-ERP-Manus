export const currencySymbols: Record<string, string> = {
  BDT: '৳',
  USD: '$',
  EUR: '€',
  CNY: '¥',
  INR: '₹',
};

export function formatCurrency(amount: number | string | null | undefined, currency: string = 'BDT'): string {
  const numAmount = Number(amount || 0);
  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${numAmount.toLocaleString()}`;
}
