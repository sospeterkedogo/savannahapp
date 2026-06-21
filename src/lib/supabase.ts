import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { hasSupabaseConfig, resolveSupabaseConfig } from './publicEnv';

export { resolveSupabaseConfig, hasSupabaseConfig };

let supabaseClient: SupabaseClient | null = null;

/** Server or one-off client (no singleton). Works with Cloudflare wrangler vars at runtime. */
export function createPublicSupabaseClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = resolveSupabaseConfig();
  if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase environment variables are missing.');
  }
  return createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

export const getSupabase = () => {
  if (supabaseClient) return supabaseClient;
  supabaseClient = createPublicSupabaseClient();
  return supabaseClient;
};

/** Lazy browser singleton — reads runtime env injected in _document when build omitted vars. */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(client) : value;
  },
});
