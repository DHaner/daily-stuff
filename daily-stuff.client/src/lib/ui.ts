/** A translucent version of any CSS color (hex or CSS variable), for soft tinted surfaces. */
export const tint = (color: string, percent = 14) => `color-mix(in srgb, ${color} ${percent}%, transparent)`;

/** Error text of a TanStack Form field, shown only after the user touched it or tried to submit. */
export function fieldError(meta: { isTouched: boolean; errors: unknown[] }) {
  if (!meta.isTouched || meta.errors.length === 0) return undefined;
  return meta.errors.map((error) => (typeof error === 'string' ? error : (error as { message?: string })?.message)).join(', ');
}

export const required = (message: string) => ({ value }: { value: string }) =>
  value.trim() ? undefined : message;
