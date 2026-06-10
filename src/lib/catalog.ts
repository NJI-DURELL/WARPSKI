import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { PRODUCTS, findBySlug } from '@/data/products';
import type { Category, Product } from '@/types';

/**
 * Read products from Supabase when configured, otherwise fall back to the local
 * demo catalogue. Network/permission failures also fall back gracefully so the
 * storefront never shows an empty shelf.
 */
export async function fetchProducts(category?: Category): Promise<Product[]> {
  if (!isSupabaseConfigured) {
    return category ? PRODUCTS.filter((p) => p.category === category) : PRODUCTS;
  }
  let query = supabase.from('products').select('*').order('created_at', { ascending: false });
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error || !data || data.length === 0) {
    return category ? PRODUCTS.filter((p) => p.category === category) : PRODUCTS;
  }
  return data as Product[];
}

export async function fetchProductBySlug(slug: string): Promise<Product | undefined> {
  if (!isSupabaseConfigured) return findBySlug(slug);
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return findBySlug(slug);
  return data as Product;
}
