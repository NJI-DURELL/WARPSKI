import type { Product, Category, ProductSpec } from '@/types';

/**
 * WarpSki catalogue — jetskis only, organised by riding style, plus a few
 * marine accessories. Images are bundled locally under /public/images so they
 * always load (no external hotlinks) and ship optimised with the deploy.
 *
 * When Supabase is configured the app reads from the database instead; this
 * data keeps the storefront fully functional out of the box.
 */

const ski = (n: string) => `/images/jetskis/jetski-${n}.jpg`;

interface Seed {
  name: string;
  img: string; // primary image slot
  alt: string; // secondary gallery image slot
  cat: Exclude<Category, 'accessories'>;
  price: number;
  sale?: number;
  hp: number;
  speed: number;
  seats: number;
  fuel: number;
  rating: number;
  featured?: boolean;
  tags: string[];
}

const JETSKIS: Seed[] = [
  // ── Performance ──
  { name: 'Warp RX 800', img: '01', alt: '35', cat: 'performance', price: 18900, hp: 320, speed: 67, seats: 3, fuel: 18.5, rating: 4.9, featured: true, tags: ['Supercharged', 'Polytec Hull', 'Race Edition'] },
  { name: 'Warp GTR 300', img: '19', alt: '34', cat: 'performance', price: 16400, hp: 300, speed: 65, seats: 3, fuel: 18.5, rating: 4.8, featured: true, tags: ['Launch Control', 'Trim System'] },
  { name: 'Warp RXP-X 325', img: '34', alt: '20', cat: 'performance', price: 19900, hp: 325, speed: 70, seats: 2, fuel: 18.5, rating: 4.9, tags: ['T3-R Hull', 'Race Seat'] },
  { name: 'Apex 1100', img: '35', alt: '07', cat: 'performance', price: 15200, sale: 13900, hp: 280, speed: 63, seats: 3, fuel: 16.9, rating: 4.7, tags: ['Adjustable Trim', 'Sport Mode'] },
  { name: 'Velocity 310', img: '20', alt: '12', cat: 'performance', price: 17500, hp: 310, speed: 68, seats: 2, fuel: 18.5, rating: 4.8, tags: ['Carbon Accents', 'Race Edition'] },
  { name: 'Thunder 290', img: '12', alt: '18', cat: 'performance', price: 15800, hp: 290, speed: 64, seats: 3, fuel: 16.9, rating: 4.6, tags: ['Aggressive Hull', 'Quick Throttle'] },
  { name: 'Storm RS 270', img: '18', alt: '39', cat: 'performance', price: 14600, hp: 270, speed: 62, seats: 2, fuel: 16.0, rating: 4.6, tags: ['Lightweight', 'Sharp Handling'] },
  { name: 'Bolt GP 1800', img: '07', alt: '02', cat: 'performance', price: 16900, hp: 300, speed: 66, seats: 3, fuel: 18.5, rating: 4.7, tags: ['High-Output', 'Sport Seat'] },
  { name: 'Raptor 300', img: '39', alt: '38', cat: 'performance', price: 17200, hp: 300, speed: 67, seats: 2, fuel: 18.5, rating: 4.8, tags: ['Deep-V Hull', 'Track Tuned'] },
  { name: 'Hyper FX SVHO', img: '38', alt: '32', cat: 'performance', price: 18200, hp: 320, speed: 69, seats: 3, fuel: 18.5, rating: 4.8, tags: ['Supercharged', 'Cruise Assist'] },
  { name: 'Nitro RXT 260', img: '32', alt: '19', cat: 'performance', price: 13900, sale: 12400, hp: 260, speed: 61, seats: 3, fuel: 16.0, rating: 4.5, tags: ['Entry Performance', 'Eco Mode'] },
  { name: 'Blade 280', img: '02', alt: '34', cat: 'performance', price: 15600, hp: 280, speed: 63, seats: 2, fuel: 16.9, rating: 4.6, tags: ['Sport Hull', 'Race Edition'] },

  // ── Recreation / Touring ──
  { name: 'Coast Cruise 170', img: '04', alt: '14', cat: 'recreation', price: 11400, hp: 170, speed: 53, seats: 3, fuel: 18.5, rating: 4.7, featured: true, tags: ['StableRide Hull', 'Cruise Control', 'EcoCast Audio'] },
  { name: 'Harbor Tour GT 155', img: '05', alt: '23', cat: 'recreation', price: 12900, hp: 155, speed: 52, seats: 3, fuel: 18.5, rating: 4.6, tags: ['Touring Seat', 'Storage 30gal'] },
  { name: 'Glide 130', img: '03', alt: '11', cat: 'recreation', price: 9800, hp: 130, speed: 50, seats: 3, fuel: 15.9, rating: 4.5, tags: ['Beginner Friendly', 'Tow Hook'] },
  { name: 'Voyage GTX 170', img: '11', alt: '36', cat: 'recreation', price: 13600, hp: 170, speed: 54, seats: 3, fuel: 18.5, rating: 4.8, featured: true, tags: ['Long-Range Tank', 'Comfort Seat'] },
  { name: 'Marina LX 195', img: '14', alt: '04', cat: 'recreation', price: 14200, hp: 195, speed: 56, seats: 3, fuel: 18.5, rating: 4.7, tags: ['Premium Trim', 'Bluetooth Audio'] },
  { name: 'Bay Breeze 160', img: '23', alt: '22', cat: 'recreation', price: 11900, hp: 160, speed: 52, seats: 3, fuel: 16.9, rating: 4.5, tags: ['Family Seat', 'Reboarding Step'] },
  { name: 'Sunset Tour 155', img: '22', alt: '30', cat: 'recreation', price: 12400, hp: 155, speed: 51, seats: 3, fuel: 18.5, rating: 4.6, tags: ['Touring Hull', 'USB Charging'] },
  { name: 'Lagoon 150', img: '08', alt: '24', cat: 'recreation', price: 11200, sale: 9990, hp: 150, speed: 51, seats: 3, fuel: 16.9, rating: 4.7, featured: true, tags: ['Shallow Draft', 'Eco Tuned'] },
  { name: 'Reef Runner 180', img: '36', alt: '41', cat: 'recreation', price: 13100, hp: 180, speed: 55, seats: 3, fuel: 18.5, rating: 4.8, tags: ['Saltwater Ready', 'Deep Seat'] },
  { name: 'Island Hopper 170', img: '24', alt: '08', cat: 'recreation', price: 12800, hp: 170, speed: 54, seats: 3, fuel: 18.5, rating: 4.6, tags: ['Cruise Assist', 'Wide Hull'] },
  { name: 'Tropic GT 155', img: '41', alt: '36', cat: 'recreation', price: 12100, hp: 155, speed: 52, seats: 3, fuel: 16.9, rating: 4.5, tags: ['Comfort Ride', 'Shade Ready'] },
  { name: 'Calm Water 130', img: '29', alt: '30', cat: 'recreation', price: 9600, hp: 130, speed: 49, seats: 2, fuel: 15.9, rating: 4.4, tags: ['Lake Tuned', 'Quiet Ride'] },
  { name: 'Horizon 160', img: '30', alt: '29', cat: 'recreation', price: 11700, hp: 160, speed: 53, seats: 3, fuel: 16.9, rating: 4.6, tags: ['Long Tours', 'Soft Hull'] },
  { name: 'Cabo Cruiser 175', img: '37', alt: '16', cat: 'recreation', price: 13400, hp: 175, speed: 55, seats: 3, fuel: 18.5, rating: 4.7, tags: ['Coastal Tuned', 'Premium Seat'] },
  { name: 'Sandbar 140', img: '26', alt: '27', cat: 'recreation', price: 10400, hp: 140, speed: 50, seats: 3, fuel: 15.9, rating: 4.4, tags: ['Beach Day', 'Easy Launch'] },
  { name: 'Driftwood 150', img: '27', alt: '26', cat: 'recreation', price: 10900, hp: 150, speed: 51, seats: 3, fuel: 16.9, rating: 4.5, tags: ['Durable Hull', 'Family Ready'] },
  { name: 'Coral 165', img: '40', alt: '41', cat: 'recreation', price: 12600, hp: 165, speed: 53, seats: 3, fuel: 18.5, rating: 4.6, tags: ['Showroom Finish', 'Comfort Seat'] },
  { name: 'Surfside 155', img: '16', alt: '37', cat: 'recreation', price: 11500, hp: 155, speed: 52, seats: 3, fuel: 16.9, rating: 4.5, tags: ['City Cruiser', 'Bluetooth Audio'] },
  { name: 'Breeze Lite 90', img: '10', alt: '15', cat: 'recreation', price: 7900, sale: 6990, hp: 90, speed: 46, seats: 2, fuel: 13.2, rating: 4.3, tags: ['Entry Model', 'Lightweight'] },
  { name: 'Spark 90', img: '15', alt: '10', cat: 'recreation', price: 7500, hp: 90, speed: 45, seats: 2, fuel: 13.2, rating: 4.3, tags: ['First Ski', 'Eco Mode'] },
  { name: 'Wave Lite 100', img: '17', alt: '25', cat: 'recreation', price: 8600, hp: 100, speed: 47, seats: 3, fuel: 15.9, rating: 4.4, tags: ['Affordable', 'Stable Hull'] },
  { name: 'Family GT 160', img: '09', alt: '31', cat: 'recreation', price: 11800, hp: 160, speed: 52, seats: 3, fuel: 18.5, rating: 4.6, tags: ['Three-Up Seat', 'Tow Ready'] },
  { name: 'Shoreline 145', img: '25', alt: '26', cat: 'recreation', price: 10200, hp: 145, speed: 50, seats: 3, fuel: 15.9, rating: 4.4, tags: ['Beach Launch', 'Reboarding Step'] },
  { name: 'Aqua Sport 200', img: '31', alt: '09', cat: 'recreation', price: 14600, hp: 200, speed: 57, seats: 3, fuel: 18.5, rating: 4.7, tags: ['Sport Touring', 'Premium Audio'] },
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const hullFor = (cat: Seed['cat']) =>
  cat === 'performance' ? 'T3-R Performance' : 'StableRide Touring';

function buildJetski(s: Seed, i: number): Product {
  const specs: ProductSpec[] = [
    { label: 'Engine', value: `${s.hp} HP` },
    { label: 'Top Speed', value: `${s.speed} mph` },
    { label: 'Seating', value: `${s.seats} riders` },
    { label: 'Fuel', value: `${s.fuel} gal` },
    { label: 'Hull', value: hullFor(s.cat) },
  ];
  return {
    id: `js-${slugify(s.name)}`,
    slug: slugify(s.name),
    name: s.name,
    category: s.cat,
    tagline:
      s.cat === 'performance'
        ? 'Race-bred power for riders who chase the horizon.'
        : 'Comfort, stability and all-day fun for the whole crew.',
    description:
      s.cat === 'performance'
        ? `The ${s.name} pairs a ${s.hp} HP powerplant with a ${hullFor(s.cat)} hull for razor-sharp handling and a top speed of ${s.speed} mph. Built for riders who want the open water on their terms.`
        : `The ${s.name} is a ${s.seats}-up jetski built for cruising. A forgiving ${hullFor(s.cat)} hull, ${s.fuel} gallon tank and ${s.hp} HP engine make every outing effortless — from sandbar hangs to long shoreline tours.`,
    price: s.price,
    sale_price: s.sale ?? null,
    currency: 'USD',
    images: [ski(s.img), ski(s.alt)],
    specs,
    highlights: s.tags,
    in_stock: true,
    featured: s.featured,
    rating: s.rating,
    created_at: new Date(Date.now() - i * 86_400_000).toISOString(),
  };
}

const ACCESSORIES: Product[] = [
  {
    id: 'acc-ecocast-speakers',
    slug: 'ecocast-marine-speakers',
    name: 'EcoCast Marine Speakers',
    category: 'accessories',
    tagline: 'Marine-grade sound that follows you on the water.',
    description:
      'Weatherproof speakers with EcoCast tuning. Crisp highs, deep lows, and corrosion-resistant hardware built for salt spray and full-throttle days.',
    price: 540,
    currency: 'USD',
    images: ['/images/accessory-marine-speakers.jpg'],
    specs: [
      { label: 'Power', value: '2 x 120W RMS' },
      { label: 'Rating', value: 'IP67 Marine' },
      { label: 'Mount', value: 'Universal' },
    ],
    highlights: ['IP67 Waterproof', 'EcoCast Tuning'],
    in_stock: true,
    rating: 4.8,
  },
  {
    id: 'acc-tow-rope',
    slug: 'pro-tow-rope-tube-kit',
    name: 'Pro Tow Rope & Tube Kit',
    category: 'accessories',
    tagline: 'Everything you need for tube day.',
    description:
      'A 60ft heavy-duty tow rope rated for 4 riders, plus a quick-connect harness and a 2-person towable tube. Bright, UV-stable, and built to last seasons.',
    price: 220,
    sale_price: 179,
    currency: 'USD',
    images: ['/images/accessory-tow-tube.jpg'],
    specs: [
      { label: 'Length', value: '60 ft' },
      { label: 'Rating', value: '4 riders' },
      { label: 'Material', value: 'UV-stable poly' },
    ],
    highlights: ['4-Rider Rated', 'Quick-Connect'],
    in_stock: true,
    rating: 4.5,
  },
  {
    id: 'acc-life-vest',
    slug: 'glide-life-vest-set',
    name: 'Glide Life Vest (Set of 4)',
    category: 'accessories',
    tagline: 'Coast Guard approved comfort for the whole crew.',
    description:
      'A set of four neoprene life vests in mixed sizes. Low-profile, flexible, and approved for watersports — the essential add-on for every new ski.',
    price: 260,
    currency: 'USD',
    images: ['/images/accessory-life-vests.jpg'],
    specs: [
      { label: 'Quantity', value: '4 vests' },
      { label: 'Material', value: 'Neoprene' },
      { label: 'Certification', value: 'USCG Type III' },
    ],
    highlights: ['USCG Approved', 'Neoprene Comfort'],
    in_stock: true,
    rating: 4.7,
  },
];

export const PRODUCTS: Product[] = [
  ...JETSKIS.map(buildJetski),
  ...ACCESSORIES,
];

export const findBySlug = (slug: string): Product | undefined =>
  PRODUCTS.find((p) => p.slug === slug);
