import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { BareLayout, StoreLayout } from '@/components/layout/Layout';
import { ProtectedRoute, AdminRoute } from '@/components/routing/Guards';
import { PageLoader } from '@/components/ui/Spinner';
import { useAuthStore } from '@/store/authStore';
import Home from '@/pages/Home';

// Route-level code splitting keeps the initial (hero) bundle lean.
const Catalogue = lazy(() => import('@/pages/Catalogue'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Accessories = lazy(() => import('@/pages/Accessories'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const Contact = lazy(() => import('@/pages/Contact'));
const Auth = lazy(() => import('@/pages/Auth'));
const Account = lazy(() => import('@/pages/Account'));
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export default function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    void init();
  }, [init]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Storefront (with nav + footer + cart) */}
        <Route element={<StoreLayout />}>
          <Route index element={<Home />} />
          <Route path="catalogue" element={<Catalogue />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="accessories" element={<Accessories />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="contact" element={<Contact />} />
          <Route
            path="account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Bare screens (no storefront chrome) */}
        <Route element={<BareLayout />}>
          <Route path="auth" element={<Auth />} />
          {/* Hidden admin login — not linked anywhere public */}
          <Route path="admin/login" element={<AdminLogin />} />
          <Route
            path="admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
