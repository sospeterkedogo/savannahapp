import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { StaffMetrics } from '../../types/staff';
import { FaUsers, FaRotate, FaUtensils, FaClock } from 'react-icons/fa6';

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

    // Manual calculation for onboarding if RPC fails
    const { data: allOnboarding } = await supabase.from('user_onboarding').select('user_id');
    const uniqueUsersCompleted = new Set(allOnboarding?.map(o => o.user_id)).size;
    const staffCount = staffRes.count || 1;

    const lowStockCount = inventoryRes.data?.filter(i => i.current_stock <= i.min_stock).length || 0;

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

  if (loading) return <div className="text-white/70">Loading metrics...</div>;
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-luxury-accent/20 bg-black/60 p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-luxury-accent/10 p-3 text-luxury-accent">
              <FaUsers size={24} />
            </div>
            <div>
              <p className="text-sm text-white/50">Total Staff</p>
              <h3 className="text-2xl font-bold text-white">{metrics.totalStaff}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-luxury-accent/20 bg-black/60 p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-500/10 p-3 text-green-500">
              <FaRotate size={24} />
            </div>
            <div>
              <p className="text-sm text-white/50">Onboarding</p>
              <h3 className="text-2xl font-bold text-white">{metrics.onboardingCompletionRate.toFixed(1)}%</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-luxury-accent/20 bg-black/60 p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-500/10 p-3 text-blue-500">
              <FaClock size={24} />
            </div>
            <div>
              <p className="text-sm text-white/50">Shift Updates</p>
              <h3 className="text-2xl font-bold text-white">{metrics.shiftUpdatesCount}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-luxury-accent/20 bg-black/60 p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-orange-500/10 p-3 text-orange-500">
              <FaUtensils size={24} />
            </div>
            <div>
              <p className="text-sm text-white/50">Menu Updates</p>
              <h3 className="text-2xl font-bold text-white">{metrics.menuUpdatesCount}</h3>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl border p-6 shadow-xl bg-black/60 ${(metrics.lowStockItems ?? 0) > 0 ? 'border-red-500/50' : 'border-luxury-accent/20'}`}>
          <div className="flex items-center gap-4">
            <div className={`rounded-full p-3 ${(metrics.lowStockItems ?? 0) > 0 ? 'bg-red-500/10 text-red-500' : 'bg-luxury-accent/10 text-luxury-accent'}`}>
              <FaUtensils size={24} />
            </div>
            <div>
              <p className="text-sm text-white/50">Low Stock</p>
              <h3 className={`text-2xl font-bold ${(metrics.lowStockItems ?? 0) > 0 ? 'text-red-500' : 'text-white'}`}>{metrics.lowStockItems ?? 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-luxury-accent/25 bg-black/60 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-luxury-accent">Recent Actions</h2>
          <button onClick={loadMetrics} className="text-white/30 hover:text-luxury-accent">
            <FaRotate />
          </button>
        </div>
        <div className="space-y-3">
          {metrics.recentLogs.map(log => (
            <div key={log.id} className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
              <div>
                <span className="font-bold text-white/90">{log.action.replace('_', ' ')}</span>
                <span className="mx-2 text-white/30">on</span>
                <span className="text-luxury-accent/80">{log.target_type}</span>
              </div>
              <span className="text-white/30">{new Date(log.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
