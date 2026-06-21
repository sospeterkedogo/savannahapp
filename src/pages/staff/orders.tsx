import { useEffect, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { fetchStaffOrders, updateOrderStatus, updateOrderDelivery } from '../../lib/customerOrders';
import { useAuthGuard } from '../../lib/useAuthGuard';
import type { SavannahOrder } from '../../types/app';
import { StaffAccessDenied, StaffLoading, StaffPageHeader, StaffShell } from '../../components/staff/StaffLayout';
import { VahaAlert, VahaButton, VahaPanel, vahaInputClass } from '../../components/vaha/VahaUI';

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

const statuses = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];
const deliveryStatuses = ['pending', 'dispatched', 'delivered', 'failed'];

export default function StaffOrders() {
  const { loading: authLoading, profile, allowed } = useAuthGuard(['admin', 'employee']);
  const [orders, setOrders] = useState<SavannahOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadOrders() {
    setLoadingOrders(true);
    setError('');
    try {
      setOrders(await fetchStaffOrders());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load orders.');
    } finally {
      setLoadingOrders(false);
    }
  }

  useEffect(() => {
    if (allowed) loadOrders();
  }, [allowed]);

  async function handleStatus(orderId: string, status: string) {
    setMessage('');
    setError('');
    try {
      await updateOrderStatus(orderId, status);
      setMessage('Order status updated.');
      await loadOrders();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Could not update status.');
    }
  }

  async function handleDeliveryStatus(orderId: string, delivery_status: string) {
    setMessage('');
    setError('');
    try {
      await updateOrderDelivery(orderId, { delivery_status });
      setMessage('Delivery status updated.');
      await loadOrders();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Could not update delivery status.');
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (authLoading) return <StaffLoading />;

  if (!allowed) return <StaffAccessDenied />;

  return (
    <StaffShell>
      <div className="vaha-container flex flex-col gap-4 py-6">
        <StaffPageHeader
          title="Orders & Deliveries"
          description={`Signed in as ${profile?.email} (${profile?.role})`}
          actions={
            <>
              <Link href="/staff" className="text-xs uppercase tracking-widest text-vaha-gold hover:underline">Staff Home</Link>
              <Link href="/admin/menu" className="text-xs uppercase tracking-widest text-vaha-gold hover:underline">Menu</Link>
              <VahaButton variant="ghost" onClick={signOut}>Sign Out</VahaButton>
            </>
          }
        />

        {error ? <VahaAlert tone="error">{error}</VahaAlert> : null}
        {message ? <VahaAlert tone="success">{message}</VahaAlert> : null}

        <VahaPanel title="Live Orders">
          {loadingOrders ? (
            <p className="mt-4 text-vaha-muted">Loading orders…</p>
          ) : orders.length === 0 ? (
            <p className="mt-4 text-vaha-muted">No orders yet.</p>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {orders.map((order) => (
                <article key={order.id} className="flex flex-col border border-white/10 bg-vaha-ink p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-vaha-muted">{order.user_id ? 'Customer' : 'Guest'}</p>
                      <h2 className="font-serif text-xl text-vaha-gold">{order.invoice_number}</h2>
                      <p className="text-xs text-vaha-muted">Receipt: {order.receipt_number}</p>
                    </div>
                    <span className="border border-white/10 px-2 py-1 text-[10px] uppercase tracking-widest">{order.service}</span>
                  </div>

                  <div className="mt-3 space-y-1 text-sm">
                    <p><span className="text-vaha-muted">Name:</span> {String(order.customer?.full_name || 'Guest')}</p>
                    <p><span className="text-vaha-muted">Phone:</span> {String(order.customer?.phone || '—')}</p>
                    <p className="text-vaha-gold">£{Number(order.subtotal).toFixed(2)}</p>
                  </div>

                  {order.service === 'delivery' ? (
                    <div className="mt-3 border border-white/10 p-2 text-sm">
                      <p className="text-xs uppercase tracking-widest text-vaha-muted">Delivery</p>
                      <p>{order.delivery_address || String(order.customer?.address || 'No address')}</p>
                    </div>
                  ) : null}

                  <div className="mt-3 border-t border-white/10 pt-3">
                    {order.items.map((item) => (
                      <p key={item.id} className="text-xs text-vaha-muted">{item.quantity}x {item.itemName} — {item.price}</p>
                    ))}
                  </div>

                  <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-3">
                    <label className="text-xs uppercase tracking-widest text-vaha-muted">
                      Order status
                      <select className={`${vahaInputClass} mt-1`} value={order.status} onChange={(e) => handleStatus(order.id, e.target.value)}>
                        {statuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </label>
                    {order.service === 'delivery' ? (
                      <label className="text-xs uppercase tracking-widest text-vaha-muted">
                        Delivery status
                        <select className={`${vahaInputClass} mt-1`} value={order.delivery_status || 'pending'} onChange={(e) => handleDeliveryStatus(order.id, e.target.value)}>
                          {deliveryStatuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </VahaPanel>
      </div>
    </StaffShell>
  );
}
