export type SavannahPublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
};

declare global {
  interface Window {
    __SAVANNAH_PUBLIC_ENV__?: Partial<SavannahPublicEnv> & {
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
    };
  }
}

function readProcessEnv(name: string): string {
  if (typeof process === 'undefined') return '';
  return process.env[name] || '';
}

/** Resolve Supabase config from build-time env and runtime HTML injection (Cloudflare). */
export function resolveSupabaseConfig(): SavannahPublicEnv {
  const runtime = typeof window !== 'undefined' ? window.__SAVANNAH_PUBLIC_ENV__ : undefined;

  const supabaseUrl =
    readProcessEnv('NEXT_PUBLIC_SUPABASE_URL') ||
    readProcessEnv('SUPABASE_URL') ||
    runtime?.NEXT_PUBLIC_SUPABASE_URL ||
    runtime?.SUPABASE_URL ||
    '';

  const supabaseAnonKey =
    readProcessEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
    readProcessEnv('SUPABASE_ANON_KEY') ||
    runtime?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    runtime?.SUPABASE_ANON_KEY ||
    '';

  return {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
  };
}

export function hasSupabaseConfig(): boolean {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = resolveSupabaseConfig();
  return Boolean(NEXT_PUBLIC_SUPABASE_URL && NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
