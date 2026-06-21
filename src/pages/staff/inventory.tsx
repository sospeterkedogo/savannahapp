import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useAuthGuard } from '../../lib/useAuthGuard';
import type { InventoryItem, InventoryLog } from '../../types/staff';
import { FaPlus, FaReceipt, FaBoxOpen, FaTriangleExclamation, FaArrowLeft } from 'react-icons/fa6';
import { StaffAccessDenied, StaffLoading, StaffPageHeader, StaffShell } from '../../components/staff/StaffLayout';
import { VahaButton, VahaPanel, vahaInputClass, vahaTextareaClass } from '../../components/vaha/VahaUI';

export default function InventoryPage() {
  const { loading: authLoading, profile, allowed } = useAuthGuard(['admin', 'employee']);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

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
      notes,
    });

    if (!error) {
      setAmount(0);
      setNotes('');
      setShowCheckIn(false);
      loadData();
    }
  }

  if (authLoading || loading) return <StaffLoading label="Loading inventory…" />;

  if (!allowed) return <StaffAccessDenied showLogin={false} message="Admin or employee access required." />;

  return (
    <StaffShell>
      <div className="vaha-container flex flex-col gap-4 py-6">
        <StaffPageHeader
          title="Inventory Management"
          description="Track stock levels and process check-ins"
          actions={
            <>
              <Link href="/staff" className="flex items-center gap-2 text-xs uppercase tracking-widest text-vaha-gold hover:underline">
                <FaArrowLeft size={10} /> Dashboard
              </Link>
              <VahaButton variant="solid" onClick={() => setShowCheckIn(true)}>
                <FaPlus /> Check-in Stock
              </VahaButton>
            </>
          }
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <VahaPanel title="Stock Levels" className="lg:col-span-2">
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-vaha-muted">
                    <th className="pb-3">Item</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {inventory.map((item) => {
                    const isLow = item.current_stock <= item.min_stock;
                    const percentage = Math.min((item.current_stock / item.capacity) * 100, 100);
                    return (
                      <tr key={item.id}>
                        <td className="py-3 font-semibold text-vaha-cream">{item.name}</td>
                        <td className="py-3 text-vaha-muted">{item.category}</td>
                        <td className="py-3 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase text-red-400">
                              <FaTriangleExclamation /> Low
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase text-green-400">OK</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <span>{item.current_stock} {item.unit}</span>
                          <div className="ml-auto mt-1 h-1 w-20 overflow-hidden bg-white/10">
                            <div className={`h-full ${isLow ? 'bg-red-500' : 'bg-vaha-gold'}`} style={{ width: `${percentage}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </VahaPanel>

          <aside className="space-y-4">
            <VahaPanel title="Recent Activity">
              <div className="mt-4 space-y-3">
                {logs.map((log) => {
                  const item = inventory.find((i) => i.id === log.inventory_id);
                  return (
                    <div key={log.id} className="border-l-2 border-vaha-gold/30 pl-3 text-sm">
                      <div className="flex justify-between">
                        <span>{item?.name || 'Unknown'}</span>
                        <span className={log.change_amount > 0 ? 'text-green-400' : 'text-red-400'}>
                          {log.change_amount > 0 ? '+' : ''}{log.change_amount}
                        </span>
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-vaha-muted">{log.reason}</p>
                    </div>
                  );
                })}
              </div>
            </VahaPanel>

            <VahaPanel title="Insights">
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-vaha-muted">Low items</p>
                  <p className="font-serif text-2xl text-red-400">{inventory.filter((i) => i.current_stock <= i.min_stock).length}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-vaha-muted">Categories</p>
                  <p className="font-serif text-2xl">{new Set(inventory.map((i) => i.category)).size}</p>
                </div>
              </div>
            </VahaPanel>
          </aside>
        </div>
      </div>

      {showCheckIn ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-vaha-ink/90 p-4">
          <VahaPanel title="Stock Check-in" className="relative w-full max-w-lg">
            <div className="mb-3 flex justify-end">
              <VahaButton type="button" variant="ghost" onClick={() => setShowCheckIn(false)} aria-label="Close">Close</VahaButton>
            </div>
            <form onSubmit={handleCheckIn} className="mt-4 grid gap-3">
              <select className={vahaInputClass} value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} required aria-label="Item">
                <option value="">Choose an item…</option>
                {inventory.map((item) => (
                  <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                ))}
              </select>
              <input type="number" step="0.01" className={vahaInputClass} value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Amount" required aria-label="Amount" />
              <textarea className={vahaTextareaClass} placeholder="Batch, supplier…" value={notes} onChange={(e) => setNotes(e.target.value)} aria-label="Notes" />
              <div className="flex items-center gap-2 text-xs text-vaha-muted">
                <FaReceipt /> Receipt scan — coming soon
              </div>
              <VahaButton type="submit" variant="solid">Confirm Check-in</VahaButton>
            </form>
          </VahaPanel>
        </div>
      ) : null}
    </StaffShell>
  );
}
