import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes without conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Effective price for a product, honouring an optional sale price. */
export function effectivePrice(p: { price: number; sale_price?: number | null }): number {
  return p.sale_price && p.sale_price > 0 ? p.sale_price : p.price;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Turn any thrown error into a safe, user-facing message. Strips URLs, hosts,
 * and stack-ish noise so we never surface internal endpoints or links to users,
 * and maps a few common technical errors to friendly copy.
 */
export function sanitizeError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  if (!raw) return fallback;

  let msg = raw
    // remove any URLs / protocols
    .replace(/\b(?:https?|ftp|ws):\/\/\S+/gi, '')
    // remove bare domains / hosts
    .replace(/\b[\w-]+\.(?:com|net|org|io|co|dev|app|supabase\.co)\b\S*/gi, '')
    // collapse whitespace left behind
    .replace(/\s{2,}/g, ' ')
    .trim();

  const lower = msg.toLowerCase();
  if (lower.includes('invalid login') || lower.includes('invalid credentials'))
    return 'Incorrect email or password.';
  if (lower.includes('email not confirmed')) return 'Please confirm your email before signing in.';
  if (lower.includes('rate limit') || lower.includes('too many'))
    return 'Too many attempts. Please wait a moment and try again.';
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch'))
    return 'Network error. Check your connection and try again.';
  if (lower.includes('already registered') || lower.includes('already exists'))
    return 'An account with that email already exists.';

  // If sanitising stripped everything meaningful, use the fallback.
  if (msg.length < 3) return fallback;
  return msg;
}

/** Map a Zod flatten() result to a flat { field: message } record. */
export function fieldErrors(
  flattened: { fieldErrors: Record<string, string[] | undefined> },
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, msgs] of Object.entries(flattened.fieldErrors)) {
    if (msgs && msgs.length) out[key] = msgs[0];
  }
  return out;
}
