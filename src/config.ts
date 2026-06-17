/**
 * Central business configuration. Keep contact details and site metadata here
 * so they're defined once and reused across the app.
 */
export const SITE = {
  name: 'WarpSki',
  legalName: 'WarpSki Watercraft',
  tagline: 'Ride the open water',
  description:
    'Premium jetskis for every kind of rider — performance, touring and recreation, plus marine-grade accessories. Choose the ride of a lifetime.',
  // Update to your production domain after deploying.
  url: 'https://warpski.vercel.app',
  ogImage: '/images/hero-jetski-rider.jpg',
} as const;

export const CONTACT = {
  email: 'warpski.shop@gmail.com',
  phone: '+1 (541) 550-8953',
  phoneHref: '+15415508953',
  address: 'Marina Bay Boulevard, United States',
} as const;

/**
 * Until card payments are live, orders are emailed to the owner via FormSubmit
 * (https://formsubmit.co) — a free, no-key form-to-email relay. The first
 * submission triggers a one-time confirmation email to CONTACT.email.
 */
export const ORDER_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT.email}`;
