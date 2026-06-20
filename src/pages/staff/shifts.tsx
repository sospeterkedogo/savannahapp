import { FormEvent, useEffect, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useAuthGuard } from '../../lib/useAuthGuard';
import {
  fetchShifts,
  createShift,
  updateShift,
  deleteShift,
  fetchStaffProfiles,
} from '../../lib/shifts';
import type { SavannahShift, ShiftInput } from '../../types/app';

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

type StaffProfileShort = {
  id: string;
  full_name: string;
  role: string;
};

const inputClass =
  'min-h-11 rounded-lg border border-luxury-accent/40 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/45 focus:ring-2 focus:ring-luxury-accent';

export default function ShiftsPage() {
  const { loading: authLoading, profile, allowed } = useAuthGuard(['admin', 'employee']);
  const [shifts, setShifts] = useState<SavannahShift[]>([]);
  const [staff, setStaff] = useState<StaffProfileShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [form, setForm] = useState<Partial<SavannahShift>>({
    user_id: '',
    role: 'Server',
    start_time: '',
    end_time: '',
    status: 'scheduled',
  });

  async function loadData() {
    setLoading(true);
    try {
      const [shiftsData, staffData] = await Promise.all([
        fetchShifts(),
        fetchStaffProfiles() as Promise<StaffProfileShort[]>,
      ]);
      setShifts(shiftsData);
      setStaff(staffData);
    } catch (err) {
      setError('Failed to load shifts.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (allowed) loadData();
  }, [allowed]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const input: ShiftInput = {
        user_id: form.user_id!,
        role: form.role!,
        start_time: form.start_time!,
        end_time: form.end_time!,
        status: form.status as SavannahShift['status'],
      };

      if (form.id) {
        await updateShift(form.id, input);
        setMessage('Shift updated successfully.');
      } else {
        await createShift(input);
        setMessage('Shift scheduled successfully.');
      }
      setForm({
        user_id: '',
        role: 'Server',
        start_time: '',
        end_time: '',
        status: 'scheduled',
      });
      await loadData();
    } catch (err) {
      setError('Failed to save shift.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this shift?')) return;
    try {
      await deleteShift(id);
      setMessage('Shift deleted.');
      await loadData();
    } catch (err) {
      setError('Failed to delete shift.');
    }
  }

  if (authLoading) return <div className="min-h-screen bg-black text-white p-8">Loading...</div>;
  if (!allowed) return <div className="min-h-screen bg-black text-white p-8">Access Denied</div>;

  return (
    <main className="min-h-screen bg-black pb-16 pt-8 text-white">
      <div className="mx-auto max-w-[1700px] px-4 md:px-8">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-luxury-accent">Operations</p>
            <h1 className="text-4xl font-serif font-bold text-luxury-accent">Staff Shifts</h1>
          </div>
          <Link href="/staff" className="rounded-full border border-luxury-accent/50 px-6 py-2 text-sm font-bold text-luxury-accent hover:bg-luxury-accent hover:text-black">
            Back to Dashboard
          </Link>
        </header>

        {error && <p className="mb-4 rounded-lg bg-red-900/50 p-4 text-red-200">{error}</p>}
        {message && <p className="mb-4 rounded-lg bg-green-900/50 p-4 text-green-200">{message}</p>}

        <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
          <section className="rounded-2xl border border-luxury-accent/20 bg-black/60 p-6 shadow-xl">
            <h2 className="mb-6 text-xl font-serif font-bold text-luxury-accent">{form.id ? 'Edit Shift' : 'Schedule Shift'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm font-semibold">
                Staff Member
                <select 
                  className={inputClass} 
                  value={form.user_id} 
                  onChange={e => setForm({...form, user_id: e.target.value})}
                  required
                >
                  <option value="">Select Staff</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold">
                Role
                <input 
                  className={inputClass} 
                  value={form.role} 
                  onChange={e => setForm({...form, role: e.target.value})} 
                  placeholder="e.g. Server, Chef"
                  required 
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold">
                Start Time
                <input 
                  type="datetime-local" 
                  className={inputClass} 
                  value={form.start_time?.slice(0, 16)} 
                  onChange={e => setForm({...form, start_time: new Date(e.target.value).toISOString()})} 
                  required 
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold">
                End Time
                <input 
                  type="datetime-local" 
                  className={inputClass} 
                  value={form.end_time?.slice(0, 16)} 
                  onChange={e => setForm({...form, end_time: new Date(e.target.value).toISOString()})} 
                  required 
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold">
                Status
                <select 
                  className={inputClass} 
                  value={form.status} 
                  onChange={e => setForm({...form, status: e.target.value as SavannahShift['status']})}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>

              <div className="mt-4 flex gap-2">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 rounded-full bg-luxury-accent py-3 font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : form.id ? 'Update' : 'Schedule'}
                </button>
                {form.id && (
                  <button 
                    type="button" 
                    onClick={() => setForm({user_id: '', role: 'Server', start_time: '', end_time: '', status: 'scheduled'})}
                    className="flex-1 rounded-full border border-white/20 py-3 font-bold hover:bg-white/10"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-luxury-accent/20 bg-black/60 p-6 shadow-xl">
            <h2 className="mb-6 text-xl font-serif font-bold text-luxury-accent">Upcoming Shifts</h2>
            {loading ? (
              <p className="text-white/50">Loading shifts...</p>
            ) : shifts.length === 0 ? (
              <p className="text-white/50">No shifts scheduled.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50">
                      <th className="pb-4 pr-4">Staff</th>
                      <th className="pb-4 pr-4">Role</th>
                      <th className="pb-4 pr-4">Timing</th>
                      <th className="pb-4 pr-4">Status</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {shifts.map(shift => (
                      <tr key={shift.id} className="group hover:bg-white/5">
                        <td className="py-4 pr-4 font-bold">{shift.full_name}</td>
                        <td className="py-4 pr-4 text-white/70">{shift.role}</td>
                        <td className="py-4 pr-4 text-xs">
                          <div className="text-white">{new Date(shift.start_time).toLocaleString()}</div>
                          <div className="text-white/50">to {new Date(shift.end_time).toLocaleString()}</div>
                        </td>
                        <td className="py-4 pr-4 uppercase tracking-tighter">
                          <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                            shift.status === 'completed' ? 'bg-green-900/40 text-green-400' :
                            shift.status === 'cancelled' ? 'bg-red-900/40 text-red-400' :
                            'bg-blue-900/40 text-blue-400'
                          }`}>
                            {shift.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setForm(shift)}
                              className="text-luxury-accent hover:underline"
                            >
                              Edit
                            </button>
                            {profile?.role === 'admin' && (
                              <button 
                                onClick={() => handleDelete(shift.id)}
                                className="text-red-400 hover:underline"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
