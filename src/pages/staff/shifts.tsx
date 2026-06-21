import { FormEvent, useEffect, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useAuthGuard } from '../../lib/useAuthGuard';
import {
  fetchShifts,
  createShift,
  updateShift,
  deleteShift,
  fetchStaffProfiles,
} from '../../lib/shifts';
import type { SavannahShift, ShiftInput } from '../../types/app';
import { StaffAccessDenied, StaffLoading, StaffPageHeader, StaffShell } from '../../components/staff/StaffLayout';
import { VahaAlert, VahaButton, VahaPanel, vahaInputClass } from '../../components/vaha/VahaUI';

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

type StaffProfileShort = {
  id: string;
  full_name: string;
  role: string;
};

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
    } catch {
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
        setMessage('Shift updated.');
      } else {
        await createShift(input);
        setMessage('Shift scheduled.');
      }
      setForm({ user_id: '', role: 'Server', start_time: '', end_time: '', status: 'scheduled' });
      await loadData();
    } catch {
      setError('Failed to save shift.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this shift?')) return;
    try {
      await deleteShift(id);
      setMessage('Shift deleted.');
      await loadData();
    } catch {
      setError('Failed to delete shift.');
    }
  }

  if (authLoading) return <StaffLoading />;

  if (!allowed) return <StaffAccessDenied showLogin={false} />;

  return (
    <StaffShell>
      <div className="vaha-container flex flex-col gap-4 py-6">
        <StaffPageHeader
          eyebrow="Operations"
          title="Staff Shifts"
          actions={
            <Link href="/staff" className="text-xs uppercase tracking-widest text-vaha-gold hover:underline">
              Back to Dashboard
            </Link>
          }
        />

        {error ? <VahaAlert tone="error">{error}</VahaAlert> : null}
        {message ? <VahaAlert tone="success">{message}</VahaAlert> : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_1fr]">
          <VahaPanel title={form.id ? 'Edit Shift' : 'Schedule Shift'}>
            <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
              <select className={vahaInputClass} value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} required aria-label="Staff member">
                <option value="">Select staff</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>
                ))}
              </select>
              <input className={vahaInputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role" required aria-label="Role" />
              <input type="datetime-local" className={vahaInputClass} value={form.start_time?.slice(0, 16)} onChange={(e) => setForm({ ...form, start_time: new Date(e.target.value).toISOString() })} required aria-label="Start time" />
              <input type="datetime-local" className={vahaInputClass} value={form.end_time?.slice(0, 16)} onChange={(e) => setForm({ ...form, end_time: new Date(e.target.value).toISOString() })} required aria-label="End time" />
              <select className={vahaInputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as SavannahShift['status'] })} aria-label="Status">
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="flex gap-2">
                <VahaButton type="submit" variant="solid" disabled={saving} className="flex-1">
                  {saving ? 'Saving…' : form.id ? 'Update' : 'Schedule'}
                </VahaButton>
                {form.id ? (
                  <VahaButton type="button" variant="outline" onClick={() => setForm({ user_id: '', role: 'Server', start_time: '', end_time: '', status: 'scheduled' })}>
                    Cancel
                  </VahaButton>
                ) : null}
              </div>
            </form>
          </VahaPanel>

          <VahaPanel title="Upcoming Shifts">
            {loading ? (
              <p className="mt-4 text-vaha-muted">Loading…</p>
            ) : shifts.length === 0 ? (
              <p className="mt-4 text-vaha-muted">No shifts scheduled.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-vaha-muted">
                      <th className="pb-3 pr-3">Staff</th>
                      <th className="pb-3 pr-3">Role</th>
                      <th className="pb-3 pr-3">Timing</th>
                      <th className="pb-3 pr-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {shifts.map((shift) => (
                      <tr key={shift.id}>
                        <td className="py-3 pr-3 font-semibold">{shift.full_name}</td>
                        <td className="py-3 pr-3 text-vaha-muted">{shift.role}</td>
                        <td className="py-3 pr-3 text-xs">
                          <div>{new Date(shift.start_time).toLocaleString()}</div>
                          <div className="text-vaha-muted">to {new Date(shift.end_time).toLocaleString()}</div>
                        </td>
                        <td className="py-3 pr-3 text-[10px] uppercase tracking-widest">{shift.status}</td>
                        <td className="py-3 text-right">
                          <button type="button" onClick={() => setForm(shift)} className="mr-3 text-vaha-gold hover:underline">Edit</button>
                          {profile?.role === 'admin' ? (
                            <button type="button" onClick={() => handleDelete(shift.id)} className="text-red-400 hover:underline">Delete</button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </VahaPanel>
        </div>
      </div>
    </StaffShell>
  );
}
