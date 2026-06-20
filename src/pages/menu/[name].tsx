import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { fetchMenuCategories, fetchPublicMenuItems } from '../../lib/menuItems';
import { useCart } from '../../lib/cart';
import type { DbMenuCategory, MenuItem, MenuSlug } from '../../types/app';
import { supabase } from '../../lib/supabase';

const fieldClass =
  'min-h-11 rounded-lg border border-luxury-accent/50 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:ring-2 focus:ring-luxury-accent';

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
      Promise.all([
        fetchMenuCategories(),
        fetchPublicMenuItems(slug)
      ]).then(([categories, nextItems]) => {
        const found = categories.find(c => c.slug === slug);
        setCategory(found || null);
        setItems(nextItems);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    };

    loadData();

    // Subscribe to changes
    const itemsSubscription = supabase
      .channel(`public:savannah_menu_items:${slug}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savannah_menu_items', filter: `menu_slug=eq.${slug}` }, () => {
        loadData();
      })
      .subscribe();

    const categoriesSubscription = supabase
      .channel(`public:savannah_menu_categories:${slug}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savannah_menu_categories', filter: `slug=eq.${slug}` }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(itemsSubscription);
      supabase.removeChannel(categoriesSubscription);
    };
  }, [slug]);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleAddToCart(event: FormEvent<HTMLFormElement>, item: MenuItem) {
    event.preventDefault();
    if (!category || !slug) return;

    const formData = new FormData(event.currentTarget);
    const quantity = Number(formData.get('quantity')) || 1;
    const service = String(formData.get('service') || 'collection');
    const notes = String(formData.get('notes') || '');

    addItem({
      menuSlug: slug,
      menuTitle: category.title,
      itemName: item.name,
      description: item.description,
      price: item.price,
      quantity,
      service,
      notes,
    });

    setAddedItem(item.name);
  }

  if (!loading && (!category || !slug)) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-black pb-16 pt-8">
        <div className="bg-black/60 rounded-2xl shadow-2xl border border-luxury-accent/30 p-10 flex flex-col items-center max-w-xl w-full">
          <h1 className="text-4xl font-serif font-bold text-luxury-accent mb-4 drop-shadow-lg">Menu Not Found</h1>
          <Link href="/menu" className="luxury-cta mt-6 px-8 py-3 bg-gradient-to-r from-luxury-accent to-yellow-400 text-black rounded-full font-bold text-lg">Back to Menus</Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-black pb-16 pt-8">
        <p className="animate-pulse text-luxury-accent text-2xl font-serif uppercase tracking-widest" role="status" aria-live="polite">Preparing {slug}...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black pb-16 pt-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4">
        <div className="flex flex-col gap-6 rounded-2xl border border-luxury-accent/30 bg-black/80 p-5 shadow-2xl md:p-8">
          <section aria-labelledby="menu-title" className="flex flex-col items-center text-center py-8">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-luxury-accent/80">Savannah Bar & Grill</p>
            <div className="w-16 h-px bg-luxury-accent/40 mb-6"></div>
            <h1 id="menu-title" className="text-5xl md:text-6xl font-serif font-bold text-luxury-accent drop-shadow-lg mb-4">{category?.title}</h1>
            <p className="mt-4 max-w-2xl text-xl text-white/80 leading-relaxed italic">{category?.description}</p>
            <div className="w-16 h-px bg-luxury-accent/40 mt-8 mb-6"></div>
            <Link href="/menu" className="luxury-cta inline-block px-8 py-3 bg-white/5 border border-white/20 text-white rounded-full font-bold text-sm hover:bg-white/10 transition-colors">
              ← Back to All Menus
            </Link>
          </section>
        </div>

        <section aria-labelledby="items-title" className="w-full">
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-luxury-accent/80">Menu listing</p>
              <h2 id="items-title" className="text-3xl font-serif font-bold text-white">Order from {category?.title}</h2>
            </div>
            
            <div className="flex-1 max-w-md relative">
              <label htmlFor="menu-detail-search" className="sr-only">Search in {category?.title}</label>
              <input
                id="menu-detail-search"
                type="search"
                placeholder={`Search in ${category?.title}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 bg-white/5 border border-luxury-accent/30 rounded-full px-6 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-luxury-accent/50 transition-all text-sm"
              />
            </div>

            {items.length > 0 && (
              <div className="flex flex-wrap gap-4">
                <Link href="/cart" className="text-sm font-semibold text-luxury-accent underline underline-offset-4 hover:text-yellow-300">
                  View cart{count > 0 ? ` (${count})` : ''}
                </Link>
                <Link href="/book" className="text-sm font-semibold text-luxury-accent underline underline-offset-4 hover:text-yellow-300">
                  Reserve a table instead
                </Link>
              </div>
            )}
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {filteredItems.map((item) => (
                <article key={item.id || item.name} className="rounded-2xl border border-luxury-accent/25 bg-black/60 p-5 shadow-xl">
                  {item.image_url ? (
                    <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-xl border border-luxury-accent/20">
                      <Image
                        src={item.image_url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        unoptimized={item.image_url.startsWith('http')}
                      />
                    </div>
                  ) : null}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-serif font-semibold text-luxury-accent">{item.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/75">{item.description}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-luxury-accent/40 px-3 py-1 text-sm font-bold text-white">{item.price}</span>
                  </div>

                  <form onSubmit={(event) => handleAddToCart(event, item)} className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[110px_1fr]">
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                      Qty
                      <input className={fieldClass} name="quantity" type="number" min="1" max="20" defaultValue="1" aria-label={`Quantity for ${item.name}`} />
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                      Dining option
                      <select className={fieldClass} name="service" defaultValue="collection" aria-label={`Dining option for ${item.name}`}>
                        <option value="collection">Collection</option>
                        <option value="table">Table order</option>
                        <option value="delivery">Delivery</option>
                      </select>
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-white/70 sm:col-span-2">
                      Notes
                      <input className={fieldClass} name="notes" type="text" placeholder="Allergies, sauces, cooking preference" aria-label={`Notes for ${item.name}`} />
                    </label>

                    <button type="submit" className="luxury-cta sm:col-span-2 min-h-12 rounded-full bg-gradient-to-r from-luxury-accent to-yellow-400 px-6 py-3 text-base font-bold text-black">
                      Add to Cart
                    </button>
                    {addedItem === item.name && (
                      <Link href="/cart" className="sm:col-span-2 text-center text-sm font-semibold text-luxury-accent underline underline-offset-4">
                        Added. Review cart
                      </Link>
                    )}
                  </form>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-luxury-accent/20 bg-black/40 p-20 text-center shadow-xl">
              <span className="text-5xl md:text-6xl font-serif text-white/20 mb-6 italic">0 Items Found</span>
              <p className="text-white/60 max-w-md mb-8">
                {searchQuery ? `We couldn't find any dishes matching "${searchQuery}" in this category.` : "This category is currently empty."}
              </p>
              
              <div className="p-8 border border-luxury-accent/20 bg-white/5 rounded-2xl max-w-lg mb-8">
                <h3 className="text-luxury-accent font-bold uppercase tracking-widest mb-4">Instructions to add items</h3>
                <ol className="text-white/70 text-left list-decimal list-inside space-y-3 text-sm">
                  <li>Navigate to the <Link href="/admin/menu" className="text-luxury-accent underline hover:text-white">Admin Menu Dashboard</Link>.</li>
                  <li>Click on <span className="text-white font-bold">"New Item"</span> and select <span className="text-white font-bold">"{category?.title}"</span> as the category.</li>
                  <li>Ensure <span className="text-white font-bold">"Available on public menu"</span> is checked.</li>
                  <li>The live menu will update instantly across the site.</li>
                </ol>
              </div>

              {searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="text-luxury-accent hover:underline uppercase tracking-widest font-bold text-sm">
                  Clear Search
                </button>
              ) : (
                <Link href="/menu" className="text-luxury-accent hover:underline font-bold uppercase tracking-widest text-sm">
                  Explore Other Menus
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
