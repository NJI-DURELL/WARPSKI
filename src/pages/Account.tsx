import { Link } from 'react-router-dom';
import { LogOut, Package, Settings, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';

export function Account() {
  const { user, isAdmin, signOut } = useAuthStore();
  const name = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? 'Rider';

  return (
    <div className="pt-28">
      <div className="container-px py-10">
        <span className="eyebrow">
          <span className="h-px w-8 bg-flame" /> Owner Zone
        </span>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black sm:text-5xl">Welcome, {name.split('@')[0]}</h1>
            <p className="mt-2 text-mist-muted">{user?.email}</p>
          </div>
          <Button variant="ghost" onClick={() => void signOut()}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-ink-800/40 p-6">
            <Package className="h-7 w-7 text-flame" />
            <h2 className="mt-4 text-lg font-bold text-white">Your orders</h2>
            <p className="mt-1 text-sm text-mist-muted">
              No orders yet. Browse the catalogue to get started.
            </p>
            <Link to="/catalogue" className="mt-4 inline-block text-sm font-semibold text-flame">
              Shop now →
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-800/40 p-6">
            <Settings className="h-7 w-7 text-flame" />
            <h2 className="mt-4 text-lg font-bold text-white">Account settings</h2>
            <p className="mt-1 text-sm text-mist-muted">
              Manage your profile, addresses, and notification preferences.
            </p>
          </div>

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="rounded-2xl border border-flame/30 bg-flame/5 p-6 transition-colors hover:bg-flame/10"
            >
              <ShieldCheck className="h-7 w-7 text-flame" />
              <h2 className="mt-4 text-lg font-bold text-white">Admin dashboard</h2>
              <p className="mt-1 text-sm text-mist-muted">
                Manage products and upload imagery. Admin access detected.
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-flame">
                Open dashboard →
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Account;
