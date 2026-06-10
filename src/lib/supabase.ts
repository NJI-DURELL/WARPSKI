import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * `true` only when real Supabase credentials are present. The UI uses this to
 * fall back to local demo data so the site is fully browsable without a backend.
 */
export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('YOUR-PROJECT'),
);

/**
 * A single shared client. Auth tokens are persisted to localStorage and
 * auto-refreshed by the SDK; we never hand-roll token storage.
 */
export const supabase: SupabaseClient = createClient(
  url ?? 'https://placeholder.supabase.co',
  anonKey ?? 'public-anon-placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  },
);
