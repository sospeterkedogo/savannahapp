import type { CartItem, SavannahOrder } from '../types/app';

export function parsePrice(price: string) {
  const parsed = Number(String(price).replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function lineTotal(item: CartItem) {
  return parsePrice(item.price) * item.quantity;
}

export function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

export function orderTotal(order: Pick<SavannahOrder, 'items' | 'subtotal'>) {
  const subtotal = Number(order.subtotal);
  if (Number.isFinite(subtotal) && subtotal > 0) return subtotal;
  return order.items.reduce((sum, item) => sum + lineTotal(item), 0);
}

export function makeDocumentNumber(prefix: 'INV' | 'RCT') {
  const excluded = new Set(['-', ':', '.', 'T', 'Z']);
  const stamp = Array.from(new Date().toISOString())
    .filter((char) => !excluded.has(char))
    .join('')
    .slice(0, 14);
  return `${prefix}-${stamp}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export function orderLinesText(order: SavannahOrder) {
  return order.items
    .map((item) => `${item.quantity}x ${item.itemName} (${item.menuTitle}) - ${formatCurrency(lineTotal(item))}`)
    .join('\n');
}

export function buildReceiptText(order: SavannahOrder) {
  return [
    'Savannah Bar & Grill',
    `Invoice: ${order.invoice_number}`,
    `Receipt: ${order.receipt_number}`,
    `Status: ${order.status}`,
    `Service: ${order.service}`,
    '',
    'Items',
    orderLinesText(order),
    '',
    `Total: ${formatCurrency(orderTotal(order))}`,
    order.notes ? `Notes: ${order.notes}` : '',
  ].filter(Boolean).join('\n');
}
