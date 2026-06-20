import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { makeDocumentNumber } from '../../lib/orderDocuments';
import type { SavannahBooking } from '../../types/app';

type BookingRequest = {
  userId?: string | null;
  fullName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Booking service is not configured.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildBookingReceiptHtml(booking: SavannahBooking) {
  return `
    <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5;">
      <h1 style="margin:0 0 8px;color:#9a6b14;">Savannah Bar & Grill</h1>
      <p style="margin:0 0 20px;color:#555;">Your table reservation details are below.</p>
      <div style="padding:16px;border:1px solid #e5d4a1;border-radius:8px;background:#fffaf0;">
        <p><strong>Invoice/Ref:</strong> ${escapeHtml(booking.invoice_number)}</p>
        <p><strong>Receipt:</strong> ${escapeHtml(booking.receipt_number)}</p>
        <p><strong>Status:</strong> ${escapeHtml(booking.status)}</p>
      </div>
      <h2 style="margin-top:24px;">Reservation Details</h2>
      <p>
        <strong>Date:</strong> ${escapeHtml(booking.booking_date)}<br>
        <strong>Time:</strong> ${escapeHtml(booking.booking_time)}<br>
        <strong>Guests:</strong> ${escapeHtml(booking.guests_count)}
      </p>
      <h2 style="margin-top:24px;">Customer</h2>
      <p>${escapeHtml(booking.full_name)}<br>${escapeHtml(booking.email)}<br>${escapeHtml(booking.phone)}</p>
      ${booking.notes ? `<p><strong>Notes:</strong> ${escapeHtml(booking.notes)}</p>` : ''}
    </div>
  `;
}

async function sendBookingConfirmationEmail(booking: SavannahBooking) {
  const email = String(booking.email || '').trim();
  if (!email) return;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'Savannah Bar & Grill <onboarding@resend.dev>';

  if (!apiKey) return;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: `Savannah Booking Confirmation ${booking.receipt_number}`,
      html: buildBookingReceiptHtml(booking),
    }),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Check availability for a specific date/time
    const { date, time } = req.query;
    if (!date || !time) {
      return res.status(400).json({ error: 'Date and time are required to check availability.' });
    }

    try {
      const admin = getAdminClient();
      const { data, error } = await admin
        .from('savannah_bookings')
        .select('guests_count')
        .eq('booking_date', date)
        .eq('booking_time', time)
        .neq('status', 'cancelled');

      if (error) throw error;
      
      const currentGuests = data.reduce((sum, b) => sum + b.guests_count, 0);
      const MAX_CAPACITY = 50; 
      
      return res.status(200).json({ 
        available: currentGuests < MAX_CAPACITY,
        remainingCapacity: MAX_CAPACITY - currentGuests 
      });
    } catch (error) {
      return res.status(500).json({ error: 'Could not check availability.' });
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET');
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const input = req.body as BookingRequest;
  if (!input.fullName || !input.email || !input.phone || !input.date || !input.time || !input.guests) {
    return res.status(400).json({ error: 'Missing required booking fields.' });
  }

  try {
    const admin = getAdminClient();

    // Re-check availability
    const { data: availData } = await admin
      .from('savannah_bookings')
      .select('guests_count')
      .eq('booking_date', input.date)
      .eq('booking_time', input.time)
      .neq('status', 'cancelled');
    
    const currentGuests = (availData || []).reduce((sum, b) => sum + b.guests_count, 0);
    const MAX_CAPACITY = 50;
    if (currentGuests + input.guests > MAX_CAPACITY) {
      return res.status(400).json({ error: 'Sorry, we are fully booked for this time slot.' });
    }

    const payload = {
      user_id: input.userId || null,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      booking_date: input.date,
      booking_time: input.time,
      guests_count: input.guests,
      notes: input.notes || '',
      status: 'pending',
      invoice_number: makeDocumentNumber('INV'),
      receipt_number: makeDocumentNumber('RCT'),
    };

    const { data, error } = await admin
      .from('savannah_bookings')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;

    const booking = data as SavannahBooking;

    await sendBookingConfirmationEmail(booking);

    // Notify user in their inbox
    if (input.userId) {
      await admin.from('notifications').insert({
        user_id: input.userId,
        title: 'Booking Confirmed',
        message: `Your table for ${booking.guests_count} on ${booking.booking_date} at ${booking.booking_time} is confirmed. Ref: ${booking.receipt_number}`,
        type: 'success'
      });
    }

    // Notify staff
    await admin.from('notifications').insert({
      user_id: null, // General notification or to admin
      title: 'New Booking',
      message: `${booking.full_name} booked a table for ${booking.guests_count} on ${booking.booking_date} at ${booking.booking_time}.`,
      type: 'info'
    });

    res.status(200).json({ booking });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Could not place booking.' });
  }
}
