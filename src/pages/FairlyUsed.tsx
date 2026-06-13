import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/ui/ProductCard';
import { PageLoader } from '@/components/ui/Spinner';
import { useGsapReveal } from '@/hooks/useGsapReveal';
import { fetchProducts } from '@/lib/catalog';
import { Seo } from '@/components/Seo';
import type { Product } from '@/types';

export function FairlyUsed() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const gridRef = useGsapReveal<HTMLDivElement>();

  useEffect(() => {
    let alive = true;
    fetchProducts('second_hand')
      .then((data) => alive && setProducts(data))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="pt-28">
      <Seo
        title="Fairly Used Jetskis"
        description="Browse WarpSki's carefully inspected pre-owned jetskis. Every listing is honest about condition, hours, and history — so you know exactly what you're getting."
      />
      <header className="container-px py-10">
        <span className="eyebrow">
          <span className="h-px w-8 bg-flame" /> Fairly Used
        </span>
        <h1 className="mt-4 text-4xl font-black sm:text-6xl">Pre-owned jetskis</h1>
        <p className="mt-3 max-w-lg text-mist-muted">
          Every ski here is fully inspected, honestly described, and priced to reflect real condition. Real hours. Real history. No surprises.
        </p>
      </header>

      <div className="container-px py-8">
        {loading ? (
          <PageLoader />
        ) : products.length === 0 ? (
          <p className="py-24 text-center text-mist-muted">No fairly used listings right now — check back soon.</p>
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

export default FairlyUsed;
