import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '@/components/ui/ProductCard';
import { PageLoader } from '@/components/ui/Spinner';
import { useGsapReveal } from '@/hooks/useGsapReveal';
import { fetchProducts } from '@/lib/catalog';
import { cn } from '@/lib/utils';
import { Seo } from '@/components/Seo';
import type { Category, Product } from '@/types';

const FILTERS: { value: Category | 'all'; label: string }[] = [
  { value: 'all',         label: 'All' },
  { value: 'performance', label: 'Performance' },
  { value: 'recreation',  label: 'Recreation' },
  { value: 'second_hand', label: 'Fairly Used' },
  { value: 'accessories', label: 'Accessories' },
];

type SortKey = 'featured' | 'price-asc' | 'price-desc';

export function Catalogue() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>('featured');
  const gridRef = useGsapReveal<HTMLDivElement>();

  const active = (params.get('category') as Category | null) ?? 'all';

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchProducts()
      .then((data) => alive && setProducts(data))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const visible = useMemo(() => {
    let list = active === 'all' ? products : products.filter((p) => p.category === active);
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, active, sort]);

  const setCategory = (cat: Category | 'all') => {
    if (cat === 'all') setParams({});
    else setParams({ category: cat });
  };

  return (
    <div className="pt-28">
      <Seo
        title="Jetski Catalogue"
        description="Browse the full WarpSki range — performance and recreation jetskis of every kind, plus marine-grade accessories."
      />
      <header className="container-px py-10">
        <span className="eyebrow">
          <span className="h-px w-8 bg-flame" /> Catalogue
        </span>
        <h1 className="mt-4 text-4xl font-black sm:text-6xl">Find your jetski</h1>
        <p className="mt-3 max-w-lg text-mist-muted">
          Explore the full WarpSki range — performance and recreation jetskis of every kind, plus the gear to go with them.
        </p>
      </header>

      <div className="container-px sticky top-[68px] z-30 -mx-px flex flex-wrap items-center justify-between gap-4 border-y border-white/10 bg-ink-950/80 py-4 backdrop-blur">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setCategory(f.value)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                active === f.value
                  ? 'bg-flame text-white'
                  : 'border border-white/15 text-mist-muted hover:text-white',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-mist-muted">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm text-white focus:border-flame/60"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </label>
      </div>

      <div className="container-px py-12">
        {loading ? (
          <PageLoader />
        ) : visible.length === 0 ? (
          <p className="py-24 text-center text-mist-muted">No products in this category yet.</p>
        ) : (
          <div ref={gridRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Catalogue;
