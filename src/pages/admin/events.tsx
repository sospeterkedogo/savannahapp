import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthGuard } from '../../lib/useAuthGuard';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../lib/events';
import type { SavannahEvent } from '../../types/app';
import { FaPlus, FaPencil, FaTrash, FaCalendarDays, FaClock, FaLocationDot, FaArrowLeft } from 'react-icons/fa6';

export default function AdminEvents() {
  const { profile, loading: authLoading } = useAuthGuard(['admin']);
  const router = useRouter();
  const [events, setEvents] = useState<SavannahEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<SavannahEvent>>({});

  useEffect(() => {
    if (!authLoading && profile?.role === 'admin') {
      fetchEvents();
    }
  }, [authLoading, profile]);

  const fetchEvents = async () => {
    setLoading(true);
    const data = await getEvents();
    setEvents(data);
    setLoading(false);
  };

  const handleEdit = (event: SavannahEvent) => {
    setCurrentEvent(event);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setCurrentEvent({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '19:00',
      location: 'Savannah Bar & Grill',
      image_url: '/images/bbq3.jpeg'
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
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
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id);
        fetchEvents();
      } catch (err) {
        console.error('Error deleting event:', err);
        alert('Failed to delete event');
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-luxury-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-16">
      <Head>
        <title>Admin: Events Management | Savannah B&G</title>
      </Head>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-6">
            <Link href="/profile" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10">
              <FaArrowLeft />
            </Link>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-luxury-accent">Events Management</h1>
          </div>
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-8 py-4 bg-luxury-accent text-black rounded-full font-bold hover:bg-white transition-all shadow-xl"
          >
            <FaPlus /> Create New Event
          </button>
        </div>

        {isEditing ? (
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 mb-12 backdrop-blur-xl">
            <h2 className="text-3xl font-serif font-bold mb-8 text-luxury-accent">
              {currentEvent.id ? 'Edit Event' : 'Create New Event'}
            </h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-widest text-white/60">Title</label>
                <input 
                  type="text" 
                  value={currentEvent.title || ''}
                  onChange={e => setCurrentEvent({...currentEvent, title: e.target.value})}
                  className="bg-black/50 border border-white/10 rounded-xl p-4 focus:border-luxury-accent outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-widest text-white/60">Image URL</label>
                <input 
                  type="text" 
                  value={currentEvent.image_url || ''}
                  onChange={e => setCurrentEvent({...currentEvent, image_url: e.target.value})}
                  className="bg-black/50 border border-white/10 rounded-xl p-4 focus:border-luxury-accent outline-none"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-bold uppercase tracking-widest text-white/60">Description</label>
                <textarea 
                  value={currentEvent.description || ''}
                  onChange={e => setCurrentEvent({...currentEvent, description: e.target.value})}
                  className="bg-black/50 border border-white/10 rounded-xl p-4 focus:border-luxury-accent outline-none h-32"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-widest text-white/60">Date</label>
                <input 
                  type="date" 
                  value={currentEvent.date || ''}
                  onChange={e => setCurrentEvent({...currentEvent, date: e.target.value})}
                  className="bg-black/50 border border-white/10 rounded-xl p-4 focus:border-luxury-accent outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-widest text-white/60">Time</label>
                <input 
                  type="time" 
                  value={currentEvent.time || ''}
                  onChange={e => setCurrentEvent({...currentEvent, time: e.target.value})}
                  className="bg-black/50 border border-white/10 rounded-xl p-4 focus:border-luxury-accent outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-bold uppercase tracking-widest text-white/60">Location</label>
                <input 
                  type="text" 
                  value={currentEvent.location || ''}
                  onChange={e => setCurrentEvent({...currentEvent, location: e.target.value})}
                  className="bg-black/50 border border-white/10 rounded-xl p-4 focus:border-luxury-accent outline-none"
                  required
                />
              </div>
              <div className="flex gap-4 mt-4">
                <button type="submit" className="px-8 py-4 bg-luxury-accent text-black rounded-full font-bold hover:bg-white transition-all">
                  Save Event
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-8 py-4 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-8">
          {events.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-white/10">
              <p className="text-2xl text-white/40">No events found. Create your first event!</p>
            </div>
          ) : (
            events.map(event => (
              <div key={event.id} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 items-center hover:border-luxury-accent/30 transition-all group">
                <div className="relative w-full md:w-48 aspect-square rounded-2xl overflow-hidden border border-white/10">
                  <Image src={event.image_url || '/images/bbq3.jpeg'} alt={event.title} fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex flex-wrap gap-4 text-sm font-bold uppercase tracking-widest text-luxury-accent">
                    <span className="flex items-center gap-2"><FaCalendarDays /> {event.date}</span>
                    <span className="flex items-center gap-2"><FaClock /> {event.time}</span>
                    <span className="flex items-center gap-2"><FaLocationDot /> {event.location}</span>
                  </div>
                  <h3 className="text-3xl font-serif font-bold">{event.title}</h3>
                  <p className="text-white/60 font-light line-clamp-2">{event.description}</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleEdit(event)}
                    className="p-4 bg-white/5 rounded-full hover:bg-luxury-accent hover:text-black transition-all border border-white/10"
                    title="Edit Event"
                  >
                    <FaPencil />
                  </button>
                  <button 
                    onClick={() => handleDelete(event.id)}
                    className="p-4 bg-white/5 rounded-full hover:bg-red-500 hover:text-white transition-all border border-white/10"
                    title="Delete Event"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
