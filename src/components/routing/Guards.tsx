import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PageLoader } from '@/components/ui/Spinner';

/** Requires any authenticated user; otherwise redirects to /auth. */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuthStore();
  const location = useLocation();

  if (initializing) return <PageLoader />;
  if (!user) return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}

/**
 * Requires an authenticated user whose id exists in the `admins` table.
 * Admin status is verified server-side via RLS in the auth store. Non-admins
 * are bounced to the hidden admin login rather than leaking the dashboard.
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, initializing } = useAuthStore();

  if (initializing) return <PageLoader />;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
