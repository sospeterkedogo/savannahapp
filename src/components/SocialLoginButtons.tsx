import { useState } from 'react';
import { FaFacebookF, FaGithub, FaGoogle } from 'react-icons/fa6';
import { supabase } from '../lib/supabase';
import { buildOAuthCallbackUrl, getFriendlyAuthError } from '../lib/authRedirect';
import type { AuthContext, SocialProvider } from '../types/app';

type SocialLoginButtonsProps = {
  context: AuthContext;
  redirectTo?: string;
  onError: (message: string) => void;
  className?: string;
};

const providers: Array<{
  id: SocialProvider;
  label: string;
  Icon: typeof FaGoogle;
}> = [
  { id: 'google', label: 'Google', Icon: FaGoogle },
  { id: 'github', label: 'GitHub', Icon: FaGithub },
  { id: 'facebook', label: 'Facebook', Icon: FaFacebookF },
];

export default function SocialLoginButtons({ context, redirectTo, onError, className = '' }: SocialLoginButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);

  async function handleSocialLogin(provider: SocialProvider) {
    setLoadingProvider(provider);
    onError('');

    const redirectUrl = buildOAuthCallbackUrl(context, redirectTo);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      setLoadingProvider(null);
      onError(getFriendlyAuthError(error.message));
    }
  }

  return (
    <div className={`grid gap-3 ${className}`}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {providers.map(({ id, label, Icon }) => {
          const loading = loadingProvider === id;

          return (
            <button
              key={id}
              type="button"
              aria-label={`Continue with ${label}`}
              disabled={Boolean(loadingProvider)}
              onClick={() => handleSocialLogin(id)}
              className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:border-luxury-accent hover:bg-luxury-accent hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span>{loading ? 'Opening...' : label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
