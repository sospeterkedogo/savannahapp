import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { fetchMenuCategories, fetchPublicMenuItems } from '../../lib/menuItems';
import { useCart } from '../../lib/cart';
import { VahaCta, VahaPageHero, VahaPageShell } from '../../components/vaha/VahaUI';
import type { DbMenuCategory, MenuItem, MenuSlug } from '../../types/app';
import { supabase } from '../../lib/supabase';

const fieldClass =
  'min-h-11 border border-white/15 bg-vaha-ink px-3 py-2 text-sm text-vaha-cream placeholder:text-vaha-muted/50 focus:border-vaha-gold focus:outline-none focus:ring-1 focus:ring-vaha-gold';

export default function MenuDetail() {
  const router = useRouter();
  const { name } = router.query;
  const slug = (Array.isArray(name) ? name[0] : name) as string;
  const [category, setCategory] = useState<DbMenuCategory | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedItem, setAddedItem] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { addItem, count } = useCart();

  useEffect(() => {
    if (!slug) return;

    const loadData = () => {
      setLoading(true);
      Promise.all([fetchMenuCategories(), fetchPublicMenuItems(slug)])
        .then(([categories, nextItems]) => {
          setCategory(categories.find((c) => c.slug === slug) || null);
          setItems(nextItems);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    loadData();

    const itemsSubscription = supabase
      .channel(`public:savannah_menu_items:${slug}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savannah_menu_items', filter: `menu_slug=eq.${slug}` }, loadData)
      .subscribe();

    const categoriesSubscription = supabase
      .channel(`public:savannah_menu_categories:${slug}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savannah_menu_categories', filter: `slug=eq.${slug}` }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(itemsSubscription);
      supabase.removeChannel(categoriesSubscription);
    };
  }, [slug]);

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleAddToCart(event: FormEvent<HTMLFormElement>, item: MenuItem) {
    event.preventDefault();
    if (!category || !slug) return;

    const formData = new FormData(event.currentTarget);
    addItem({
      menuSlug: slug,
      menuTitle: category.title,
      itemName: item.name,
      description: item.description,
      price: item.price,
      quantity: Number(formData.get('quantity')) || 1,
      service: String(formData.get('service') || 'collection'),
      notes: String(formData.get('notes') || ''),
    });
    setAddedItem(item.name);
  }

  if (loading) {
    return (
      <VahaPageShell>
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="vaha-eyebrow" role="status" aria-live="polite">Loading menu…</p>
        </div>
      </VahaPageShell>
    );
  }

  if (!category || !slug) {
    return (
      <VahaPageShell>
        <div className="vaha-section text-center">
          <h1 className="vaha-title-sm">Menu Not Found</h1>
          <div className="mt-8"><VahaCta href="/menu">Back to Menu</VahaCta></div>
        </div>
      </VahaPageShell>
    );
  }

  return (
    <VahaPageShell>
      <VahaPageHero
        eyebrow="Menu"
        title={category.title}
        description={category.description}
        imageSrc={category.image_url || '/images/bbq-p.jpg'}
      />

      <section className="vaha-section bg-vaha-ink-soft" aria-labelledby="items-title">
        <div className="vaha-container">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="vaha-eyebrow">Order Online</p>
              <h2 id="items-title" className="vaha-title-sm mt-2">Order from {category.title}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label htmlFor="menu-detail-search" className="sr-only">Search in {category.title}</label>
              <input
                id="menu-detail-search"
                type="search"
                placeholder={`Search in ${category.title}…`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-xs border border-white/15 bg-vaha-ink px-4 py-2 text-sm text-vaha-cream focus:border-vaha-gold focus:outline-none"
              />
              {items.length > 0 ? (
                <>
                  <Link href="/cart" className="text-xs font-semibold uppercase tracking-widest text-vaha-gold hover:underline">
                    Cart{count > 0 ? ` (${count})` : ''}
                  </Link>
                  <Link href="/book" className="text-xs font-semibold uppercase tracking-widest text-vaha-muted hover:text-vaha-gold">
                    Book a table instead
                  </Link>
                </>
              ) : null}
            </div>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {filteredItems.map((item) => (
                <article key={item.id || item.name} className="border border-white/10 bg-vaha-ink p-5">
                  {item.image_url ? (
                    <div className="relative mb-4 aspect-[16/10] overflow-hidden">
                      <Image src={item.image_url} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" unoptimized={item.image_url.startsWith('http')} />
                    </div>
                  ) : null}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl text-vaha-cream">{item.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-vaha-muted">{item.description}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-vaha-gold">{item.price}</span>
                  </div>
                  <form onSubmit={(event) => handleAddToCart(event, item)} className="mt-5 grid gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-vaha-muted">
                      Qty
                      <input className={fieldClass} name="quantity" type="number" min="1" max="20" defaultValue="1" aria-label={`Quantity for ${item.name}`} />
                    </label>
                    <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-vaha-muted">
                      Service
                      <select className={fieldClass} name="service" defaultValue="collection" aria-label={`Service for ${item.name}`}>
                        <option value="collection">Collection</option>
                        <option value="table">Table order</option>
                        <option value="delivery">Delivery</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-vaha-muted sm:col-span-2">
                      Notes
                      <input className={fieldClass} name="notes" type="text" placeholder="Allergies, preferences" aria-label={`Notes for ${item.name}`} />
                    </label>
                    <button type="submit" className="sm:col-span-2 border border-vaha-gold bg-vaha-gold py-3 text-xs font-semibold uppercase tracking-[0.3em] text-vaha-ink hover:bg-white hover:border-white">
                      Add to Cart
                    </button>
                    {addedItem === item.name ? (
                      <Link href="/cart" className="sm:col-span-2 text-center text-xs uppercase tracking-widest text-vaha-gold underline">
                        Added — view cart
                      </Link>
                    ) : null}
                  </form>
                </article>
              ))}
            </div>
          ) : (
            <div className="border border-white/10 p-12 text-center">
              <p className="font-serif text-2xl italic text-vaha-muted/40">No items found</p>
              <p className="mt-4 text-sm text-vaha-muted">
                {searchQuery ? `No match for "${searchQuery}".` : 'This category is empty.'}
              </p>
              <div className="mt-8 flex justify-center gap-4">
                {searchQuery ? (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-xs uppercase tracking-widest text-vaha-gold hover:underline">
                    Clear search
                  </button>
                ) : (
                  <VahaCta href="/menu">Other Menus</VahaCta>
                )}
              </div>
            </div>
          )}

          <div className="mt-12 text-center">
            <VahaCta href="/menu">← Back to Menu</VahaCta>
          </div>
        </div>
      </section>
    </VahaPageShell>
  );
}
