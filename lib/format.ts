/** Change these two constants to localise the app to another currency/locale. */
export const LOCALE = 'es-MX';
export const CURRENCY = 'MXN';

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number) {
  return currencyFormatter.format(Number.isFinite(amount) ? amount : 0);
}

/** Money as a plain editable string (no currency symbol, dot decimal separator). */
export function toAmountInput(amount: number) {
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
}

export function parseAmountInput(value: string) {
  const parsed = Number(value.trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}
