import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { Logo } from '@/components/ui/Logo';

const NAV = [
  { to: '/catalogue',   label: 'Catalogue' },
  { to: '/fairly-used', label: 'Fairly Used' },
  { to: '/accessories', label: 'Accessories' },
  { to: '/parts',       label: 'Parts' },
  { to: '/contact',     label: 'Contact' },
  { to: '/account',     label: 'Owner Zone' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = useCartStore((s) => s.count());
  const openCart = useCartStore((s) => s.open);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'glass py-3' : 'bg-transparent py-5',
      )}
    >
      <nav className="container-px flex items-center justify-between">
        <Logo />

        <div className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium transition-colors hover:text-white',
                  isActive ? 'text-white' : 'text-mist-muted',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/5"
            aria-label={`Cart, ${count} items`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart ({count})</span>
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-flame px-1 text-xs font-bold tabular-nums sm:hidden">
              {count}
            </span>
          </button>

          <button
            type="button"
            className="inline-grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="glass mx-5 mt-3 rounded-2xl p-4 lg:hidden">
          <div className="flex flex-col">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="rounded-lg px-3 py-3 text-sm font-medium text-mist-muted hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
