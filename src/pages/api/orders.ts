import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { buildReceiptText, formatCurrency, lineTotal, makeDocumentNumber, orderTotal } from '../../lib/orderDocuments';
import { SITE_FROM_EMAIL } from '../../lib/siteContact';
import type { CartItem, CheckoutLocation, CustomerProfile, OrderEmailResult, PlacedOrderResult, SavannahOrder } from '../../types/app';

type OrderRequest = {
  userId?: string | null;
  customer?: Omit<CustomerProfile, 'id'>;
  location?: CheckoutLocation;
  items?: CartItem[];
  subtotal?: number;
  service?: string;
  notes?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Order service is not configured.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getBearerToken(req: NextApiRequest) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return '';
  return header.slice('Bearer '.length);
}

function validateOrder(input: OrderRequest) {
  if (!input.customer?.full_name?.trim()) return 'Customer name is required.';
  if (!input.customer?.phone?.trim()) return 'Phone number is required.';
  if (!input.customer?.address?.trim()) return 'Address is required.';
  if (!Array.isArray(input.items) || input.items.length === 0) return 'Add menu items to your cart first.';
  if (!input.service?.trim()) return 'Service type is required.';
  return '';
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildReceiptHtml(order: SavannahOrder) {
  const customer = (order.customer as unknown) as Omit<CustomerProfile, 'id'>;
  const rows = order.items.map((item) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #eee;">${escapeHtml(item.quantity)}x ${escapeHtml(item.itemName)}<br><span style="color:#666;">${escapeHtml(item.menuTitle)}</span></td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(lineTotal(item))}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5;">
      <h1 style="margin:0 0 8px;color:#9a6b14;">Savannah Bar & Grill</h1>
      <p style="margin:0 0 20px;color:#555;">Your receipt and invoice are below.</p>
      <div style="padding:16px;border:1px solid #e5d4a1;border-radius:8px;background:#fffaf0;">
        <p><strong>Invoice:</strong> ${escapeHtml(order.invoice_number)}</p>
        <p><strong>Receipt:</strong> ${escapeHtml(order.receipt_number)}</p>
        <p><strong>Status:</strong> ${escapeHtml(order.status)}</p>
        <p><strong>Service:</strong> ${escapeHtml(order.service)}</p>
      </div>
      <h2 style="margin-top:24px;">Customer</h2>
      <p>${escapeHtml(customer.full_name)}<br>${escapeHtml(customer.email)}<br>${escapeHtml(customer.phone)}<br>${escapeHtml(customer.address)}</p>
      <h2 style="margin-top:24px;">Items</h2>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
      <p style="font-size:20px;text-align:right;"><strong>Total: ${formatCurrency(orderTotal(order))}</strong></p>
      ${order.notes ? `<p><strong>Notes:</strong> ${escapeHtml(order.notes)}</p>` : ''}
    </div>
  `;
}

async function sendReceiptEmail(order: SavannahOrder): Promise<OrderEmailResult> {
  const customer = (order.customer as unknown) as Omit<CustomerProfile, 'id'>;
  const email = String(customer.email || '').trim();
  if (!email) {
    return { attempted: false, sent: false, message: 'No email address was provided for the receipt.' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || SITE_FROM_EMAIL;

  if (!apiKey) {
    return { attempted: false, sent: false, message: 'Receipt email is queued in the order record, but email delivery is not configured.' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: `Savannah receipt ${order.receipt_number}`,
      html: buildReceiptHtml(order),
      text: buildReceiptText(order),
    }),
  });

  if (!response.ok) {
    return { attempted: true, sent: false, message: 'The order was placed, but the receipt email could not be sent.' };
  }

  return { attempted: true, sent: true, message: 'Receipt and invoice emailed to the customer.' };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<PlacedOrderResult | { error: string }>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const input = req.body as OrderRequest;
  const validationError = validateOrder(input);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  try {
    const admin = getAdminClient();
    let userId = input.userId || null;

    if (userId) {
      const token = getBearerToken(req);
      const { data, error } = token ? await admin.auth.getUser(token) : { data: { user: null }, error: new Error('Missing session.') };
      if (error || data.user?.id !== userId) {
        res.status(401).json({ error: 'Sign in again before placing this order.' });
        return;
      }
    }

    // Verify inventory stock (savannah_menu_items)
    for (const item of input.items || []) {
      let query = admin
        .from('savannah_menu_items')
        .select('id, stock_quantity, name, menu_slug')
        .eq('name', item.itemName)
        .eq('is_available', true);

      if (item.menuSlug) {
        query = query.eq('menu_slug', item.menuSlug);
      }

      const { data: menuData, error: menuError } = await query.limit(1).maybeSingle();

      if (!menuError && menuData && menuData.stock_quantity !== null) {
        if (menuData.stock_quantity < item.quantity) {
          res.status(400).json({ error: `Insufficient stock for ${item.itemName}. Only ${menuData.stock_quantity} remaining.` });
          return;
        }
      }
    }

    const payload = {
      user_id: userId,
      invoice_number: makeDocumentNumber('INV'),
      receipt_number: makeDocumentNumber('RCT'),
      customer: input.customer,
      location: input.location || { consented: false },
      items: input.items || [],
      subtotal: Number(input.subtotal || 0),
      service: input.service,
      notes: input.notes || '',
      status: 'pending',
      delivery_address: input.service === 'delivery' ? input.customer?.address : null,
      delivery_status: input.service === 'delivery' ? 'pending' : null,
    };

    const { data, error } = await admin
      .from('savannah_orders')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;

    const order = data as SavannahOrder;

    // Decrement stock on savannah_menu_items
    for (const item of input.items || []) {
      let query = admin
        .from('savannah_menu_items')
        .select('id, stock_quantity')
        .eq('name', item.itemName);

      if (item.menuSlug) {
        query = query.eq('menu_slug', item.menuSlug);
      }

      const { data: menuData } = await query.limit(1).maybeSingle();

      if (menuData && menuData.stock_quantity !== null) {
        await admin
          .from('savannah_menu_items')
          .update({ stock_quantity: Math.max(0, menuData.stock_quantity - item.quantity) })
          .eq('id', menuData.id);
      }
    }

    const email = await sendReceiptEmail(order);

    if (userId) {
      await admin.from('notifications').insert({
        user_id: userId,
        title: 'Order Placed',
        message: `Order ${order.receipt_number} received for ${order.service}.`,
        type: 'success',
      });
    }

    await admin.from('notifications').insert({
      user_id: null,
      title: 'New Order Placed',
      message: `Order ${order.receipt_number} received for ${order.service}.`,
      type: 'info',
    });

    res.status(200).json({ order, email });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Could not place order.' });
  }
}
