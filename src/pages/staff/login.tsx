import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import SocialLoginButtons from '../../components/SocialLoginButtons';
import { getFriendlyAuthError, getSafeNextPath } from '../../lib/authRedirect';
import { supabase } from '../../lib/supabase';
import {
  VahaAlert,
  VahaButton,
  VahaPageShell,
  VahaPanel,
  vahaInputClass,
} from '../../components/vaha/VahaUI';

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
    <VahaPageShell>
      <div className="vaha-container flex min-h-[70vh] items-center justify-center py-10">
        <VahaPanel
          className="w-full max-w-md"
          eyebrow="Staff app"
          title="Staff Sign In"
          description="Admin and employee access for Savannah Bar & Grill operations."
        >
          <SocialLoginButtons context="staff" redirectTo={redirectPath} onError={setError} className="mt-6" />

          <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-widest text-vaha-muted/60">
            <span className="h-px flex-1 bg-white/10" />
            <span>Email</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form className="mt-6 flex flex-col gap-3" onSubmit={handleSubmit}>
            <input className={vahaInputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" type="email" autoComplete="email" required />
            <input className={vahaInputClass} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" aria-label="Password" type="password" autoComplete="current-password" required />

            {error ? <VahaAlert tone="error">{error}</VahaAlert> : null}

            <VahaButton type="submit" variant="solid" disabled={loading} className="w-full">
              {loading ? 'Signing In…' : 'Sign In'}
            </VahaButton>
          </form>
        </VahaPanel>
      </div>
    </VahaPageShell>
  );
}
