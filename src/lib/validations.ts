import { z } from 'zod';

/**
 * Email schema with defensive bounds. Zod's `.email()` rejects malformed
 * addresses; the length cap + character guard blunt header-injection / XSS
 * payloads that try to smuggle markup through an email field.
 */
export const emailSchema = z
  .string()
  .trim()
  .min(5, 'Email is too short')
  .max(254, 'Email is too long')
  .email('Enter a valid email address')
  .refine((v) => !/[<>"'`]/.test(v), 'Email contains invalid characters');

/**
 * Password policy: min 8 chars, no whitespace, must mix letters + numbers.
 * We never log or echo passwords anywhere.
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be 72 characters or fewer') // bcrypt hard limit
  .refine((v) => !/\s/.test(v), 'Password cannot contain spaces')
  .refine((v) => /[A-Za-z]/.test(v) && /[0-9]/.test(v), 'Use both letters and numbers');

/** Generic free-text guard that strips obvious markup vectors. */
const safeText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .refine((v) => !/<\s*script|<\s*\/?\s*[a-z][^>]*>/i.test(v), 'Markup is not allowed');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z
  .object({
    fullName: safeText(80).pipe(z.string().min(2, 'Enter your name')),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const contactSchema = z.object({
  name: safeText(80).pipe(z.string().min(2, 'Enter your name')),
  email: emailSchema,
  subject: safeText(120).pipe(z.string().min(3, 'Add a subject')),
  message: safeText(2000).pipe(z.string().min(10, 'Tell us a little more')),
});

/**
 * Order-request details. Card payment is not collected yet — the validated
 * order is emailed to the store owner, who follows up to arrange payment.
 */
export const orderSchema = z.object({
  fullName: safeText(80).pipe(z.string().min(2, 'Enter your full name')),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number')
    .max(20, 'Phone number is too long')
    .regex(/^[+\d][\d\s()-]{6,}$/, 'Enter a valid phone number'),
  address: safeText(160).pipe(z.string().min(5, 'Enter your address')),
  city: safeText(80).pipe(z.string().min(2, 'Enter your city')),
  postalCode: z
    .string()
    .trim()
    .min(3, 'Enter a postal code')
    .max(12, 'Postal code is too long')
    .regex(/^[A-Za-z0-9\s-]+$/, 'Enter a valid postal code'),
  country: safeText(60).pipe(z.string().min(2, 'Enter your country')),
  notes: safeText(1000).optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;

export const checkoutSchema = z.object({
  fullName: safeText(80).pipe(z.string().min(2, 'Enter your full name')),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number')
    .max(20, 'Phone number is too long')
    .regex(/^[+\d][\d\s()-]{6,}$/, 'Enter a valid phone number'),
  address: safeText(160).pipe(z.string().min(5, 'Enter your address')),
  city: safeText(80).pipe(z.string().min(2, 'Enter your city')),
  postalCode: z
    .string()
    .trim()
    .min(3, 'Enter a postal code')
    .max(12, 'Postal code is too long')
    .regex(/^[A-Za-z0-9\s-]+$/, 'Enter a valid postal code'),
  country: safeText(60).pipe(z.string().min(2, 'Select a country')),
  cardName: safeText(80).pipe(z.string().min(2, 'Name on card')),
  cardNumber: z
    .string()
    .transform((v) => v.replace(/\s+/g, ''))
    .pipe(z.string().regex(/^\d{13,19}$/, 'Enter a valid card number'))
    .refine(luhnValid, 'Card number failed validation'),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Use MM/YY')
    .refine(notExpired, 'Card has expired'),
  cvc: z.string().trim().regex(/^\d{3,4}$/, 'Enter a valid CVC'),
});

/** Luhn checksum — catches mistyped card numbers before any network call. */
export function luhnValid(num: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = Number(num[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function notExpired(value: string): boolean {
  const [mm, yy] = value.split('/');
  const expYear = 2000 + Number(yy);
  const expMonth = Number(mm);
  const now = new Date();
  const end = new Date(expYear, expMonth, 0, 23, 59, 59);
  return end >= now;
}

/** Allowed upload mime types + max size, mirrored on the server. */
export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024; // 5MB
export const UPLOAD_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export const uploadFileSchema = z.object({
  name: z.string().max(200),
  size: z.number().max(UPLOAD_MAX_BYTES, 'File must be 5MB or smaller'),
  type: z.enum(UPLOAD_ALLOWED_TYPES, {
    errorMap: () => ({ message: 'Only JPEG, PNG, WebP or AVIF images are allowed' }),
  }),
});

export const productSchema = z.object({
  name: safeText(120).pipe(z.string().min(2, 'Product name required')),
  category: z.enum(['performance', 'recreation', 'accessories']),
  tagline: safeText(160),
  description: safeText(4000).pipe(z.string().min(10, 'Add a description')),
  price: z.coerce.number().positive('Price must be greater than 0').max(10_000_000),
  in_stock: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productSchema>;
