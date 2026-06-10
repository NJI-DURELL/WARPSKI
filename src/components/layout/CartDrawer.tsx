import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { effectivePrice, formatCurrency } from '@/lib/utils';

export function CartDrawer() {
  const { items, isOpen, close, remove, setQuantity } = useCartStore();
  const subtotal = useCartStore((s) => s.subtotal());
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    if (isOpen) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, close]);

  return (
    <>
      <div
        aria-hidden={!isOpen}
        onClick={close}
        className={`fixed inset-0 z-[60] bg-ink-950/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-ink-900 shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <ShoppingBag className="h-5 w-5 text-flame" /> Your Cart
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-mist-muted hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-ink-600" />
            <p className="text-mist-muted">Your cart is empty.</p>
            <Link to="/catalogue" onClick={close} className="btn-flame">
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-4 rounded-xl border border-white/10 bg-ink-800/50 p-3"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/product/${product.slug}`}
                        onClick={close}
                        className="truncate text-sm font-semibold text-white hover:text-flame"
                      >
                        {product.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(product.id)}
                        aria-label={`Remove ${product.name}`}
                        className="text-mist-muted hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-sm text-flame">
                      {formatCurrency(effectivePrice(product), product.currency)}
                    </span>
                    <div className="mt-auto flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity(product.id, quantity - 1)}
                        className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-white hover:bg-white/5"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm tabular-nums text-white">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(product.id, quantity + 1)}
                        className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-white hover:bg-white/5"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-mist-muted">Subtotal</span>
                <span className="font-display text-xl font-bold text-white">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  close();
                  navigate('/checkout');
                }}
                className="btn-flame w-full"
              >
                Checkout
              </button>
              <p className="mt-3 text-center text-xs text-mist-muted">
                Taxes & shipping calculated at checkout.
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
