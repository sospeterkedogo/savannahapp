import { supabase } from './supabase';
import type { SavannahShift, ShiftInput } from '../types/app';

export async function fetchShifts() {
  const { data, error } = await supabase
    .from('savannah_shifts')
    .select(`
      *,
      profiles (
        full_name
      )
    `)
    .order('start_time', { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => {
    const profiles = row.profiles as { full_name: string } | null;
    return {
      ...row,
      full_name: profiles?.full_name || 'Unknown Staff',
    };
  }) as SavannahShift[];
}

export async function createShift(input: ShiftInput) {
  const { error } = await supabase.from('savannah_shifts').insert(input);
  if (error) throw error;
}

export async function updateShift(id: string, input: Partial<ShiftInput>) {
  const { error } = await supabase.from('savannah_shifts').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteShift(id: string) {
  const { error } = await supabase.from('savannah_shifts').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchStaffProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('role', ['admin', 'employee'])
    .order('full_name', { ascending: true });

  if (error) throw error;
  return data || [];
}
