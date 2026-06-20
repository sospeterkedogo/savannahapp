import { supabase } from './supabase';
import type { CartItem, CheckoutLocation, CustomerProfile, PlacedOrderResult, SavannahOrder } from '../types/app';
import { makeDocumentNumber } from './orderDocuments';

export function makeMapsLink(latitude: number, longitude: number) {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export async function upsertCustomerProfile(profile: CustomerProfile) {
  const { error } = await supabase.from('savannah_customer_profiles').upsert(profile, { onConflict: 'id' });
  if (error) throw error;
}

export async function fetchCustomerProfile(userId: string) {
  const { data, error } = await supabase
    .from('savannah_customer_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as CustomerProfile | null;
}

async function submitOrder(input: {
  userId?: string | null;
  customer: Omit<CustomerProfile, 'id'>;
  location: CheckoutLocation;
  items: CartItem[];
  subtotal: number;
  service: string;
  notes: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify(input),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(typeof result?.error === 'string' ? result.error : 'Could not place order.');
  }

  return result as PlacedOrderResult;
}

export async function createOrder(input: {
  userId: string;
  customer: Omit<CustomerProfile, 'id'>;
  location: CheckoutLocation;
  items: CartItem[];
  subtotal: number;
  service: string;
  notes: string;
}) {
  return submitOrder(input);
}

export async function createGuestOrder(input: {
  customer: Omit<CustomerProfile, 'id'>;
  location: CheckoutLocation;
  items: CartItem[];
  subtotal: number;
  service: string;
  notes: string;
}) {
  return submitOrder({ ...input, userId: null });
}

export async function fetchCustomerOrders(userId: string) {
  const { data, error } = await supabase
    .from('savannah_orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as SavannahOrder[];
}

export async function fetchStaffOrders() {
  const { data, error } = await supabase
    .from('savannah_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as SavannahOrder[];
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { error } = await supabase
    .from('savannah_orders')
    .update({ status })
    .eq('id', orderId);

  if (error) throw error;
}

export async function updateOrderDelivery(orderId: string, payload: { delivery_status?: string; assigned_driver_id?: string }) {
  const { error } = await supabase
    .from('savannah_orders')
    .update(payload)
    .eq('id', orderId);

  if (error) throw error;
}
