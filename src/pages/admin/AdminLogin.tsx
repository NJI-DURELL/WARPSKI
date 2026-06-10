import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, ShieldAlert } from 'lucide-react';
import { loginSchema } from '@/lib/validations';
import { fieldErrors, sanitizeError } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Seo } from '@/components/Seo';

/**
 * Hidden admin entry point at /admin/login — intentionally not linked from the
 * public storefront or the regular Auth page. Successful auth still has to pass
 * the `admins` table check (verified in the store) before the dashboard renders.
 */
export function AdminLogin() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, refreshAdmin } = useAuthStore();

  // Already an authenticated admin? Skip straight to the dashboard.
  useEffect(() => {
    if (user && isAdmin) navigate('/admin/dashboard', { replace: true });
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError('');
    const raw = Object.fromEntries(new FormData(e.currentTarget).entries());
    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error.flatten()));
      return;
    }
    setErrors({});

    if (!isSupabaseConfigured) {
      setServerError('Admin auth requires Supabase configuration in .env.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) throw error;

      await refreshAdmin();
      // Re-read the latest store value after the async admin check.
      if (useAuthStore.getState().isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        await supabase.auth.signOut();
        setServerError('This account does not have admin access.');
      }
    } catch (err) {
      setServerError(sanitizeError(err, 'Sign in failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-ink-950 px-5">
      <Seo title="Admin Access" noindex />
      <div className="grain absolute inset-0 opacity-30" />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-ink-900/80 p-8 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-flame/10 text-flame">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-xl font-black text-white">Admin Access</h1>
            <p className="text-xs text-mist-muted">Authorized personnel only</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="label">Admin email</label>
            <input id="email" name="email" type="email" autoComplete="email" className="field" placeholder="admin@warpski.example" />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="field pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mist-muted hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          {serverError && (
            <p className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              <ShieldAlert className="h-4 w-4 flex-shrink-0" /> {serverError}
            </p>
          )}

          <Button type="submit" loading={submitting} className="w-full">
            <Lock className="h-4 w-4" /> Secure Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
