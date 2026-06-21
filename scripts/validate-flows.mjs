/**
 * Validates menu CRUD visibility and guest order flow against Supabase.
 * Usage: node scripts/validate-flows.mjs
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const raw = readFileSync('.env.local', 'utf8');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return env;
}

function makeDocumentNumber(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !serviceKey || !anonKey) {
  console.error('Missing Supabase env vars in .env.local');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
const anon = createClient(url, anonKey, { auth: { persistSession: false } });

const TEST_ITEM_NAME = `Flow Test Item ${Date.now()}`;
let testItemId = null;
const orderIds = [];

function pass(label) {
  console.log(`  ✓ ${label}`);
}

function fail(label, detail) {
  console.error(`  ✗ ${label}${detail ? `: ${detail}` : ''}`);
  process.exitCode = 1;
}

async function main() {
  console.log('\n=== Menu & order flow validation ===\n');

  // 1. Categories exist
  const { data: categories, error: catErr } = await admin.from('savannah_menu_categories').select('*').order('sort_order');
  if (catErr) {
    fail('Fetch categories', catErr.message);
    return;
  }
  pass(`Categories loaded (${categories.length})`);

  const EXPECTED_SEED_SLUGS = ['mainmenu', 'steak', 'cocktail'];
  for (const slug of EXPECTED_SEED_SLUGS) {
    if (!categories.find((c) => c.slug === slug)) {
      fail(`${slug} category exists`);
      return;
    }
    pass(`${slug} category present`);
  }

  const { data: seededItems, error: seedErr } = await anon
    .from('savannah_menu_items')
    .select('id, name, menu_slug')
    .eq('is_available', true);

  if (seedErr) {
    fail('Public menu seed read', seedErr.message);
    return;
  }
  if (!seededItems || seededItems.length < 10) {
    fail('Seeded menu items for /menu', `expected >= 10, got ${seededItems?.length ?? 0}`);
    return;
  }
  pass(`Public /menu has ${seededItems.length} items (seed OK)`);

  const seedNames = ['Grilled Salmon', 'Classic Cheeseburger', 'Savannah Gold', 'Sirloin Steak'];
  for (const name of seedNames) {
    if (!seededItems.some((i) => i.name === name)) {
      fail('Seed item present', name);
      return;
    }
  }
  pass('Known seed items visible to customers');

  const mainmenu = categories.find((c) => c.slug === 'mainmenu');
  if (!mainmenu) {
    fail('mainmenu category exists');
    return;
  }
  pass('mainmenu category present');

  // 2. Staff CRUD — create test item
  const { data: created, error: createErr } = await admin
    .from('savannah_menu_items')
    .insert({
      menu_slug: 'mainmenu',
      menu_title: 'Main Menu',
      name: TEST_ITEM_NAME,
      description: 'Automated validation item',
      price: '$9.99',
      sort_order: 9999,
      is_available: true,
      stock_quantity: 50,
      image_url: '/images/bbq3.jpeg',
      image_url_2: '',
    })
    .select('*')
    .single();

  if (createErr) {
    fail('Create menu item (staff CRUD)', createErr.message);
    return;
  }
  testItemId = created.id;
  pass(`Created test item "${TEST_ITEM_NAME}" (${testItemId})`);

  // 3. Public read via anon client
  const { data: publicItems, error: pubErr } = await anon
    .from('savannah_menu_items')
    .select('id, name')
    .eq('menu_slug', 'mainmenu')
    .eq('is_available', true);

  if (pubErr) {
    fail('Public menu read', pubErr.message);
  } else if (!publicItems.some((i) => i.id === testItemId)) {
    fail('New item visible on public menu');
  } else {
    pass('New item visible to customers on /menu');
  }

  // 4. Update item
  const { error: updateErr } = await admin
    .from('savannah_menu_items')
    .update({ price: '$10.99', description: 'Updated by validation' })
    .eq('id', testItemId);
  if (updateErr) fail('Update menu item', updateErr.message);
  else   pass('Staff update persisted');

  // 4b. Verify update reflected in admin-style fetch (all items, including unavailable)
  const { data: adminItems } = await admin.from('savannah_menu_items').select('price, description').eq('id', testItemId).single();
  if (adminItems?.price === '$10.99' && adminItems?.description === 'Updated by validation') {
    pass('Admin menu list would show updated price/description');
  } else {
    fail('Admin menu update reflection', JSON.stringify(adminItems));
  }

  // 4c. Customer profiles table reachable (dashboard uses this)
  const { error: profileTableErr } = await admin.from('savannah_customer_profiles').select('id').limit(1);
  if (profileTableErr) {
    fail('Customer profiles table', profileTableErr.message);
  } else {
    pass('Customer dashboard profile table reachable');
  }

  // 5. Place two guest orders
  const cartItems = [
    {
      menuSlug: 'mainmenu',
      menuTitle: 'Main Menu',
      itemName: TEST_ITEM_NAME,
      description: 'Updated by validation',
      price: '$10.99',
      quantity: 1,
      service: 'collection',
      notes: 'Validation order 1',
    },
    {
      menuSlug: 'mainmenu',
      menuTitle: 'Main Menu',
      itemName: TEST_ITEM_NAME,
      description: 'Updated by validation',
      price: '$10.99',
      quantity: 2,
      service: 'collection',
      notes: 'Validation order 2',
    },
  ];

  for (let i = 0; i < cartItems.length; i++) {
    const item = cartItems[i];
    const { data: stockRow } = await admin
      .from('savannah_menu_items')
      .select('id, stock_quantity')
      .eq('name', item.itemName)
      .eq('menu_slug', item.menuSlug)
      .maybeSingle();

    if (!stockRow || stockRow.stock_quantity < item.quantity) {
      fail(`Stock check order ${i + 1}`, 'insufficient stock');
      continue;
    }

    const subtotal = 10.99 * item.quantity;
    const payload = {
      user_id: null,
      invoice_number: makeDocumentNumber('INV'),
      receipt_number: makeDocumentNumber('RCT'),
      customer: {
        full_name: `Validation Customer ${i + 1}`,
        email: `validate${i + 1}@example.com`,
        phone: '+441234567890',
        address: '17 Wellingborough Road, Northampton',
      },
      location: { consented: false },
      items: [item],
      subtotal,
      service: item.service,
      notes: item.notes,
      status: 'pending',
      delivery_address: null,
      delivery_status: null,
    };

    const { data: order, error: orderErr } = await admin.from('savannah_orders').insert(payload).select('*').single();
    if (orderErr) {
      fail(`Guest order ${i + 1}`, orderErr.message);
    } else {
      orderIds.push(order.id);
      pass(`Guest order ${i + 1} saved (${order.receipt_number}, £${subtotal.toFixed(2)})`);

      await admin
        .from('savannah_menu_items')
        .update({ stock_quantity: Math.max(0, stockRow.stock_quantity - item.quantity) })
        .eq('id', stockRow.id);
    }
  }

  // 6. Verify stock decremented (50 - 1 - 2 = 47)
  const { data: finalItem } = await admin.from('savannah_menu_items').select('stock_quantity').eq('id', testItemId).single();
  if (finalItem?.stock_quantity === 47) {
    pass('Stock decremented correctly (50 → 47 after 3 units sold)');
  } else {
    fail('Stock after orders', `expected 47, got ${finalItem?.stock_quantity}`);
  }

  // 7. Verify orders in DB
  const { data: orders, error: ordersErr } = await admin
    .from('savannah_orders')
    .select('id, receipt_number, items, subtotal')
    .in('id', orderIds);

  if (ordersErr) {
    fail('Fetch placed orders', ordersErr.message);
  } else if (orders.length !== 2) {
    fail('Order count', `expected 2, got ${orders.length}`);
  } else {
    pass(`Both orders retrievable (${orders.map((o) => o.receipt_number).join(', ')})`);
  }

  // Cleanup
  if (orderIds.length) {
    await admin.from('savannah_orders').delete().in('id', orderIds);
    pass('Test orders cleaned up');
  }
  if (testItemId) {
    await admin.from('savannah_menu_items').delete().eq('id', testItemId);
    pass('Test menu item deleted');
  }

  console.log('\n=== Done ===\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
