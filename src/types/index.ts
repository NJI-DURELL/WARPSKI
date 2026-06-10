/** WarpSki sells jetskis only — organised by riding style — plus accessories. */
export type Category = 'performance' | 'recreation' | 'accessories';

export const CATEGORY_LABELS: Record<Category, string> = {
  performance: 'Performance',
  recreation: 'Recreation',
  accessories: 'Accessories',
};

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  tagline: string;
  description: string;
  price: number;
  /** Optional sale price; when present it overrides `price` at checkout. */
  sale_price?: number | null;
  currency: string;
  images: string[];
  specs: ProductSpec[];
  /** Hardware/feature pins shown on the product art. */
  highlights: string[];
  in_stock: boolean;
  featured?: boolean;
  rating?: number;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AdminRecord {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
}

export type Session = import('@supabase/supabase-js').Session;
export type AuthUser = import('@supabase/supabase-js').User;
