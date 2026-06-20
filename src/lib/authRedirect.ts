import type { AuthContext } from '../types/app';

const fallbackByContext: Record<AuthContext, string> = {
  customer: '/profile',
  checkout: '/checkout',
  staff: '/staff',
};

export function getSafeNextPath(nextPath: string | string[] | undefined, fallback = '/profile') {
  const value = Array.isArray(nextPath) ? nextPath[0] : nextPath;

  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return fallback;
  }

  return value;
}

export function getAuthContext(value: string | string[] | undefined): AuthContext {
  const context = Array.isArray(value) ? value[0] : value;

  if (context === 'checkout' || context === 'staff') {
    return context;
  }

  return 'customer';
}

export function getFallbackPath(context: AuthContext) {
  return fallbackByContext[context];
}

export function buildOAuthCallbackUrl(context: AuthContext, nextPath?: string) {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const fallback = getFallbackPath(context);
  const params = new URLSearchParams({
    context,
    next: getSafeNextPath(nextPath, fallback),
  });

  return `${window.location.origin}/auth/callback?${params.toString()}`;
}

export function getFriendlyAuthError(message: string) {
  if (/multiple accounts with the same email address/i.test(message) && /linking domain/i.test(message)) {
    return 'This email is already attached to more than one sign-in method. Please sign in with your original email and password, or ask Savannah staff to merge the duplicate account before using social sign-in.';
  }

  return message;
}
