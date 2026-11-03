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

const compactCurrencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Money formatted with k/M/B-style abbreviations, e.g. "$12.3k", "$1.2M". */
export function formatCurrencyCompact(amount: number) {
  return compactCurrencyFormatter.format(Number.isFinite(amount) ? amount : 0);
}

/** Money as a plain editable string (no currency symbol, dot decimal separator). */
export function toAmountInput(amount: number) {
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
}

export function parseAmountInput(value: string) {
  const parsed = Number(value.trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Strips a live-formatted amount (e.g. "$1,000,000.00") back to a plain "1000000.00" string. */
export function sanitizeAmountInput(text: string): string {
  let cleaned = text.replace(/[^0-9.]/g, '');

  const firstDot = cleaned.indexOf('.');
  if (firstDot !== -1) {
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replaceAll('.', '');
  }

  const [intPart, decPart] = cleaned.split('.');
  if (decPart !== undefined) {
    cleaned = `${intPart}.${decPart.slice(0, 2)}`;
  }

  return cleaned;
}

/** Formats a plain amount string as the user types it, e.g. "1000000.00" -> "$1,000,000.00". */
export function formatAmountInput(raw: string): string {
  if (!raw) return '';

  const [intPart = '', decPart] = raw.split('.');
  const digits = intPart.replace(/^0+(?=\d)/, '') || '0';
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (raw.endsWith('.')) return `${grouped}.`;
  if (decPart !== undefined) return `${grouped}.${decPart}`;
  return `${grouped}`;
}
