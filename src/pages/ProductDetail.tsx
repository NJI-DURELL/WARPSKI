import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Minus, Plus, ShoppingBag, Star } from 'lucide-react';
import { fetchProductBySlug } from '@/lib/catalog';
import { effectivePrice, formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import type { Product } from '@/types';

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const add = useCartStore((s) => s.add);
  const openCart = useCartStore((s) => s.open);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setProduct(undefined);
    setActiveImg(0);
    setQty(1);
    fetchProductBySlug(slug).then((p) => alive && setProduct(p ?? null));
    return () => {
      alive = false;
    };
  }, [slug]);

  if (product === undefined) return <div className="pt-28"><PageLoader /></div>;

  if (product === null) {
    return (
      <div className="container-px flex min-h-[70vh] flex-col items-center justify-center pt-28 text-center">
        <h1 className="text-3xl font-black">Product not found</h1>
        <p className="mt-3 text-mist-muted">We couldn&apos;t find that craft.</p>
        <Link to="/catalogue" className="btn-flame mt-6">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const onSale = product.sale_price && product.sale_price > 0;

  const handleAdd = () => {
    add(product, qty);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="pt-28">
      <div className="container-px py-8">
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-2 text-sm text-mist-muted hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Catalogue
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          {/* Gallery */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-ink-800">
              <img
                src={product.images[activeImg]}
                alt={`${product.name} view ${activeImg + 1}`}
                className="h-full w-full object-cover"
              />
              {onSale && (
                <span className="absolute left-4 top-4 rounded-full bg-flame px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  On Sale
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`h-20 w-24 overflow-hidden rounded-xl border-2 transition-colors ${
                      i === activeImg ? 'border-flame' : 'border-white/10 hover:border-white/30'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-flame">
                {product.category}
              </span>
              {product.rating && (
                <span className="inline-flex items-center gap-1 text-xs text-mist-muted">
                  <Star className="h-3.5 w-3.5 fill-flame text-flame" />
                  {product.rating.toFixed(1)}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-4xl font-black sm:text-5xl">{product.name}</h1>
            <p className="mt-3 text-lg text-mist-muted">{product.tagline}</p>

            <div className="mt-6 flex items-end gap-3">
              <span className="font-display text-4xl font-black text-white">
                {formatCurrency(effectivePrice(product), product.currency)}
              </span>
              {onSale && (
                <span className="pb-1 text-lg text-mist-muted line-through">
                  {formatCurrency(product.price, product.currency)}
                </span>
              )}
            </div>

            <p className="mt-6 leading-relaxed text-mist">{product.description}</p>

            {/* Quantity + add */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 rounded-full border border-white/15 p-1">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/5"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-lg font-semibold tabular-nums text-white">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  className="grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/5"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button onClick={handleAdd} disabled={!product.in_stock} className="flex-1 sm:flex-none">
                {added ? (
                  <>
                    <Check className="h-4 w-4" /> Added
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    {product.in_stock ? 'Add to Cart' : 'Sold Out'}
                  </>
                )}
              </Button>
            </div>

            {/* Highlights */}
            {product.highlights.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {product.highlights.map((h) => (
                  <span
                    key={h}
                    className="rounded-full border border-white/10 bg-ink-800/60 px-3 py-1.5 text-xs font-medium text-mist"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}

            {/* Specs */}
            <div className="mt-10 rounded-2xl border border-white/10 bg-ink-800/40">
              <h2 className="border-b border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-wide text-white">
                Specifications
              </h2>
              <dl className="divide-y divide-white/5">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="flex items-center justify-between px-6 py-3.5">
                    <dt className="text-sm text-mist-muted">{spec.label}</dt>
                    <dd className="text-sm font-semibold text-white">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
