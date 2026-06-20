import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import SocialLoginButtons from '../../components/SocialLoginButtons';
import { getFriendlyAuthError, getSafeNextPath } from '../../lib/authRedirect';
import { supabase } from '../../lib/supabase';

export default function StaffLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setLoading(false);
      setError(getFriendlyAuthError(signInError.message));
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    setLoading(false);

    if (profileError || !profile || !['admin', 'employee'].includes(String(profile.role))) {
      await supabase.auth.signOut();
      setError('This account is not allowed to access the Savannah staff app.');
      return;
    }

    const redirect = Array.isArray(router.query.redirect) ? router.query.redirect[0] : router.query.redirect;
    router.push(getSafeNextPath(redirect, '/staff'));
  }

  const redirectPath = getSafeNextPath(router.query.redirect, '/staff');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black pb-16 pt-8">
      <section className="w-full max-w-md rounded-2xl border border-luxury-accent/30 bg-black/70 p-8 shadow-2xl" aria-labelledby="staff-login-title">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-luxury-accent/80">Staff app</p>
        <h1 id="staff-login-title" className="text-4xl font-serif font-bold text-luxury-accent">Staff Sign In</h1>
        <p className="mt-3 text-sm text-white/70">Admin and employee access for Savannah Bar & Grill operations.</p>

        <SocialLoginButtons context="staff" redirectTo={redirectPath} onError={setError} className="mt-6" />

        <div className="mt-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
          <span className="h-px flex-1 bg-white/15" />
          <span>Email</span>
          <span className="h-px flex-1 bg-white/15" />
        </div>

        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-semibold text-white/80">
            Email
            <input className="min-h-12 rounded-lg border border-luxury-accent/50 bg-black/40 px-4 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-luxury-accent" value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-white/80">
            Password
            <input className="min-h-12 rounded-lg border border-luxury-accent/50 bg-black/40 px-4 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-luxury-accent" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required />
          </label>

          {error && <p className="rounded-lg border border-red-400/50 bg-red-950/50 px-4 py-3 text-sm text-red-100">{error}</p>}

          <button type="submit" disabled={loading} className="luxury-cta min-h-12 rounded-full bg-gradient-to-r from-luxury-accent to-yellow-400 px-8 py-3 text-lg font-bold text-black disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </section>
    </main>
  );
}
