import { create } from 'zustand';
import type { Session, AuthUser } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: AuthUser | null;
  isAdmin: boolean;
  /** Until the initial session check resolves we render a neutral loading state. */
  initializing: boolean;
  init: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Verifies admin status against the `admins` table. RLS ensures a user can only
 * ever see their own admin row, so a returned row === the caller is an admin.
 */
async function checkAdmin(userId: string | undefined): Promise<boolean> {
  if (!userId || !isSupabaseConfigured) return false;
  const { data, error } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isAdmin: false,
  initializing: true,

  init: async () => {
    if (!isSupabaseConfigured) {
      set({ initializing: false });
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const isAdmin = await checkAdmin(session?.user?.id);
    set({ session, user: session?.user ?? null, isAdmin, initializing: false });

    // Keep the store in sync with token refreshes, sign-ins and sign-outs.
    supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      const nextIsAdmin = await checkAdmin(nextSession?.user?.id);
      set({
        session: nextSession,
        user: nextSession?.user ?? null,
        isAdmin: nextIsAdmin,
      });
    });
  },

  refreshAdmin: async () => {
    const isAdmin = await checkAdmin(get().user?.id);
    set({ isAdmin });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, isAdmin: false });
  },
}));
