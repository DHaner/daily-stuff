/** Swatches offered when coloring a label; any `#rrggbb` value is also accepted. */
export const LABEL_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#d946ef',
  '#ec4899',
  '#64748b',
] as const;

export const DEFAULT_LABEL_COLOR = '#64748b';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(value: string) {
  return HEX_COLOR.test(value);
}
