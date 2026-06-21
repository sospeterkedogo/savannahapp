import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { getEvents } from '../lib/events';
import { VahaCta, VahaPageHero, VahaPageShell } from '../components/vaha/VahaUI';
import type { SavannahEvent } from '../types/app';
import { FaCalendarDays, FaClock, FaLocationDot } from 'react-icons/fa6';

export default function Events() {
  const [events, setEvents] = useState<SavannahEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  return (
    <VahaPageShell>
      <Head>
        <title>Events & Updates | Savannah B&G</title>
      </Head>

      <VahaPageHero
        eyebrow="News and Events"
        title="Events & Updates"
        description="Stay posted on live music, tasting evenings, and special offers at Savannah."
        imageSrc="/images/bbq3.jpeg"
      />

      <section className="vaha-section bg-vaha-ink-soft">
        <div className="vaha-container">
          {loading ? (
            <p className="vaha-eyebrow text-center" role="status" aria-live="polite">Loading events…</p>
          ) : events.length === 0 ? (
            <div className="border border-white/10 p-16 text-center">
              <p className="font-serif text-2xl italic text-vaha-muted/50">No upcoming events at the moment.</p>
              <p className="mt-4 text-sm text-vaha-muted">Check back soon or follow us on social media.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {events.map((event, index) => (
                <article
                  key={event.id}
                  className={`grid items-center gap-10 border border-white/10 bg-vaha-ink p-6 md:p-10 lg:grid-cols-2 ${index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={event.image_url || '/images/bbq3.jpeg'}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                  <div className="space-y-5">
                    <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-vaha-gold">
                      <span className="flex items-center gap-2"><FaCalendarDays aria-hidden /> {event.date}</span>
                      <span className="flex items-center gap-2"><FaClock aria-hidden /> {event.time}</span>
                    </div>
                    <h2 className="font-serif text-3xl text-vaha-cream md:text-4xl">{event.title}</h2>
                    <p className="flex items-center gap-2 text-sm text-vaha-muted">
                      <FaLocationDot className="text-vaha-gold" aria-hidden /> {event.location}
                    </p>
                    <p className="text-vaha-muted leading-relaxed">{event.description}</p>
                    <VahaCta href="/book" variant="solid">RSVP / Book a Table</VahaCta>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-20 border-t border-white/10 pt-12 text-center">
            <p className="text-vaha-muted">Want to host a private event at Savannah?</p>
            <div className="mt-6">
              <VahaCta href="/contact">Inquire About Private Hire</VahaCta>
            </div>
          </div>
        </div>
      </section>
    </VahaPageShell>
  );
}
