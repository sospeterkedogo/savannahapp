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
import { FaGear, FaCalendarDays, FaUtensils, FaClock } from 'react-icons/fa6';

const inputClass =
  'min-h-12 rounded-lg border border-luxury-accent/50 bg-black/40 px-4 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-luxury-accent';

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
        setProfile(savedProfile || {
          id,
          email: authProfile!.email || '',
          full_name: '',
          phone: '',
          address: '',
        });
        
        const customerOrders = await fetchCustomerOrders(id);
        setOrders(customerOrders);
      } catch (dbError) {
        console.error('Database error:', dbError);
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
        setMessage('Location added to profile. Save changes to keep it.');
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
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-luxury-accent"></div>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-black pb-16 pt-8">
        <section className="w-full max-w-xl rounded-2xl border border-luxury-accent/30 bg-black/70 p-8 text-center shadow-2xl">
          <h1 className="text-4xl font-serif font-bold text-luxury-accent">Profile</h1>
          <p className="mt-4 text-white/70">Sign in or create an account to manage your profile, invoices, and receipts.</p>
          <Link href="/login?redirect=/profile" className="luxury-cta mt-6 inline-flex rounded-full bg-gradient-to-r from-luxury-accent to-yellow-400 px-8 py-3 font-bold text-black">Sign In</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black pb-16 pt-8">
      <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 px-4 md:px-8">
        {/* Admin Quick Actions */}
        {role === 'admin' && (
          <section className="rounded-2xl border border-luxury-accent bg-luxury-accent/10 p-6 shadow-2xl mb-6">
            <h2 className="text-xl font-bold text-luxury-accent flex items-center gap-2 mb-6">
              <FaGear className="animate-spin-slow" /> Admin Console
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/menu" className="flex items-center gap-4 p-4 bg-black/40 rounded-xl border border-luxury-accent/30 hover:bg-luxury-accent hover:text-black transition-all group">
                <FaUtensils className="text-2xl text-luxury-accent group-hover:text-black" />
                <div>
                  <div className="font-bold">Manage Menu</div>
                  <div className="text-xs opacity-60">Add or edit dishes</div>
                </div>
              </Link>
              <Link href="/admin/events" className="flex items-center gap-4 p-4 bg-black/40 rounded-xl border border-luxury-accent/30 hover:bg-luxury-accent hover:text-black transition-all group">
                <FaCalendarDays className="text-2xl text-luxury-accent group-hover:text-black" />
                <div>
                  <div className="font-bold">Manage Events</div>
                  <div className="text-xs opacity-60">Promote upcoming nights</div>
                </div>
              </Link>
              <Link href="/staff/shifts" className="flex items-center gap-4 p-4 bg-black/40 rounded-xl border border-luxury-accent/30 hover:bg-luxury-accent hover:text-black transition-all group">
                <FaClock className="text-2xl text-luxury-accent group-hover:text-black" />
                <div>
                  <div className="font-bold">Shift Schedule</div>
                  <div className="text-xs opacity-60">Manage staff rotas</div>
                </div>
              </Link>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-luxury-accent/30 bg-black/70 p-6 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-luxury-accent/80">
                {role === 'admin' ? 'Administrator profile' : 'Customer profile'}
              </p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-luxury-accent">Account & Invoices</h1>
              <p className="mt-3 text-white/70">Manage your contact details and review Savannah receipts.</p>
            </div>
            <button onClick={signOut} className="rounded-full border border-white/30 px-6 py-3 font-bold text-white hover:border-luxury-accent hover:text-luxury-accent">Sign Out</button>
          </div>
        </section>

        {(message || error) && (
          <p className={`rounded-xl border px-4 py-3 text-sm ${error ? 'border-red-400/50 bg-red-950/50 text-red-100' : 'border-green-400/50 bg-green-950/40 text-green-100'}`}>
            {error || message}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <section className="rounded-2xl border border-luxury-accent/25 bg-black/60 p-5 shadow-xl">
            <h2 className="text-2xl font-serif font-bold text-luxury-accent">Details</h2>
            <form className="mt-5 grid gap-4" onSubmit={saveProfile}>
              <input className={inputClass} value={profile.email} onChange={(event) => updateProfile({ email: event.target.value })} placeholder="Email" aria-label="Email" type="email" required />
              <input className={inputClass} value={profile.full_name} onChange={(event) => updateProfile({ full_name: event.target.value })} placeholder="Full name" aria-label="Full name" required />
              <input className={inputClass} value={profile.phone} onChange={(event) => updateProfile({ phone: event.target.value })} placeholder="Phone" aria-label="Phone" type="tel" />
              <textarea className={`${inputClass} min-h-24`} value={profile.address} onChange={(event) => updateProfile({ address: event.target.value })} placeholder="Address" aria-label="Address" />
              <button type="button" onClick={requestLocation} className="rounded-full border border-luxury-accent/50 px-5 py-3 font-bold text-luxury-accent hover:bg-luxury-accent hover:text-black">
                Use My Location
              </button>
              {profile.maps_link && (
                <a className="text-sm font-semibold text-luxury-accent underline underline-offset-4" href={profile.maps_link} target="_blank" rel="noopener noreferrer">
                  Open saved Google Maps location
                </a>
              )}
              <button className="luxury-cta rounded-full bg-gradient-to-r from-luxury-accent to-yellow-400 px-8 py-3 font-bold text-black">
                Save Profile
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-luxury-accent/25 bg-black/60 p-5 shadow-xl">
            <h2 className="text-2xl font-serif font-bold text-luxury-accent">Receipts & Invoices</h2>
            {orders.length === 0 ? (
              <p className="mt-6 text-white/70">No orders yet.</p>
            ) : (
              <div className="mt-5 grid gap-4">
                {orders.map((order) => (
                  <article key={order.id} className="rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <p className="text-white"><span className="text-white/50">Invoice:</span> {order.invoice_number}</p>
                      <p className="text-white"><span className="text-white/50">Receipt:</span> {order.receipt_number}</p>
                      <p className="text-white"><span className="text-white/50">Total:</span> ${Number(order.subtotal).toFixed(2)}</p>
                      <p className="text-white"><span className="text-white/50">Status:</span> {order.status}</p>
                    </div>
                    <div className="mt-4 border-t border-white/10 pt-4">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-sm text-white/70">{item.quantity}x {item.itemName} - {item.price}</p>
                      ))}
                    </div>
                    {typeof order.location?.mapsLink === 'string' && (
                      <a className="mt-4 inline-flex text-sm font-semibold text-luxury-accent underline underline-offset-4" href={order.location.mapsLink} target="_blank" rel="noopener noreferrer">
                        Open order location
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
