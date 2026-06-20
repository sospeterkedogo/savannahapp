import { supabase } from './supabase';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import type { AuthProfile } from '../types/app';

export function useAuthGuard(requiredRoles: AuthProfile['role'][] = []) {
  const router = useRouter();
  const rolesKey = useMemo(() => requiredRoles.join('|'), [requiredRoles]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!active) return;

      if (!session) {
        const loginPath = router.asPath.startsWith('/staff') ? '/staff/login' : '/login';
        router.replace(`${loginPath}?redirect=${encodeURIComponent(router.asPath)}`);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', session.user.id)
        .single();

      if (!active) return;

      const userProfile = data as AuthProfile | null;
      setProfile(userProfile);
      const roles = rolesKey ? rolesKey.split('|') : [];
      setAllowed(Boolean(userProfile && (!roles.length || roles.includes(userProfile.role))));
      setLoading(false);
    }

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace(router.asPath.startsWith('/staff') ? '/staff/login' : '/login');
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [rolesKey, router]);

  return { loading, profile, allowed };
}
