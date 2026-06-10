import { Link } from 'react-router-dom';
import { ArrowUpRight, Star } from 'lucide-react';
import type { Product } from '@/types';
import { effectivePrice, formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

export function ProductCard({ product }: { product: Product }) {
  const add = useCartStore((s) => s.add);
  const open = useCartStore((s) => s.open);
  const onSale = product.sale_price && product.sale_price > 0;

  return (
    <article
      data-reveal
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-800/50 transition-colors duration-300 hover:border-white/20"
    >
      <Link to={`/product/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
        {onSale && (
          <span className="absolute left-3 top-3 rounded-full bg-flame px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            Sale
          </span>
        )}
        {!product.in_stock && (
          <span className="absolute right-3 top-3 rounded-full bg-ink-950/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-mist-muted">
            Sold out
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 flex items-center justify-between gap-2">
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

        <h3 className="text-lg font-bold text-white">
          <Link to={`/product/${product.slug}`} className="hover:text-flame">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-mist-muted">{product.tagline}</p>

        <div className="mt-4 flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col">
            {onSale && (
              <span className="text-xs text-mist-muted line-through">
                {formatCurrency(product.price, product.currency)}
              </span>
            )}
            <span className="font-display text-xl font-bold text-white">
              {formatCurrency(effectivePrice(product), product.currency)}
            </span>
          </div>

          <button
            type="button"
            disabled={!product.in_stock}
            onClick={() => {
              add(product);
              open();
            }}
            aria-label={`Add ${product.name} to cart`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-flame text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-flame-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUpRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </article>
  );
}
