import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { getEvents } from '../lib/events';
import type { SavannahEvent } from '../types/app';
import { MdEvent } from '../components/HighEndIcons';
import { HiOutlineNewspaper } from '../components/HighEndIcons';
import { FaCalendarDays, FaClock, FaLocationDot, FaArrowLeft } from 'react-icons/fa6';

export default function Events() {
  const [events, setEvents] = useState<SavannahEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await getEvents();
      setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <main className="min-h-screen bg-black pb-32 pt-20 px-8">
      <Head>
        <title>Events & Updates | Savannah B&G</title>
      </Head>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-20 text-center">
          <Link href="/" className="mb-12 p-4 bg-white/5 rounded-full hover:bg-white/10 transition-all border border-white/10 group">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-luxury-accent mb-6 drop-shadow-lg flex items-center gap-6">
            <MdEvent className="text-5xl md:text-7xl" /> Events & Updates
          </h1>
          <p className="text-2xl text-white/60 max-w-2xl font-light leading-relaxed">
            <HiOutlineNewspaper className="inline-block mr-3 text-luxury-accent" /> 
            Stay tuned for our latest happenings, live music nights, tasting events, and exclusive news.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-luxury-accent"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-32 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-xl">
            <p className="text-3xl text-white/40 font-serif italic">No upcoming events at the moment.</p>
            <p className="mt-4 text-white/30">Please check back soon or follow us on social media for instant updates!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12">
            {events.map((event, index) => (
              <div 
                key={event.id} 
                className={`flex flex-col lg:flex-row gap-12 items-center bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 hover:border-luxury-accent/30 transition-all group overflow-hidden relative ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className="relative w-full lg:w-1/2 aspect-[16/9] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                  <Image 
                    src={event.image_url || '/images/bbq3.jpeg'} 
                    alt={event.title} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                
                <div className="flex-1 flex flex-col gap-6">
                  <div className="flex flex-wrap gap-6 text-sm font-bold uppercase tracking-[0.3em] text-luxury-accent">
                    <span className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full border border-white/10">
                      <FaCalendarDays /> {event.date}
                    </span>
                    <span className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full border border-white/10">
                      <FaClock /> {event.time}
                    </span>
                  </div>
                  
                  <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-tight">{event.title}</h2>
                  
                  <div className="flex items-center gap-3 text-white/50 text-lg italic">
                    <FaLocationDot className="text-luxury-accent" /> {event.location}
                  </div>
                  
                  <p className="text-xl text-white/70 font-light leading-relaxed">
                    {event.description}
                  </p>
                  
                  <div className="mt-4">
                    <Link href="/book" className="inline-block px-10 py-5 bg-luxury-accent text-black rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white transition-all shadow-xl">
                      RSVP / Book a Table
                    </Link>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-luxury-accent/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-luxury-accent/10 transition-colors" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-32 text-center">
          <p className="text-white/40 text-lg mb-8 italic">Want to host a private event at Savannah?</p>
          <Link href="/contact" className="text-luxury-accent font-bold uppercase tracking-[0.4em] text-sm underline underline-offset-8 hover:text-white transition-colors">
            Inquire About Private Hire
          </Link>
        </div>
      </div>
    </main>
  );
}
