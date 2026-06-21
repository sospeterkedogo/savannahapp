import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useCurrentProfile } from '../lib/useCurrentProfile';
import { fetchCustomerProfile } from '../lib/customerOrders';
import type { SavannahBooking } from '../types/app';
import { FaPhone, FaWhatsapp } from 'react-icons/fa6';
import { VahaAlert, VahaButton, VahaCta, VahaPageHero, VahaPageShell, VahaPanel, vahaInputClass } from '../components/vaha/VahaUI';

export default function Book() {
  const { profile } = useCurrentProfile();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: 2,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<{ available: boolean; remainingCapacity: number } | null>(null);
  const [successBooking, setSuccessBooking] = useState<SavannahBooking | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function prefill() {
      if (profile) {
        setFormData(prev => ({
          ...prev,
          email: profile.email || ''
        }));
        
        try {
          const cust = await fetchCustomerProfile(profile.id);
          if (cust) {
            setFormData(prev => ({
              ...prev,
              fullName: cust.full_name || prev.fullName,
              phone: cust.phone || prev.phone
            }));
          }
        } catch (err) {
          console.error('Failed to fetch customer profile for prefill');
        }
      }
    }
    prefill();
  }, [profile]);

  useEffect(() => {
    if (formData.date && formData.time) {
      const timer = setTimeout(() => {
        checkAvailability();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.date, formData.time]);

  async function checkAvailability() {
    try {
      const res = await fetch(`/api/bookings?date=${formData.date}&time=${formData.time}`);
      const data = await res.json();
      setAvailability(data);
    } catch (err) {
      console.error('Failed to check availability');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile?.id,
          ...formData
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to book table');

      setSuccessBooking(result.booking);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (successBooking) {
    return (
      <VahaPageShell>
        <div className="vaha-container max-w-2xl py-10">
          <VahaPanel eyebrow="Done" title="Table Booked!" description="Your table is saved. We sent a confirmation to your email.">
            <div className="mt-4 space-y-2 text-sm">
              <p><span className="text-vaha-muted">Confirmation:</span> {successBooking.receipt_number}</p>
              <p><span className="text-vaha-muted">Guest:</span> {successBooking.full_name}</p>
              <p><span className="text-vaha-muted">Date:</span> {successBooking.booking_date}</p>
              <p><span className="text-vaha-muted">Time:</span> {successBooking.booking_time}</p>
              <p><span className="text-vaha-muted">Party:</span> {successBooking.guests_count}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="tel:+44234567890" className="text-xs uppercase tracking-widest text-vaha-gold hover:underline">Call support</a>
              <VahaCta href="/">Return Home</VahaCta>
            </div>
          </VahaPanel>
        </div>
      </VahaPageShell>
    );
  }

  return (
    <VahaPageShell>
      <VahaPageHero eyebrow="Book a Table" title="Book a Table" description="Pick a date and time. We will hold a table for you." imageSrc="/images/bbq3.jpeg" />
      <div className="vaha-container grid gap-6 py-8 lg:grid-cols-2">
        <VahaPanel title="Contact">
          <div className="mt-4 space-y-4 text-sm text-vaha-muted">
            <p className="flex items-center gap-2"><FaPhone className="text-vaha-gold" /> <a href="tel:+44234567890" className="hover:text-vaha-gold">+44 234 567 890</a></p>
            <p className="flex items-center gap-2"><FaWhatsapp className="text-green-500" /> <a href="https://wa.me/44234567890" className="hover:text-vaha-gold">WhatsApp</a></p>
          </div>
        </VahaPanel>

        <VahaPanel title="Booking Details">
          <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
            {error ? <VahaAlert tone="error">{error}</VahaAlert> : null}
            <input required value={formData.fullName} onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))} className={vahaInputClass} placeholder="Full name" aria-label="Full name" />
            <input required type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} className={vahaInputClass} placeholder="Email" aria-label="Email" />
            <input required value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} className={vahaInputClass} placeholder="Phone" aria-label="Phone" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input required type="date" min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))} className={vahaInputClass} aria-label="Date" />
              <input required type="time" value={formData.time} onChange={(e) => setFormData((p) => ({ ...p, time: e.target.value }))} className={vahaInputClass} aria-label="Time" />
            </div>
            <select value={formData.guests} onChange={(e) => setFormData((p) => ({ ...p, guests: parseInt(e.target.value) }))} className={vahaInputClass} aria-label="Guests">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
              ))}
            </select>
            {availability ? (
              <p className={`text-xs uppercase tracking-widest ${availability.available ? 'text-green-400' : 'text-red-400'}`}>
                {availability.available ? `Available — ${availability.remainingCapacity} seats left` : 'Fully booked for this slot'}
              </p>
            ) : null}
            <textarea value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} className={`${vahaInputClass} min-h-24`} placeholder="Special requests" aria-label="Notes" />
            <VahaButton type="submit" variant="solid" disabled={loading || availability?.available === false}>
              {loading ? 'Saving…' : 'Book Table'}
            </VahaButton>
          </form>
        </VahaPanel>
      </div>
    </VahaPageShell>
  );
}
