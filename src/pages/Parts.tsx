import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/ui/ProductCard';
import { PageLoader } from '@/components/ui/Spinner';
import { useGsapReveal } from '@/hooks/useGsapReveal';
import { fetchProducts } from '@/lib/catalog';
import type { Product } from '@/types';

export function Parts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const gridRef = useGsapReveal<HTMLDivElement>();

  useEffect(() => {
    let alive = true;
    fetchProducts('parts')
      .then((data) => alive && setProducts(data))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="pt-28">
      <header className="container-px py-10">
        <span className="eyebrow">
          <span className="h-px w-8 bg-flame" /> Parts
        </span>
        <h1 className="mt-4 text-4xl font-black sm:text-6xl">Genuine parts</h1>
        <p className="mt-3 max-w-lg text-mist-muted">
          OEM and aftermarket jet-ski parts — engines, impellers, ECUs, steering systems and more, all inspected and ready to ship.
        </p>
      </header>

      <div className="container-px py-8">
        {loading ? (
          <PageLoader />
        ) : (
          <div ref={gridRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Parts;
