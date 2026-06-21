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
import {
  VahaAlert,
  VahaButton,
  VahaCta,
  VahaPageShell,
  VahaPanel,
  vahaInputClass,
  vahaTextareaClass,
} from '../components/vaha/VahaUI';

const emptyForm: CheckoutCustomerForm = {
  email: '',
  password: '',
  fullName: '',
  phone: '',
  address: '',
  service: 'collection',
  notes: '',
};

const inputClass = vahaInputClass;

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
      <VahaPageShell>
        <div className="vaha-container py-6">
          <VahaPanel eyebrow="Receipt & invoice" title="Order Placed" description={!placedOrder.user_id ? 'Guest order — keep this receipt number for collection or support.' : undefined}>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <p><span className="text-vaha-muted">Invoice:</span> {placedOrder.invoice_number}</p>
              <p><span className="text-vaha-muted">Receipt:</span> {placedOrder.receipt_number}</p>
              <p><span className="text-vaha-muted">Total:</span> £{Number(placedOrder.subtotal).toFixed(2)}</p>
              <p><span className="text-vaha-muted">Status:</span> {placedOrder.status}</p>
            </div>
            {location.mapsLink ? (
              <a className="mt-4 inline-flex text-sm text-vaha-gold underline underline-offset-4" href={location.mapsLink} target="_blank" rel="noopener noreferrer">
                Open delivery location
              </a>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {placedOrder.user_id ? (
                <VahaCta href="/profile" variant="solid">View Account</VahaCta>
              ) : (
                <VahaCta href="/login?redirect=/profile" variant="solid">Create Account</VahaCta>
              )}
              <VahaCta href="/menu">Order More</VahaCta>
            </div>
          </VahaPanel>
        </div>
      </VahaPageShell>
    );
  }

  return (
    <VahaPageShell>
      <div className="vaha-container flex flex-col gap-4 py-6">
        <VahaPanel eyebrow="Checkout" title="Cart Checkout" description="Checkout as a guest or sign in to save your profile and order history." />

        {error ? <VahaAlert tone="error">{error}</VahaAlert> : null}

        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-4">
            {!sessionUserId ? (
              <VahaPanel title="Account (optional)">
                <p className="mb-4 text-sm text-vaha-muted">Guest checkout works with contact details and address only.</p>
                <SocialLoginButtons context="checkout" redirectTo="/checkout" onError={setError} className="mb-4" />
                <div className="mb-4 flex gap-2">
                  <VahaButton variant={mode === 'signin' ? 'solid' : 'outline'} onClick={() => setMode('signin')}>Sign In</VahaButton>
                  <VahaButton variant={mode === 'create' ? 'solid' : 'outline'} onClick={() => setMode('create')}>Create</VahaButton>
                </div>
                <form className="grid gap-3" onSubmit={handleAccount}>
                  {mode === 'create' ? (
                    <input className={inputClass} value={form.fullName} onChange={(e) => updateForm({ fullName: e.target.value })} placeholder="Full name" aria-label="Full name" required />
                  ) : null}
                  <input className={inputClass} value={form.email} onChange={(e) => updateForm({ email: e.target.value })} placeholder="Email" aria-label="Email" type="email" autoComplete="email" required />
                  <input className={inputClass} value={form.password} onChange={(e) => updateForm({ password: e.target.value })} placeholder="Password" aria-label="Password" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required />
                  <VahaButton type="submit" variant="solid" disabled={loading}>
                    {loading ? 'Working…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                  </VahaButton>
                </form>
              </VahaPanel>
            ) : null}

            <VahaPanel title="Customer & Location">
              <form className="mt-4 grid gap-3" onSubmit={placeOrder}>
                <div className="grid gap-3 md:grid-cols-2">
                  <input className={inputClass} value={form.fullName} onChange={(e) => updateForm({ fullName: e.target.value })} placeholder="Full name" aria-label="Full name" required />
                  <input className={inputClass} value={form.phone} onChange={(e) => updateForm({ phone: e.target.value })} placeholder="Phone" aria-label="Phone" type="tel" required />
                </div>
                <input className={inputClass} value={form.email} onChange={(e) => updateForm({ email: e.target.value })} placeholder="Email for receipt (optional)" aria-label="Email for receipt" type="email" autoComplete="email" />
                <textarea className={vahaTextareaClass} value={form.address} onChange={(e) => updateForm({ address: e.target.value })} placeholder="Delivery or collection address" aria-label="Address" required />
                <div className="border border-white/10 p-3">
                  <p className="text-sm text-vaha-muted">Location is optional — only requested when you tap the button.</p>
                  <VahaButton type="button" variant="outline" className="mt-3" onClick={requestLocation}>Use My Location</VahaButton>
                  {locationMessage ? <p className="mt-2 text-sm text-vaha-muted">{locationMessage}</p> : null}
                  {location.mapsLink ? (
                    <a className="mt-2 inline-flex text-sm text-vaha-gold underline" href={location.mapsLink} target="_blank" rel="noopener noreferrer">Preview on Maps</a>
                  ) : null}
                </div>
                <select className={inputClass} value={form.service} onChange={(e) => updateForm({ service: e.target.value })} aria-label="Checkout service">
                  <option value="collection">Collection</option>
                  <option value="table">Table order</option>
                  <option value="delivery">Delivery</option>
                </select>
                <textarea className={vahaTextareaClass} value={form.notes} onChange={(e) => updateForm({ notes: e.target.value })} placeholder="Checkout notes" aria-label="Checkout notes" />
                <VahaButton type="submit" variant="solid" disabled={loading || items.length === 0}>
                  {loading ? 'Placing Order…' : sessionUserId ? 'Place Order' : 'Place Guest Order'}
                </VahaButton>
              </form>
            </VahaPanel>
          </div>

          <VahaPanel title="Order Summary">
            {items.length === 0 ? (
              <div className="mt-4 text-vaha-muted">
                <p>Your cart is empty.</p>
                <Link href="/menu" className="mt-3 inline-block text-vaha-gold underline">Browse menu</Link>
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                {items.map((item) => (
                  <div key={item.id} className="border-b border-white/10 pb-3">
                    <p className="font-semibold">{item.quantity}x {item.itemName}</p>
                    <p className="text-sm text-vaha-muted">{item.menuTitle} | {item.service}</p>
                    <p className="text-sm text-vaha-gold">{item.price}</p>
                  </div>
                ))}
                <p className="font-serif text-2xl">Subtotal £{subtotal.toFixed(2)}</p>
                <Link href="/cart" className="text-sm text-vaha-gold underline">Edit cart</Link>
              </div>
            )}
          </VahaPanel>
        </div>
      </div>
    </VahaPageShell>
  );
}
