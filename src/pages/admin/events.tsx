import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthGuard } from '../../lib/useAuthGuard';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../lib/events';
import type { SavannahEvent } from '../../types/app';
import { FaPlus, FaPencil, FaTrash, FaCalendarDays, FaClock, FaLocationDot } from 'react-icons/fa6';
import { StaffAccessDenied, StaffLoading, StaffPageHeader, StaffShell } from '../../components/staff/StaffLayout';
import { VahaButton, VahaPanel, vahaInputClass, vahaTextareaClass } from '../../components/vaha/VahaUI';

export default function AdminEvents() {
  const { profile, loading: authLoading, allowed } = useAuthGuard(['admin']);
  const [events, setEvents] = useState<SavannahEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<SavannahEvent>>({});

  useEffect(() => {
    if (!authLoading && profile?.role === 'admin') {
      fetchEvents();
    }
  }, [authLoading, profile]);

  async function fetchEvents() {
    setLoading(true);
    const data = await getEvents();
    setEvents(data);
    setLoading(false);
  }

  function handleEdit(event: SavannahEvent) {
    setCurrentEvent(event);
    setIsEditing(true);
  }

  function handleCreate() {
    setCurrentEvent({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '19:00',
      location: 'Savannah Bar & Grill',
      image_url: '/images/bbq3.jpeg',
    });
    setIsEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (currentEvent.id) {
        await updateEvent(currentEvent.id, currentEvent);
      } else {
        await createEvent(currentEvent as Omit<SavannahEvent, 'id'>);
      }
      setIsEditing(false);
      fetchEvents();
    } catch (err) {
      console.error('Error saving event:', err);
      alert('Failed to save event');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event?')) return;
    try {
      await deleteEvent(id);
      fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Failed to delete event');
    }
  }

  if (authLoading || loading) return <StaffLoading label="Loading events…" />;

  if (!allowed) return <StaffAccessDenied message="Admin access required to manage events." />;

  return (
    <StaffShell>
      <Head>
        <title>Admin: Events | Savannah</title>
      </Head>

      <div className="vaha-container flex flex-col gap-4 py-6">
        <StaffPageHeader
          eyebrow="Admin"
          title="Events Management"
          actions={
            <>
              <Link href="/staff" className="text-xs uppercase tracking-widest text-vaha-gold hover:underline">Dashboard</Link>
              <VahaButton variant="solid" onClick={handleCreate}>
                <FaPlus /> New Event
              </VahaButton>
            </>
          }
        />

        {isEditing ? (
          <VahaPanel title={currentEvent.id ? 'Edit Event' : 'Create Event'}>
            <form onSubmit={handleSave} className="mt-4 grid gap-3 md:grid-cols-2">
              <input type="text" className={vahaInputClass} value={currentEvent.title || ''} onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })} placeholder="Title" required aria-label="Title" />
              <input type="text" className={vahaInputClass} value={currentEvent.image_url || ''} onChange={(e) => setCurrentEvent({ ...currentEvent, image_url: e.target.value })} placeholder="Image URL" aria-label="Image URL" />
              <textarea className={`${vahaTextareaClass} md:col-span-2`} value={currentEvent.description || ''} onChange={(e) => setCurrentEvent({ ...currentEvent, description: e.target.value })} placeholder="Description" required aria-label="Description" />
              <input type="date" className={vahaInputClass} value={currentEvent.date || ''} onChange={(e) => setCurrentEvent({ ...currentEvent, date: e.target.value })} required aria-label="Date" />
              <input type="time" className={vahaInputClass} value={currentEvent.time || ''} onChange={(e) => setCurrentEvent({ ...currentEvent, time: e.target.value })} required aria-label="Time" />
              <input type="text" className={`${vahaInputClass} md:col-span-2`} value={currentEvent.location || ''} onChange={(e) => setCurrentEvent({ ...currentEvent, location: e.target.value })} placeholder="Location" required aria-label="Location" />
              <div className="flex gap-2 md:col-span-2">
                <VahaButton type="submit" variant="solid">Save Event</VahaButton>
                <VahaButton type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</VahaButton>
              </div>
            </form>
          </VahaPanel>
        ) : null}

        <div className="grid gap-4">
          {events.length === 0 ? (
            <VahaPanel description="No events yet. Create your first event." />
          ) : (
            events.map((event) => (
              <article key={event.id} className="flex flex-col gap-4 border border-white/10 bg-vaha-ink-soft p-4 md:flex-row md:items-center">
                <div className="relative h-32 w-full shrink-0 overflow-hidden border border-white/10 md:h-28 md:w-28">
                  <Image src={event.image_url || '/images/bbq3.jpeg'} alt={event.title} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-3 text-xs uppercase tracking-widest text-vaha-gold">
                    <span className="flex items-center gap-1"><FaCalendarDays /> {event.date}</span>
                    <span className="flex items-center gap-1"><FaClock /> {event.time}</span>
                    <span className="flex items-center gap-1"><FaLocationDot /> {event.location}</span>
                  </div>
                  <h3 className="mt-2 font-serif text-2xl text-vaha-cream">{event.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-vaha-muted">{event.description}</p>
                </div>
                <div className="flex gap-2">
                  <VahaButton variant="outline" onClick={() => handleEdit(event)} aria-label={`Edit ${event.title}`}>
                    <FaPencil />
                  </VahaButton>
                  <VahaButton variant="ghost" onClick={() => handleDelete(event.id)} aria-label={`Delete ${event.title}`}>
                    <FaTrash className="text-red-400" />
                  </VahaButton>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </StaffShell>
  );
}
