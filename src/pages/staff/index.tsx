import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { supabase } from '../../lib/supabase';
import { useAuthGuard } from '../../lib/useAuthGuard';
import { OnboardingTracker } from '../../components/staff/OnboardingTracker';
import { StaffStorage } from '../../components/staff/StaffStorage';
import { AdminDashboardMetrics } from '../../components/admin/AdminDashboardMetrics';
import { NotificationCenter } from '../../components/staff/NotificationCenter';
import { GlassCard, GlassButton } from '../../components/shared/GlassComponents';
import { StaffAccessDenied, StaffLoading, StaffPageHeader, StaffSectionTitle, StaffShell } from '../../components/staff/StaffLayout';

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

const quickLinks = [
  { href: '/staff/orders', label: 'Orders', desc: 'Receipts, invoices & deliveries' },
  { href: '/admin/menu', label: 'Menu', desc: 'Items, categories & images' },
  { href: '/staff/inventory', label: 'Inventory', desc: 'Stock levels & check-ins' },
  { href: '/staff/shifts', label: 'Shifts', desc: 'Schedules & rotas' },
  { href: '/admin/events', label: 'Events', desc: 'Promote upcoming nights' },
];

export default function StaffHome() {
  const { loading, profile, allowed } = useAuthGuard(['admin', 'employee']);

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (loading) return <StaffLoading />;

  if (!allowed) return <StaffAccessDenied />;

  return (
    <StaffShell>
      <div className="vaha-container flex flex-col gap-4 py-6">
        <StaffPageHeader
          eyebrow="staff.savannahbarandgrill.com"
          title="Dashboard"
          description={`Signed in as ${profile?.email} (${profile?.role})`}
          actions={<GlassButton variant="secondary" onClick={signOut}>Sign Out</GlassButton>}
        />

        {profile?.role === 'admin' ? (
          <section className="space-y-3">
            <StaffSectionTitle>System Metrics</StaffSectionTitle>
            <AdminDashboardMetrics />
          </section>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block h-full">
                  <GlassCard hover className="h-full">
                    <span className="font-serif text-xl text-vaha-cream">{link.label}</span>
                    <p className="mt-1 text-xs text-vaha-muted">{link.desc}</p>
                  </GlassCard>
                </Link>
              ))}
            </section>

            <section className="space-y-3">
              <StaffSectionTitle>Personal Storage</StaffSectionTitle>
              <GlassCard className="p-0">
                <StaffStorage />
              </GlassCard>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="space-y-3">
              <StaffSectionTitle>Notifications</StaffSectionTitle>
              <GlassCard>
                <NotificationCenter />
              </GlassCard>
            </section>

            <section className="space-y-3">
              <StaffSectionTitle>Your Progress</StaffSectionTitle>
              <GlassCard>
                <OnboardingTracker />
              </GlassCard>
            </section>
          </aside>
        </div>
      </div>
    </StaffShell>
  );
}
