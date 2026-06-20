import { supabase } from './supabase';
import type { SavannahEvent } from '../types/app';

export const getEvents = async (): Promise<SavannahEvent[]> => {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('savannah_events')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return data || [];
};

export const getTeaserEvents = async (limit = 3): Promise<SavannahEvent[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('savannah_events')
    .select('*')
    .order('date', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching teaser events:', error);
    return [];
  }

  return data || [];
};

export const createEvent = async (event: Omit<SavannahEvent, 'id' | 'created_at' | 'updated_at'>) => {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('savannah_events')
    .insert([event])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateEvent = async (id: string, event: Partial<SavannahEvent>) => {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('savannah_events')
    .update(event)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteEvent = async (id: string) => {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { error } = await supabase
    .from('savannah_events')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
