import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { getAuthContext, getFallbackPath, getFriendlyAuthError, getSafeNextPath } from '../../lib/authRedirect';
import type { AuthProfile } from '../../types/app';

export const getServerSideProps = async () => {
  return {
    props: {},
  };
};

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady) return;

    let active = true;

    async function finishSignIn() {
      const context = getAuthContext(router.query.context);
      const fallback = getFallbackPath(context);
      const nextPath = getSafeNextPath(router.query.next, fallback);
      const callbackError = Array.isArray(router.query.error_description)
        ? router.query.error_description[0]
        : router.query.error_description;

      if (callbackError) {
        setError(getFriendlyAuthError(callbackError));
        return;
      }

      const code = Array.isArray(router.query.code) ? router.query.code[0] : router.query.code;

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (active) setError(getFriendlyAuthError(exchangeError.message));
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (active) setError('We could not finish signing you in. Please try again.');
        return;
      }

      if (context === 'staff') {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, role')
          .eq('id', session.user.id)
          .single();

        const role = (profile as AuthProfile | null)?.role;
        if (profileError || !role || !['admin', 'employee'].includes(role)) {
          await supabase.auth.signOut();
          if (active) setError('This social account is not allowed to access the Savannah staff app.');
          return;
        }
      }

      router.replace(nextPath);
    }

    finishSignIn();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-16">
      <section className="w-full max-w-md rounded-2xl border border-luxury-accent/30 bg-black/70 p-8 text-center shadow-2xl">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-luxury-accent/80">Savannah account</p>
        <h1 className="text-4xl font-serif font-bold text-luxury-accent">{error ? 'Sign In Issue' : 'Finishing Sign In'}</h1>
        {error ? (
          <>
            <p className="mt-4 rounded-lg border border-red-400/50 bg-red-950/50 px-4 py-3 text-sm text-red-100">{error}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/login" className="rounded-full border border-luxury-accent/50 px-6 py-3 font-bold text-luxury-accent hover:bg-luxury-accent hover:text-black">Customer Login</Link>
              <Link href="/staff/login" className="rounded-full border border-white/30 px-6 py-3 font-bold text-white hover:border-luxury-accent hover:text-luxury-accent">Staff Login</Link>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-white/70">Hold tight while Supabase returns your session.</p>
        )}
      </section>
    </main>
  );
}
