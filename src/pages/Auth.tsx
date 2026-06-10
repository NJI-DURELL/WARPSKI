import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, LogIn } from 'lucide-react';
import { loginSchema, signupSchema } from '@/lib/validations';
import { fieldErrors, sanitizeError } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Seo } from '@/components/Seo';
import { CONTACT } from '@/config';

type Mode = 'login' | 'signup';

export function Auth() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/account';

  const switchMode = (m: Mode) => {
    setMode(m);
    setErrors({});
    setServerError('');
    setNotice('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError('');
    setNotice('');
    const raw = Object.fromEntries(new FormData(e.currentTarget).entries());

    const schema = mode === 'login' ? loginSchema : signupSchema;
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error.flatten()));
      return;
    }
    setErrors({});

    if (!isSupabaseConfigured) {
      setServerError('Auth is not configured. Add your Supabase keys to .env to enable sign in.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        const { email: em, password } = parsed.data as { email: string; password: string };
        const { error } = await supabase.auth.signInWithPassword({ email: em, password });
        if (error) throw error;
        navigate(from, { replace: true });
      } else {
        const { email: em, password, fullName } = parsed.data as {
          email: string;
          password: string;
          fullName: string;
        };
        const { error } = await supabase.auth.signUp({
          email: em,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        setNotice('Account created. Check your email to confirm, then sign in.');
        setMode('login');
      }
    } catch (err) {
      setServerError(sanitizeError(err, 'Authentication failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async () => {
    setServerError('');
    setNotice('');
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setServerError('Enter your email above first, then tap “Forgot password”.');
      return;
    }
    if (!isSupabaseConfigured) {
      setServerError('Password reset requires Supabase configuration.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) setServerError(sanitizeError(error, 'Could not send reset link.'));
    else setNotice('Password reset link sent. Check your inbox.');
  };

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <Seo title={mode === 'login' ? 'Sign In' : 'Create Account'} noindex />

      {/* ── Brand panel ── */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="/images/jetskis/jetski-35.jpg"
          alt="Jetski rider on open water"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/40" />
        {/* radial rings accent */}
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full border border-white/10" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center justify-between">
            <Logo />
            <span className="text-xs font-medium text-mist-muted">Premium jetskis for you.</span>
          </div>
          <div>
            <h2 className="max-w-sm font-display text-4xl font-black leading-tight text-white">
              The ride of a lifetime — any time you want.
            </h2>
            <p className="mt-4 max-w-sm text-mist-muted">
              Sign in to track orders, save favourites, and manage your WarpSki jetskis.
            </p>
          </div>
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="relative flex items-center justify-center px-5 py-16 sm:px-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-mist-muted hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Back to store
            </Link>
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              className="text-sm font-semibold text-flame hover:text-flame-400"
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          <div className="mt-10 flex items-center gap-2 lg:hidden">
            <Logo />
          </div>

          <h1 className="mt-8 font-display text-4xl font-black">
            {mode === 'login' ? 'Sign In' : 'Create account'}
          </h1>
          <p className="mt-2 text-sm text-mist-muted">
            {mode === 'login'
              ? 'Welcome back. Enter your details to continue.'
              : 'Join WarpSki to start your adventure.'}
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="fullName" className="label">Full name</label>
                <input id="fullName" name="fullName" className="field" placeholder="Jane Rider" autoComplete="name" />
                {errors.fullName && <p className="field-error">{errors.fullName}</p>}
              </div>
            )}
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="label">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={handleForgot}
                    className="mb-1.5 text-xs font-medium text-flame hover:text-flame-400"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="label">Confirm password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="field"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
              </div>
            )}

            {serverError && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {serverError}
              </p>
            )}
            {notice && (
              <p className="rounded-lg border border-flame/20 bg-flame/10 px-3 py-2 text-sm text-flame-400">
                {notice}
              </p>
            )}

            <Button type="submit" loading={submitting} className="w-full !rounded-xl">
              <LogIn className="h-4 w-4" />
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-between text-xs text-mist-muted">
            <span>Protected by encrypted sessions.</span>
            <a href={`mailto:${CONTACT.email}`} className="hover:text-white">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
