import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import SocialLoginButtons from '../components/SocialLoginButtons';
import { getFriendlyAuthError } from '../lib/authRedirect';
import { supabase } from '../lib/supabase';
import { useCart } from '../lib/cart';
import {
  createGuestOrder,
  createOrder,
  fetchCustomerProfile,
  makeMapsLink,
  upsertCustomerProfile,
} from '../lib/customerOrders';
import type {
  AccountMode,
  CheckoutCustomerForm,
  CheckoutLocation,
  CustomerProfile,
  SavannahOrder,
} from '../types/app';

const emptyForm: CheckoutCustomerForm = {
  email: '',
  password: '',
  fullName: '',
  phone: '',
  address: '',
  service: 'collection',
  notes: '',
};

const inputClass =
  'min-h-12 rounded-lg border border-luxury-accent/50 bg-black/40 px-4 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-luxury-accent';

export default function Checkout() {
  const { items, count, subtotal, clearCart } = useCart();
  const [sessionUserId, setSessionUserId] = useState('');
  const [mode, setMode] = useState<AccountMode>('signin');
  const [form, setForm] = useState<CheckoutCustomerForm>(emptyForm);
  const [location, setLocation] = useState<CheckoutLocation>({ consented: false });
  const [locationMessage, setLocationMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<SavannahOrder | null>(null);

  useEffect(() => {
    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setSessionUserId(session.user.id);
      setForm((current) => ({ ...current, email: session.user.email || current.email }));

      const profile = await fetchCustomerProfile(session.user.id);
      if (profile) {
        setForm((current) => ({
          ...current,
          email: profile.email || current.email,
          fullName: profile.full_name,
          phone: profile.phone,
          address: profile.address,
        }));
        if (profile.latitude && profile.longitude) {
          setLocation({
            consented: true,
            latitude: profile.latitude,
            longitude: profile.longitude,
            mapsLink: profile.maps_link || makeMapsLink(profile.latitude, profile.longitude),
          });
        }
      }
    }

    loadSession();
  }, []);

  function updateForm(next: Partial<CheckoutCustomerForm>) {
    setForm((current) => ({ ...current, ...next }));
  }

  async function handleAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const authCall = mode === 'signin'
      ? supabase.auth.signInWithPassword({ email: form.email, password: form.password })
      : supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.fullName } },
        });

    const { data, error: authError } = await authCall;
    setLoading(false);

    if (authError) {
      setError(getFriendlyAuthError(authError.message));
      return;
    }

    const userId = data.user?.id || data.session?.user.id;
    if (userId) setSessionUserId(userId);
  }

  function requestLocation() {
    setLocationMessage('');
    setError('');

    if (!('geolocation' in navigator)) {
      setLocationMessage('Location is not available in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({
          consented: true,
          latitude,
          longitude,
          accuracy,
          mapsLink: makeMapsLink(latitude, longitude),
        });
        setLocationMessage('Location added to checkout.');
      },
      () => {
        setLocation({ consented: false });
        setLocationMessage('Location permission was not granted. You can still use your typed address.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) {
      setError('Add menu items to your cart first.');
      return;
    }

    setLoading(true);
    setError('');

    const customer = {
      email: form.email,
      full_name: form.fullName,
      phone: form.phone,
      address: form.address,
      latitude: location.latitude,
      longitude: location.longitude,
      maps_link: location.mapsLink,
    };

    try {
      let order: SavannahOrder;

      if (sessionUserId) {
        const profile: CustomerProfile = {
          id: sessionUserId,
          ...customer,
        };

        await upsertCustomerProfile(profile);
        const result = await createOrder({
          userId: sessionUserId,
          customer,
          location,
          items,
          subtotal,
          service: form.service,
          notes: form.notes,
        });
        order = result.order;
      } else {
        const result = await createGuestOrder({
          customer,
          location,
          items,
          subtotal,
          service: form.service,
          notes: form.notes,
        });
        order = result.order;
      }

      setPlacedOrder(order);
      clearCart();
    } catch (orderError) {
      setError(orderError instanceof Error ? orderError.message : 'Could not place order.');
    } finally {
      setLoading(false);
    }
  }

  if (placedOrder) {
    return (
      <main className="min-h-screen bg-black pb-16 pt-8">
        <section className="mx-auto w-full max-w-4xl rounded-2xl border border-luxury-accent/30 bg-black/70 p-6 shadow-2xl md:p-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-luxury-accent/80">Receipt & invoice</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-luxury-accent">Order Placed</h1>
          {!placedOrder.user_id && (
            <p className="mt-3 text-white/70">This was placed as a guest order. Keep this receipt number for collection or support.</p>
          )}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <p className="text-white"><span className="text-white/50">Invoice:</span> {placedOrder.invoice_number}</p>
            <p className="text-white"><span className="text-white/50">Receipt:</span> {placedOrder.receipt_number}</p>
            <p className="text-white"><span className="text-white/50">Total:</span> ${Number(placedOrder.subtotal).toFixed(2)}</p>
            <p className="text-white"><span className="text-white/50">Status:</span> {placedOrder.status}</p>
          </div>
          {location.mapsLink && (
            <a className="mt-5 inline-flex text-luxury-accent underline underline-offset-4" href={location.mapsLink} target="_blank" rel="noopener noreferrer">
              Open delivery location in Google Maps
            </a>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {placedOrder.user_id ? (
              <Link href="/profile" className="luxury-cta rounded-full bg-gradient-to-r from-luxury-accent to-yellow-400 px-8 py-3 font-bold text-black">View Profile</Link>
            ) : (
              <Link href="/login?redirect=/profile" className="luxury-cta rounded-full bg-gradient-to-r from-luxury-accent to-yellow-400 px-8 py-3 font-bold text-black">Create Profile</Link>
            )}
            <Link href="/menu" className="rounded-full border border-luxury-accent/50 px-8 py-3 font-bold text-luxury-accent hover:bg-luxury-accent hover:text-black">Order More</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black pb-16 pt-8">
      <div className="vaha-container flex flex-col gap-4 py-4">
        <section className="rounded-2xl border border-luxury-accent/30 bg-black/70 p-6 shadow-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-luxury-accent/80">Checkout</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-luxury-accent">Cart Checkout</h1>
          <p className="mt-3 text-white/70">Checkout as a guest, or sign in to save your profile and order history. Location is only requested when you choose it.</p>
        </section>

        {error && <p className="rounded-xl border border-red-400/50 bg-red-950/50 px-4 py-3 text-sm text-red-100">{error}</p>}

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="flex flex-col gap-6">
            {!sessionUserId && (
              <section className="rounded-2xl border border-luxury-accent/25 bg-black/60 p-5 shadow-xl">
                <p className="mb-4 text-sm text-white/70">Account is optional. Guest checkout works with just your contact details and address.</p>
                <SocialLoginButtons context="checkout" redirectTo="/checkout" onError={setError} className="mb-5" />
                <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                  <span className="h-px flex-1 bg-white/15" />
                  <span>Email</span>
                  <span className="h-px flex-1 bg-white/15" />
                </div>
                <div className="mb-5 flex gap-3">
                  <button onClick={() => setMode('signin')} className={`rounded-full px-5 py-2 font-bold ${mode === 'signin' ? 'bg-luxury-accent text-black' : 'border border-white/30 text-white'}`}>Sign In</button>
                  <button onClick={() => setMode('create')} className={`rounded-full px-5 py-2 font-bold ${mode === 'create' ? 'bg-luxury-accent text-black' : 'border border-white/30 text-white'}`}>Create Account</button>
                </div>
                <form className="grid gap-4" onSubmit={handleAccount}>
                  {mode === 'create' && (
                    <input className={inputClass} value={form.fullName} onChange={(event) => updateForm({ fullName: event.target.value })} placeholder="Full name" aria-label="Full name" required />
                  )}
                  <input className={inputClass} value={form.email} onChange={(event) => updateForm({ email: event.target.value })} placeholder="Email" aria-label="Email" type="email" autoComplete="email" required />
                  <input className={inputClass} value={form.password} onChange={(event) => updateForm({ password: event.target.value })} placeholder="Password" aria-label="Password" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required />
                  <button disabled={loading} className="luxury-cta rounded-full bg-gradient-to-r from-luxury-accent to-yellow-400 px-8 py-3 font-bold text-black disabled:opacity-60">
                    {loading ? 'Working...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>
              </section>
            )}

            <section className="rounded-2xl border border-luxury-accent/25 bg-black/60 p-5 shadow-xl">
              <h2 className="text-2xl font-serif font-bold text-luxury-accent">Customer & Location</h2>
              <form className="mt-5 grid gap-4" onSubmit={placeOrder}>
                <div className="grid gap-4 md:grid-cols-2">
                  <input className={inputClass} value={form.fullName} onChange={(event) => updateForm({ fullName: event.target.value })} placeholder="Full name" aria-label="Full name" required />
                  <input className={inputClass} value={form.phone} onChange={(event) => updateForm({ phone: event.target.value })} placeholder="Phone" aria-label="Phone" type="tel" required />
                </div>
                <input className={inputClass} value={form.email} onChange={(event) => updateForm({ email: event.target.value })} placeholder="Email for receipt (optional)" aria-label="Email for receipt" type="email" autoComplete="email" />
                <textarea className={`${inputClass} min-h-24`} value={form.address} onChange={(event) => updateForm({ address: event.target.value })} placeholder="Delivery or collection address" aria-label="Address" required />
                <div className="rounded-xl border border-white/10 bg-black/35 p-4">
                  <p className="text-sm text-white/70">Location is optional. We ask only when you press the button, and use it for this order location and receipt.</p>
                  <button type="button" onClick={requestLocation} className="mt-3 rounded-full border border-luxury-accent/50 px-5 py-2 font-bold text-luxury-accent hover:bg-luxury-accent hover:text-black">
                    Use My Location
                  </button>
                  {locationMessage && <p className="mt-3 text-sm text-white/65">{locationMessage}</p>}
                  {location.mapsLink && (
                    <a className="mt-3 inline-flex text-sm text-luxury-accent underline underline-offset-4" href={location.mapsLink} target="_blank" rel="noopener noreferrer">
                      Preview Google Maps location
                    </a>
                  )}
                </div>
                <select className={inputClass} value={form.service} onChange={(event) => updateForm({ service: event.target.value })} aria-label="Checkout service">
                  <option value="collection">Collection</option>
                  <option value="table">Table order</option>
                  <option value="delivery">Delivery</option>
                </select>
                <textarea className={`${inputClass} min-h-24`} value={form.notes} onChange={(event) => updateForm({ notes: event.target.value })} placeholder="Checkout notes" aria-label="Checkout notes" />
                <button disabled={loading || items.length === 0} className="luxury-cta rounded-full bg-gradient-to-r from-luxury-accent to-yellow-400 px-8 py-3 text-lg font-bold text-black disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? 'Placing Order...' : sessionUserId ? 'Place Order' : 'Place Guest Order'}
                </button>
              </form>
            </section>
          </div>

          <aside className="rounded-2xl border border-luxury-accent/25 bg-black/60 p-5 shadow-xl">
            <h2 className="text-2xl font-serif font-bold text-luxury-accent">Order Summary</h2>
            {items.length === 0 ? (
              <div className="mt-6 text-white/70">
                <p>Your cart is empty.</p>
                <Link href="/menu" className="mt-4 inline-flex text-luxury-accent underline underline-offset-4">Browse menu</Link>
              </div>
            ) : (
              <div className="mt-5 grid gap-4">
                {items.map((item) => (
                  <div key={item.id} className="border-b border-white/10 pb-4">
                    <p className="font-semibold text-white">{item.quantity}x {item.itemName}</p>
                    <p className="mt-1 text-sm text-white/55">{item.menuTitle} | {item.service}</p>
                    <p className="mt-1 text-sm font-bold text-luxury-accent">{item.price}</p>
                  </div>
                ))}
                <p className="text-2xl font-bold text-white">Subtotal ${subtotal.toFixed(2)}</p>
                <Link href="/cart" className="text-sm font-semibold text-luxury-accent underline underline-offset-4">Edit cart</Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
