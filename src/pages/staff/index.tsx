import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { supabase } from '../../lib/supabase';
import { useAuthGuard } from '../../lib/useAuthGuard';
import { OnboardingTracker } from '../../components/staff/OnboardingTracker';
import { StaffStorage } from '../../components/staff/StaffStorage';
import { AdminDashboardMetrics } from '../../components/admin/AdminDashboardMetrics';
import { NotificationCenter } from '../../components/staff/NotificationCenter';
import { GlassCard, GlassButton } from '../../components/shared/GlassComponents';

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

export default function StaffHome() {
  const { loading, profile, allowed } = useAuthGuard(['admin', 'employee']);

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return <main className="min-h-screen bg-black px-4 py-16 text-center text-white/70">Checking staff access...</main>;
  }

  if (!allowed) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-black pb-16 pt-8">
        <GlassCard className="w-full max-w-xl p-8 text-center">
          <h1 className="text-4xl font-serif font-bold text-luxury-accent">Staff Access Required</h1>
          <p className="mt-4 text-white/70">Sign in with an admin or employee account.</p>
          <Link href="/staff/login" className="mt-6 inline-block">
            <GlassButton>Staff Sign In</GlassButton>
          </Link>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black pb-16 pt-8">
      <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-8 px-4 md:px-8">
        <GlassCard className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-luxury-accent/60">savannahbarandgrill.com</p>
              <h1 className="text-4xl font-serif font-bold text-luxury-accent">Dashboard</h1>
              <p className="mt-1 text-sm text-white/50">Signed in as {profile?.email} ({profile?.role})</p>
            </div>
            <GlassButton variant="secondary" onClick={signOut} className="text-xs">
              Sign Out
            </GlassButton>
          </div>
        </GlassCard>

        {profile?.role === 'admin' && (
          <section className="space-y-4">
            <h2 className="px-2 text-sm font-bold uppercase tracking-widest text-white/40">System Metrics</h2>
            <AdminDashboardMetrics />
          </section>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/staff/orders" className="block">
                <GlassCard hover className="p-5 h-full">
                  <span className="text-lg font-bold text-luxury-accent group-hover:translate-x-1 transition-transform inline-block">Orders →</span>
                  <p className="mt-1 text-xs text-white/40 line-clamp-2">Manage customer receipts & invoices</p>
                </GlassCard>
              </Link>
              <Link href="/staff/menu" className="block">
                <GlassCard hover className="p-5 h-full">
                  <span className="text-lg font-bold text-luxury-accent group-hover:translate-x-1 transition-transform inline-block">Menu →</span>
                  <p className="mt-1 text-xs text-white/40 line-clamp-2">Update items and availability</p>
                </GlassCard>
              </Link>
              <Link href="/staff/inventory" className="block">
                <GlassCard hover className="p-5 h-full">
                  <span className="text-lg font-bold text-luxury-accent group-hover:translate-x-1 transition-transform inline-block">Inventory →</span>
                  <p className="mt-1 text-xs text-white/40 line-clamp-2">Track stock and check-ins</p>
                </GlassCard>
              </Link>
              <Link href="/staff/shifts" className="block">
                <GlassCard hover className="p-5 h-full">
                  <span className="text-lg font-bold text-luxury-accent group-hover:translate-x-1 transition-transform inline-block">Shifts →</span>
                  <p className="mt-1 text-xs text-white/40 line-clamp-2">View and request schedules</p>
                </GlassCard>
              </Link>
            </section>

            <section className="space-y-4">
              <h2 className="px-2 text-sm font-bold uppercase tracking-widest text-white/40">Personal Storage</h2>
              <GlassCard className="p-0">
                <StaffStorage />
              </GlassCard>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="space-y-4">
              <h2 className="px-2 text-sm font-bold uppercase tracking-widest text-white/40">Notifications</h2>
              <GlassCard className="p-6">
                <NotificationCenter />
              </GlassCard>
            </section>

            <section className="space-y-4">
              <h2 className="px-2 text-sm font-bold uppercase tracking-widest text-white/40">Your Progress</h2>
              <GlassCard className="p-6">
                <OnboardingTracker />
              </GlassCard>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
