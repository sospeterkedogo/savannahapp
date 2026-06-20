import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { AuthProfile, OnboardingRole } from '../types/app';

function roleForProfile(profile: AuthProfile | null): OnboardingRole {
  if (!profile) return 'guest';
  if (profile.role === 'admin') return 'admin';
  if (profile.role === 'employee') return 'employee';
  return 'customer';
}

export function useCurrentProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AuthProfile | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!active) return;

      if (!session) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!active) return;

      setProfile((data as AuthProfile | null) || {
        id: session.user.id,
        email: session.user.email || '',
        role: 'customer',
      });
      setLoading(false);
    }

    loadProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    loading,
    profile,
    role: roleForProfile(profile),
  };
}
