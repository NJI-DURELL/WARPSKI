import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { effectivePrice, formatCurrency } from '@/lib/utils';

export function Cart() {
  const { items, remove, setQuantity, clear } = useCartStore();
  const subtotal = useCartStore((s) => s.subtotal());
  const navigate = useNavigate();
  const total = subtotal;

  if (items.length === 0) {
    return (
      <div className="container-px flex min-h-[70vh] flex-col items-center justify-center pt-28 text-center">
        <ShoppingBag className="h-14 w-14 text-ink-600" />
        <h1 className="mt-6 text-3xl font-black">Your cart is empty</h1>
        <p className="mt-3 text-mist-muted">Time to find your perfect ride.</p>
        <Link to="/catalogue" className="btn-flame mt-6">
          Browse Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28">
      <div className="container-px py-10">
        <h1 className="text-4xl font-black sm:text-5xl">Your Cart</h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-ink-800/40 p-4 sm:flex-row"
              >
                <Link
                  to={`/product/${product.slug}`}
                  className="h-32 w-full overflow-hidden rounded-xl sm:h-28 sm:w-40"
                >
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        to={`/product/${product.slug}`}
                        className="text-lg font-bold text-white hover:text-flame"
                      >
                        {product.name}
                      </Link>
                      <p className="text-sm capitalize text-mist-muted">{product.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(product.id)}
                      className="text-mist-muted hover:text-red-400"
                      aria-label={`Remove ${product.name}`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center gap-1 rounded-full border border-white/15 p-1">
                      <button
                        type="button"
                        onClick={() => setQuantity(product.id, quantity - 1)}
                        className="grid h-8 w-8 place-items-center rounded-full text-white hover:bg-white/5"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums text-white">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(product.id, quantity + 1)}
                        className="grid h-8 w-8 place-items-center rounded-full text-white hover:bg-white/5"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-display text-lg font-bold text-white">
                      {formatCurrency(effectivePrice(product) * quantity, product.currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={clear}
              className="text-sm text-mist-muted underline-offset-4 hover:text-white hover:underline"
            >
              Clear cart
            </button>
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-2xl border border-white/10 bg-ink-800/40 p-6 lg:sticky lg:top-28">
            <h2 className="text-lg font-bold text-white">Order Summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-mist-muted">Subtotal</dt>
                <dd className="text-white">{formatCurrency(subtotal)}</dd>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 text-base">
                <dt className="font-bold text-white">Total</dt>
                <dd className="font-display text-xl font-black text-flame">{formatCurrency(total)}</dd>
              </div>
            </dl>
            <button type="button" onClick={() => navigate('/checkout')} className="btn-flame mt-6 w-full">
              Proceed to Checkout
            </button>
            <Link
              to="/catalogue"
              className="mt-3 block text-center text-sm text-mist-muted hover:text-white"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Cart;
