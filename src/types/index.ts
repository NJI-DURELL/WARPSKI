export type Category = 'performance' | 'recreation' | 'accessories' | 'parts' | 'second_hand';

export const CATEGORY_LABELS: Record<Category, string> = {
  performance:  'Performance',
  recreation:   'Recreation',
  accessories:  'Accessories',
  parts:        'Parts',
  second_hand:  'Fairly Used',
};

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Review {
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  tagline: string;
  description: string;
  price: number;
  sale_price?: number | null;
  currency: string;
  images: string[];
  specs: ProductSpec[];
  highlights: string[];
  in_stock: boolean;
  featured?: boolean;
  rating?: number;
  reviews?: Review[];
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
