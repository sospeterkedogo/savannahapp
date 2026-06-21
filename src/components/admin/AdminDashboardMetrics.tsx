import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { StaffMetrics } from '../../types/staff';
import { FaUsers, FaRotate, FaUtensils, FaClock } from 'react-icons/fa6';

const metricCard = 'border border-white/10 bg-vaha-ink p-4';

export function AdminDashboardMetrics() {
  const [metrics, setMetrics] = useState<StaffMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadMetrics() {
    setLoading(true);

    const [staffRes, onboardingRes, logsRes, shiftsRes, menuRes, inventoryRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }).in('role', ['admin', 'employee']),
      supabase.rpc('get_onboarding_completion_rate'),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('audit_logs').select('id', { count: 'exact' }).eq('action', 'update_shift'),
      supabase.from('audit_logs').select('id', { count: 'exact' }).eq('action', 'update_menu'),
      supabase.from('savannah_inventory').select('id, current_stock, min_stock'),
    ]);

    const { data: allOnboarding } = await supabase.from('user_onboarding').select('user_id');
    const uniqueUsersCompleted = new Set(allOnboarding?.map((o) => o.user_id)).size;
    const staffCount = staffRes.count || 1;
    const lowStockCount = inventoryRes.data?.filter((i) => i.current_stock <= i.min_stock).length || 0;

    setMetrics({
      totalStaff: staffRes.count || 0,
      onboardingCompletionRate: (uniqueUsersCompleted / staffCount) * 100,
      recentLogs: logsRes.data || [],
      shiftUpdatesCount: shiftsRes.count || 0,
      menuUpdatesCount: menuRes.count || 0,
      lowStockItems: lowStockCount,
    });
    setLoading(false);
  }

  useEffect(() => {
    loadMetrics();
  }, []);

  if (loading) return <p className="text-vaha-muted">Loading metrics…</p>;
  if (!metrics) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className={metricCard}>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-vaha-gold/10 p-2 text-vaha-gold"><FaUsers size={20} /></div>
            <div>
              <p className="text-xs uppercase tracking-widest text-vaha-muted">Staff</p>
              <h3 className="font-serif text-2xl">{metrics.totalStaff}</h3>
            </div>
          </div>
        </div>
        <div className={metricCard}>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-500/10 p-2 text-green-500"><FaRotate size={20} /></div>
            <div>
              <p className="text-xs uppercase tracking-widest text-vaha-muted">Onboarding</p>
              <h3 className="font-serif text-2xl">{metrics.onboardingCompletionRate.toFixed(1)}%</h3>
            </div>
          </div>
        </div>
        <div className={metricCard}>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-500/10 p-2 text-blue-400"><FaClock size={20} /></div>
            <div>
              <p className="text-xs uppercase tracking-widest text-vaha-muted">Shifts</p>
              <h3 className="font-serif text-2xl">{metrics.shiftUpdatesCount}</h3>
            </div>
          </div>
        </div>
        <div className={metricCard}>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-500/10 p-2 text-orange-400"><FaUtensils size={20} /></div>
            <div>
              <p className="text-xs uppercase tracking-widest text-vaha-muted">Menu</p>
              <h3 className="font-serif text-2xl">{metrics.menuUpdatesCount}</h3>
            </div>
          </div>
        </div>
        <div className={`${metricCard} ${(metrics.lowStockItems ?? 0) > 0 ? 'border-red-500/40' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${(metrics.lowStockItems ?? 0) > 0 ? 'bg-red-500/10 text-red-400' : 'bg-vaha-gold/10 text-vaha-gold'}`}>
              <FaUtensils size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-vaha-muted">Low Stock</p>
              <h3 className={`font-serif text-2xl ${(metrics.lowStockItems ?? 0) > 0 ? 'text-red-400' : ''}`}>{metrics.lowStockItems ?? 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className={`${metricCard} p-4`}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg text-vaha-gold">Recent Actions</h2>
          <button type="button" onClick={loadMetrics} className="text-vaha-muted hover:text-vaha-gold" aria-label="Refresh">
            <FaRotate />
          </button>
        </div>
        <div className="space-y-2">
          {metrics.recentLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
              <div>
                <span className="font-semibold">{log.action.replace('_', ' ')}</span>
                <span className="mx-2 text-vaha-muted">on</span>
                <span className="text-vaha-gold">{log.target_type}</span>
              </div>
              <span className="text-vaha-muted">{new Date(log.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
