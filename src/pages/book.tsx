import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useCurrentProfile } from '../lib/useCurrentProfile';
import { fetchCustomerProfile } from '../lib/customerOrders';
import type { SavannahBooking } from '../types/app';
import { FaPhone, FaWhatsapp, FaEnvelope, FaCalendarCheck, FaUsers, FaClock, FaClipboardList } from 'react-icons/fa6';
import Link from 'next/link';

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
      <main className="min-h-screen bg-black pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto bg-zinc-900/50 border border-luxury-accent/30 rounded-3xl p-8 md:p-12 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-luxury-accent rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(197,160,89,0.4)]">
              <FaCalendarCheck className="text-4xl text-black" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-luxury-accent mb-2 uppercase tracking-tighter">Booking Confirmed!</h1>
            <p className="text-white/70 mb-8 max-w-md mx-auto">We've reserved your table at Savannah. A digital receipt and confirmation have been sent to your email and inbox.</p>
            
            <div className="w-full bg-black/60 border border-luxury-accent/20 rounded-2xl p-6 mb-8 text-left font-mono text-xs sm:text-sm">
              <div className="flex justify-between border-b border-white/5 pb-3 mb-4">
                <span className="text-white/40 uppercase tracking-widest">Confirmation #</span>
                <span className="text-luxury-accent font-bold">{successBooking.receipt_number}</span>
              </div>
              <div className="space-y-3 text-white/80">
                <div className="flex justify-between">
                  <span className="text-white/40">Guest Name</span>
                  <span className="text-white">{successBooking.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Date</span>
                  <span className="text-white">{successBooking.booking_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Arrival Time</span>
                  <span className="text-white">{successBooking.booking_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Party Size</span>
                  <span className="text-white">{successBooking.guests_count} People</span>
                </div>
                {successBooking.notes && (
                  <div className="pt-3 border-t border-white/5 mt-3 italic text-white/60">
                    "{successBooking.notes}"
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <a href="tel:+1234567890" className="flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white font-bold text-sm">
                <FaPhone className="text-luxury-accent" /> CALL SUPPORT
              </a>
              <a href="https://wa.me/1234567890" className="flex items-center justify-center gap-3 py-4 bg-green-600/20 border border-green-600/30 rounded-xl hover:bg-green-600/30 transition-all text-green-400 font-bold text-sm">
                <FaWhatsapp /> WHATSAPP
              </a>
            </div>

            <Link href="/" className="mt-8 text-luxury-accent hover:text-white transition-colors font-bold tracking-[0.3em] uppercase text-[10px]">
              Return to Savannah Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-luxury-accent mb-6 leading-[0.9]">Experience <br/><span className="text-white">Savannah</span></h1>
          <p className="text-xl text-white/50 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">Secure your spot at the finest bar and grill. Our table reservations ensure you have the best seat for your culinary journey.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 max-w-md mx-auto lg:mx-0">
            <div className="flex items-center gap-5 p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-luxury-accent/10 rounded-full flex items-center justify-center shrink-0 border border-luxury-accent/20">
                <FaPhone className="text-luxury-accent" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-sm">Phone Support</h3>
                <a href="tel:+1234567890" className="text-luxury-accent text-lg font-serif">+1 234 567 890</a>
              </div>
            </div>
            
            <div className="flex items-center gap-5 p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-green-600/10 rounded-full flex items-center justify-center shrink-0 border border-green-600/20">
                <FaWhatsapp className="text-green-500" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-sm">Direct WhatsApp</h3>
                <a href="https://wa.me/1234567890" className="text-green-500 text-lg font-serif">Chat with us</a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full max-w-xl bg-zinc-900/40 border border-luxury-accent/20 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-accent/5 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif font-bold text-white uppercase tracking-widest">Reserve a Table</h2>
              <div className="h-1 w-12 bg-luxury-accent mx-auto mt-2"></div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold text-center">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">Guest Details</label>
              <div className="relative">
                <FaClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-accent/50" />
                <input
                  required
                  value={formData.fullName}
                  onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:border-luxury-accent/50 transition-all outline-none"
                  placeholder="Your Full Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-accent/50" />
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:border-luxury-accent/50 transition-all outline-none"
                  placeholder="Email"
                />
              </div>
              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-accent/50" />
                <input
                  required
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:border-luxury-accent/50 transition-all outline-none"
                  placeholder="Phone"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <FaCalendarCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-accent/50" />
                <input
                  required
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-luxury-accent/50 transition-all outline-none appearance-none"
                />
              </div>
              <div className="relative">
                <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-accent/50" />
                <input
                  required
                  type="time"
                  value={formData.time}
                  onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-luxury-accent/50 transition-all outline-none appearance-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-accent/50" />
                <select
                  value={formData.guests}
                  onChange={e => setFormData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                  className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-luxury-accent/50 transition-all outline-none appearance-none cursor-pointer"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <option key={n} value={n} className="bg-zinc-900 text-white">{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                  <option value="12" className="bg-zinc-900 text-white">Large Party (10+)</option>
                </select>
              </div>
              {availability && (
                <div className={`text-[10px] font-bold tracking-widest uppercase text-center flex items-center justify-center gap-2 ${availability.available ? 'text-green-500' : 'text-red-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${availability.available ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  {availability.available ? `Slots Available: ${availability.remainingCapacity} Guests Max` : 'Fully Booked for this slot'}
                </div>
              )}
            </div>

            <div className="relative">
              <textarea
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 px-5 text-white placeholder:text-white/20 focus:border-luxury-accent/50 transition-all outline-none h-28 resize-none text-sm"
                placeholder="Any special requests or dietary requirements?"
              />
            </div>

            <button
              disabled={loading || availability?.available === false}
              className="w-full py-5 bg-luxury-accent text-black rounded-2xl font-black uppercase tracking-[0.3em] text-xs hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_20px_50px_rgba(197,160,89,0.2)] mt-4 active:scale-95"
            >
              {loading ? 'Confirming...' : 'Confirm Reservation'}
            </button>
            
            <p className="text-[9px] text-white/30 text-center uppercase tracking-widest">Digital receipt generated upon confirmation</p>
          </form>
        </div>
      </div>
    </main>
  );
}
