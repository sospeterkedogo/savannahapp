import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function resolveSupabaseConfig() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    '';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';
  return { supabaseUrl, supabaseAnonKey };
}

/** Server or one-off client (no singleton). Works with Cloudflare wrangler vars at runtime. */
export function createPublicSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = resolveSupabaseConfig();
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are missing.');
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

export const getSupabase = () => {
  if (supabaseClient) return supabaseClient;
  supabaseClient = createPublicSupabaseClient();
  return supabaseClient;
};

/** Lazy browser singleton — safe to import from client components. */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(client) : value;
  },
});
