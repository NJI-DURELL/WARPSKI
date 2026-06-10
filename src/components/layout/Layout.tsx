import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';

/** Scrolls to top on every route change. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }), [pathname]);
  return null;
}

/** Keyboard users can jump straight to content, skipping the nav. */
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-flame focus:px-5 focus:py-2.5 focus:font-display focus:text-sm focus:font-bold focus:text-white"
    >
      Skip to content
    </a>
  );
}

/** Public storefront shell: nav + content + footer + cart drawer. */
export function StoreLayout() {
  return (
    <>
      <SkipLink />
      <ScrollToTop />
      <Navbar />
      <CartDrawer />
      <main id="main-content" tabIndex={-1} className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

/** Bare shell for auth/admin screens (no nav chrome). */
export function BareLayout() {
  return (
    <>
      <ScrollToTop />
      <main className="min-h-screen">
        <Outlet />
      </main>
    </>
  );
}
