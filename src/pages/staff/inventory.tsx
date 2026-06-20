import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useAuthGuard } from '../../lib/useAuthGuard';
import type { InventoryItem, InventoryLog } from '../../types/staff';
import { FaPlus, FaMinus, FaReceipt, FaBoxOpen, FaTriangleExclamation, FaArrowLeft } from 'react-icons/fa6';

export default function InventoryPage() {
  const { loading: authLoading, profile, allowed } = useAuthGuard(['admin', 'employee']);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  async function loadData() {
    setLoading(true);
    const [invRes, logsRes] = await Promise.all([
      supabase.from('savannah_inventory').select('*').order('name'),
      supabase.from('savannah_inventory_logs').select('*').order('created_at', { ascending: false }).limit(10),
    ]);
    setInventory(invRes.data || []);
    setLogs(logsRes.data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (allowed) loadData();
  }, [allowed]);

  async function handleCheckIn(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem || amount <= 0) return;

    const { error } = await supabase.from('savannah_inventory_logs').insert({
      inventory_id: selectedItem,
      user_id: profile?.id,
      change_amount: amount,
      reason: 'check-in',
      notes: notes,
    });

    if (!error) {
      setAmount(0);
      setNotes('');
      setShowCheckIn(false);
      loadData();
    }
  }

  if (authLoading || loading) return <main className="min-h-screen bg-black px-4 py-16 text-center text-white/70">Loading Inventory...</main>;

  if (!allowed) return <div className="p-20 text-center text-white">Access Denied</div>;

  return (
    <main className="min-h-screen bg-black pb-16 pt-8">
      <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-8 px-4 md:px-8">
        
        {/* Header Section */}
        <section className="glass-morphism rounded-2xl border border-white/10 p-6 shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link href="/staff" className="flex items-center gap-2 text-luxury-accent/60 hover:text-luxury-accent transition-colors mb-2">
                <FaArrowLeft size={12} />
                <span className="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
              </Link>
              <h1 className="text-4xl font-serif font-bold text-luxury-accent">Inventory Management</h1>
              <p className="mt-1 text-sm text-white/50">Track stock levels and process check-ins</p>
            </div>
            <button 
              onClick={() => setShowCheckIn(true)}
              className="flex items-center justify-center gap-2 rounded-full bg-luxury-accent px-6 py-3 font-bold text-black hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              <FaPlus /> Check-in Stock
            </button>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Inventory List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-morphism rounded-2xl border border-white/10 p-6 overflow-hidden">
              <h2 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-3">
                <FaBoxOpen className="text-luxury-accent" /> Stock Levels
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-xs uppercase tracking-widest text-white/40">
                      <th className="pb-4 font-semibold">Item</th>
                      <th className="pb-4 font-semibold">Category</th>
                      <th className="pb-4 font-semibold text-center">Status</th>
                      <th className="pb-4 font-semibold text-right">Current Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {inventory.map(item => {
                      const isLow = item.current_stock <= item.min_stock;
                      const percentage = Math.min((item.current_stock / item.capacity) * 100, 100);
                      
                      return (
                        <tr key={item.id} className="group">
                          <td className="py-4">
                            <span className="font-bold text-white/90 group-hover:text-luxury-accent transition-colors">{item.name}</span>
                          </td>
                          <td className="py-4 text-sm text-white/40">{item.category}</td>
                          <td className="py-4">
                            <div className="flex justify-center">
                              {isLow ? (
                                <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase text-red-500 border border-red-500/20">
                                  <FaTriangleExclamation /> Low Stock
                                </span>
                              ) : (
                                <span className="rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-bold uppercase text-green-500 border border-green-500/20">
                                  Healthy
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="text-sm font-bold text-white">{item.current_stock} {item.unit}</span>
                              <div className="h-1 w-24 rounded-full bg-white/5 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${isLow ? 'bg-red-500' : 'bg-luxury-accent'}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Activity Sidebar */}
          <aside className="space-y-6">
            <div className="glass-morphism rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-3">
                <FaReceipt className="text-luxury-accent" /> Recent Activity
              </h2>
              <div className="space-y-4">
                {logs.map(log => {
                  const item = inventory.find(i => i.id === log.inventory_id);
                  return (
                    <div key={log.id} className="flex items-start gap-4 border-l-2 border-white/5 pl-4 py-1">
                      <div className={`mt-1 h-2 w-2 rounded-full ${log.change_amount > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white/90">{item?.name || 'Unknown Item'}</span>
                          <span className={`text-xs font-bold ${log.change_amount > 0 ? 'text-green-500' : 'text-red-400'}`}>
                            {log.change_amount > 0 ? '+' : ''}{log.change_amount}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/30 uppercase tracking-tighter mt-0.5">
                          {log.reason} • {new Date(log.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="glass-morphism rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-luxury-accent/5 to-transparent">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-luxury-accent/60 mb-4">Stock Insights</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-white/40 uppercase font-bold">Low Items</p>
                  <p className="text-2xl font-serif font-bold text-red-500">{inventory.filter(i => i.current_stock <= i.min_stock).length}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase font-bold">Categories</p>
                  <p className="text-2xl font-serif font-bold text-white">{new Set(inventory.map(i => i.category)).size}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-morphism w-full max-w-lg rounded-3xl border border-white/20 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold text-luxury-accent">Stock Check-in</h2>
              <button onClick={() => setShowCheckIn(false)} className="text-white/40 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleCheckIn} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-white/50 px-1">Select Item</label>
                <select 
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white focus:border-luxury-accent focus:outline-none"
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  required
                >
                  <option value="" className="bg-zinc-900">Choose an item...</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.id} className="bg-zinc-900">{item.name} ({item.unit})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/50 px-1">Amount</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white focus:border-luxury-accent focus:outline-none"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/50 px-1">Receipt Scan</label>
                  <div className="relative flex h-[58px] w-full items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                    <FaReceipt className="text-white/20" />
                    <span className="ml-2 text-[10px] font-bold text-white/40 uppercase">Click to scan</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-white/50 px-1">Notes</label>
                <textarea 
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white focus:border-luxury-accent focus:outline-none min-h-[100px]"
                  placeholder="Batch number, supplier details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-luxury-accent to-yellow-400 py-4 font-bold text-black hover:opacity-90 transition-opacity mt-4"
              >
                Confirm Check-in
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .glass-morphism {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
      `}</style>
    </main>
  );
}
