import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import SocialLoginButtons from '../components/SocialLoginButtons';
import { getFriendlyAuthError, getSafeNextPath } from '../lib/authRedirect';
import { supabase } from '../lib/supabase';
import {
  VahaAlert,
  VahaButton,
  VahaPageShell,
  VahaPanel,
  vahaInputClass,
} from '../components/vaha/VahaUI';

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'create'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
          });

    setLoading(false);

    if (signInError) {
      setError(getFriendlyAuthError(signInError.message));
      return;
    }

    const redirect = Array.isArray(router.query.redirect) ? router.query.redirect[0] : router.query.redirect;
    router.push(getSafeNextPath(redirect, '/profile'));
  }

  const redirectPath = getSafeNextPath(router.query.redirect, '/profile');

  return (
    <VahaPageShell>
      <div className="vaha-container flex min-h-[70vh] items-center justify-center py-10">
        <VahaPanel
          className="w-full max-w-md"
          eyebrow="Customer account"
          title={mode === 'signin' ? 'Sign In' : 'Create Account'}
          description="Sign in to save your details and see past orders."
        >
          <SocialLoginButtons context="customer" redirectTo={redirectPath} onError={setError} className="mt-6" />

          <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-widest text-vaha-muted/60">
            <span className="h-px flex-1 bg-white/10" />
            <span>Email</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <div className="mt-4 flex gap-2">
            <VahaButton variant={mode === 'signin' ? 'solid' : 'outline'} onClick={() => setMode('signin')}>
              Sign In
            </VahaButton>
            <VahaButton variant={mode === 'create' ? 'solid' : 'outline'} onClick={() => setMode('create')}>
              Create
            </VahaButton>
          </div>

          <form className="mt-6 flex flex-col gap-3" onSubmit={handleSubmit}>
            {mode === 'create' ? (
              <input className={vahaInputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" aria-label="Full name" required />
            ) : null}
            <input className={vahaInputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" type="email" autoComplete="email" required />
            <input className={vahaInputClass} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" aria-label="Password" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required />

            {error ? <VahaAlert tone="error">{error}</VahaAlert> : null}

            <VahaButton type="submit" variant="solid" disabled={loading} className="w-full">
              {loading ? 'Working…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </VahaButton>
          </form>
        </VahaPanel>
      </div>
    </VahaPageShell>
  );
}
