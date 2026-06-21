import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  fetchCustomerOrders,
  fetchCustomerProfile,
  makeMapsLink,
  upsertCustomerProfile,
} from '../lib/customerOrders';
import { useCurrentProfile } from '../lib/useCurrentProfile';
import type { CustomerProfile, SavannahOrder } from '../types/app';
import {
  VahaAlert,
  VahaButton,
  VahaLoading,
  VahaPageShell,
  VahaPanel,
  vahaInputClass,
  vahaTextareaClass,
  VahaCta,
} from '../components/vaha/VahaUI';
import { FaCalendarDays, FaClock, FaUtensils } from 'react-icons/fa6';

export default function Profile() {
  const { profile: authProfile, loading: authLoading, role } = useCurrentProfile();
  const [userId, setUserId] = useState('');
  const [profile, setProfile] = useState<CustomerProfile>({
    id: '',
    email: '',
    full_name: '',
    phone: '',
    address: '',
  });
  const [orders, setOrders] = useState<SavannahOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!authProfile) {
      setUserId('');
      setLoading(false);
      return;
    }

    async function loadData() {
      const id = authProfile!.id;
      setUserId(id);

      try {
        const savedProfile = await fetchCustomerProfile(id);
        setProfile(
          savedProfile || {
            id,
            email: authProfile!.email || '',
            full_name: '',
            phone: '',
            address: '',
          }
        );

        const customerOrders = await fetchCustomerOrders(id);
        setOrders(customerOrders);
      } catch (dbError) {
        setError(dbError instanceof Error ? dbError.message : 'Could not load account data.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [authProfile, authLoading]);

  function updateProfile(next: Partial<CustomerProfile>) {
    setProfile((current) => ({ ...current, ...next }));
  }

  function requestLocation() {
    setError('');
    setMessage('');

    if (!('geolocation' in navigator)) {
      setMessage('Location is not available in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateProfile({
          latitude,
          longitude,
          maps_link: makeMapsLink(latitude, longitude),
        });
        setMessage('Location added. Save profile to keep it.');
      },
      () => setMessage('Location permission was not granted.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await upsertCustomerProfile(profile);
      setMessage('Profile saved.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save profile.');
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUserId('');
    setOrders([]);
  }

  if (authLoading || loading) {
    return (
      <VahaPageShell>
        <VahaLoading label="Loading your account…" />
      </VahaPageShell>
    );
  }

  if (!userId) {
    return (
      <VahaPageShell>
        <div className="vaha-container flex min-h-[60vh] flex-col items-center justify-center py-10">
          <VahaPanel eyebrow="Customer" title="Your Account" description="Sign in to manage your details, orders, and receipts." className="max-w-lg text-center">
            <VahaCta href="/login?redirect=/profile" variant="solid" className="mt-6">
              Sign In
            </VahaCta>
          </VahaPanel>
        </div>
      </VahaPageShell>
    );
  }

  return (
    <VahaPageShell>
      <div className="vaha-container flex flex-col gap-4 py-6">
        {role === 'admin' && (
          <VahaPanel eyebrow="Admin" title="Quick Actions">
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Link href="/admin/menu" className="flex items-center gap-3 border border-white/10 p-3 transition-colors hover:border-vaha-gold hover:text-vaha-gold">
                <FaUtensils />
                <span className="text-sm font-semibold">Manage Menu</span>
              </Link>
              <Link href="/admin/events" className="flex items-center gap-3 border border-white/10 p-3 transition-colors hover:border-vaha-gold hover:text-vaha-gold">
                <FaCalendarDays />
                <span className="text-sm font-semibold">Manage Events</span>
              </Link>
              <Link href="/staff/shifts" className="flex items-center gap-3 border border-white/10 p-3 transition-colors hover:border-vaha-gold hover:text-vaha-gold">
                <FaClock />
                <span className="text-sm font-semibold">Shift Schedule</span>
              </Link>
            </div>
          </VahaPanel>
        )}

        <VahaPanel
          eyebrow={role === 'admin' ? 'Admin' : 'My account'}
          title="My Account"
          description="Update your details and view past orders."
        >
          <div className="mt-4 flex flex-wrap gap-3">
            <VahaButton variant="outline" onClick={signOut}>
              Sign Out
            </VahaButton>
            <Link href="/menu" className="text-xs uppercase tracking-widest text-vaha-gold hover:underline">
              Order again
            </Link>
          </div>
        </VahaPanel>

        {error ? <VahaAlert tone="error">{error}</VahaAlert> : null}
        {message ? <VahaAlert tone="success">{message}</VahaAlert> : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
          <VahaPanel title="Your Details">
            <form className="mt-4 grid gap-3" onSubmit={saveProfile}>
              <input className={vahaInputClass} value={profile.email} onChange={(e) => updateProfile({ email: e.target.value })} placeholder="Email" aria-label="Email" type="email" required />
              <input className={vahaInputClass} value={profile.full_name} onChange={(e) => updateProfile({ full_name: e.target.value })} placeholder="Full name" aria-label="Full name" required />
              <input className={vahaInputClass} value={profile.phone} onChange={(e) => updateProfile({ phone: e.target.value })} placeholder="Phone" aria-label="Phone" type="tel" />
              <textarea className={vahaTextareaClass} value={profile.address} onChange={(e) => updateProfile({ address: e.target.value })} placeholder="Address" aria-label="Address" />
              <VahaButton type="button" variant="outline" onClick={requestLocation}>
                Use My Location
              </VahaButton>
              {profile.maps_link ? (
                <a className="text-sm text-vaha-gold underline underline-offset-4" href={profile.maps_link} target="_blank" rel="noopener noreferrer">
                  Open saved location
                </a>
              ) : null}
              <VahaButton type="submit" variant="solid">
                Save Profile
              </VahaButton>
            </form>
          </VahaPanel>

          <VahaPanel title="Receipts & Invoices">
            {orders.length === 0 ? (
              <p className="mt-4 text-vaha-muted">No orders yet. Browse the menu to place your first order.</p>
            ) : (
              <div className="mt-4 grid gap-3">
                {orders.map((order) => (
                  <article key={order.id} className="border border-white/10 bg-vaha-ink p-4">
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <p><span className="text-vaha-muted">Invoice:</span> {order.invoice_number}</p>
                      <p><span className="text-vaha-muted">Receipt:</span> {order.receipt_number}</p>
                      <p><span className="text-vaha-muted">Total:</span> £{Number(order.subtotal).toFixed(2)}</p>
                      <p><span className="text-vaha-muted">Status:</span> {order.status}</p>
                      <p><span className="text-vaha-muted">Service:</span> {order.service}</p>
                      <p><span className="text-vaha-muted">Date:</span> {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="mt-3 border-t border-white/10 pt-3">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-sm text-vaha-muted">
                          {item.quantity}x {item.itemName} — {item.price}
                        </p>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </VahaPanel>
        </div>
      </div>
    </VahaPageShell>
  );
}
