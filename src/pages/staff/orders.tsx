import { useEffect, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { fetchStaffOrders, updateOrderStatus, updateOrderDelivery } from '../../lib/customerOrders';
import { useAuthGuard } from '../../lib/useAuthGuard';
import type { SavannahOrder } from '../../types/app';

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

  if (authLoading) {
    return <main className="min-h-screen bg-black px-4 py-16 text-center text-white/70">Checking staff access...</main>;
  }

  if (!allowed) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-black pb-16 pt-8">
        <section className="w-full max-w-xl rounded-2xl border border-luxury-accent/30 bg-black/70 p-8 text-center shadow-2xl">
          <h1 className="text-4xl font-serif font-bold text-luxury-accent">Staff Access Required</h1>
          <p className="mt-4 text-white/70">Sign in with an admin or employee account.</p>
          <Link href="/staff/login" className="luxury-cta mt-6 inline-flex rounded-full bg-gradient-to-r from-luxury-accent to-yellow-400 px-8 py-3 font-bold text-black">Staff Sign In</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black pb-16 pt-8">
      <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 px-4 md:px-8">
        <section className="rounded-2xl border border-luxury-accent/30 bg-black/70 p-6 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-luxury-accent/80">Savannah staff</p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-luxury-accent">Orders & Deliveries</h1>
              <p className="mt-3 text-white/70">Signed in as {profile?.email} ({profile?.role}).</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/staff" className="rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white hover:border-luxury-accent hover:text-luxury-accent">Staff Home</Link>
              <Link href="/staff/menu" className="rounded-full border border-luxury-accent/50 px-5 py-3 text-sm font-bold text-luxury-accent hover:bg-luxury-accent hover:text-black">Menu</Link>
              <button onClick={signOut} className="rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white hover:border-luxury-accent hover:text-luxury-accent">Sign Out</button>
            </div>
          </div>
        </section>

        {(message || error) && (
          <p className={`rounded-xl border px-4 py-3 text-sm ${error ? 'border-red-400/50 bg-red-950/50 text-red-100' : 'border-green-400/50 bg-green-950/40 text-green-100'}`}>
            {error || message}
          </p>
        )}

        <section className="rounded-2xl border border-luxury-accent/25 bg-black/60 p-5 shadow-xl">
          {loadingOrders ? (
            <p className="py-12 text-center text-white/60">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="py-12 text-center text-white/60">No orders yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {orders.map((order) => (
                <article key={order.id} className="rounded-xl border border-white/10 bg-black/40 p-5 shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-white/45">{order.user_id ? 'Customer account' : 'Guest order'}</p>
                        <h2 className="mt-1 text-xl font-serif font-semibold text-luxury-accent">{order.invoice_number}</h2>
                        <p className="mt-1 text-xs text-white/70">Receipt: {order.receipt_number}</p>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                        {order.service}
                      </span>
                    </div>

                    <div className="grid gap-2 mb-4 text-sm">
                      <p className="text-white"><span className="text-white/50">Name:</span> {String(order.customer?.full_name || 'Guest')}</p>
                      <p className="text-white"><span className="text-white/50">Phone:</span> {String(order.customer?.phone || 'None')}</p>
                      <p className="text-white font-bold text-luxury-accent/90"><span className="text-white/50 font-normal">Total:</span> ${Number(order.subtotal).toFixed(2)}</p>
                    </div>

                    {order.service === 'delivery' && (
                      <div className="mb-4 rounded-lg bg-white/5 p-3 text-sm">
                        <p className="text-white/50 mb-1 text-xs uppercase tracking-widest">Delivery Address</p>
                        <p className="text-white/90">{order.delivery_address || String(order.customer?.address || 'No address provided')}</p>
                        {typeof order.location?.mapsLink === 'string' && (
                          <a className="mt-2 inline-flex text-xs font-semibold text-luxury-accent hover:underline" href={order.location.mapsLink} target="_blank" rel="noopener noreferrer">
                            Open in Google Maps
                          </a>
                        )}
                      </div>
                    )}

                    <div className="border-t border-white/10 pt-4 mb-4">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-xs text-white/70 mb-1">{item.quantity}x {item.itemName} - {item.price}</p>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-white/10 pt-4 mt-auto">
                    <label className="flex flex-col gap-1 text-xs font-semibold text-white/75">
                      Order Status
                      <select className="min-h-10 rounded-lg border border-luxury-accent/40 bg-black/60 px-3 py-2 text-white" value={order.status} onChange={(event) => handleStatus(order.id, event.target.value)}>
                        {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </label>

                    {order.service === 'delivery' && (
                      <label className="flex flex-col gap-1 text-xs font-semibold text-white/75">
                        Delivery Status
                        <select className="min-h-10 rounded-lg border border-blue-400/40 bg-black/60 px-3 py-2 text-blue-100" value={order.delivery_status || 'pending'} onChange={(event) => handleDeliveryStatus(order.id, event.target.value)}>
                          {deliveryStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </label>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
