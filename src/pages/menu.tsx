import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchAllPublicMenuItems, fetchMenuCategories } from '../lib/menuItems';
import { VahaCta, VahaPageHero, VahaPageShell } from '../components/vaha/VahaUI';
import type { DbMenuItem, DbMenuCategory } from '../types/app';
import { supabase } from '../lib/supabase';

export default function Menu() {
  const [items, setItems] = useState<DbMenuItem[]>([]);
  const [categories, setCategories] = useState<DbMenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = () => {
      Promise.all([fetchAllPublicMenuItems(), fetchMenuCategories()])
        .then(([itemsData, categoriesData]) => {
          setItems(itemsData);
          setCategories(categoriesData);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    loadData();

    const itemsSubscription = supabase
      .channel('public:savannah_menu_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savannah_menu_items' }, loadData)
      .subscribe();

    const categoriesSubscription = supabase
      .channel('public:savannah_menu_categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savannah_menu_categories' }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(itemsSubscription);
      supabase.removeChannel(categoriesSubscription);
    };
  }, []);

  const categorizedData = categories
    .map((category) => {
      const categoryItems = items.filter((item) => item.menu_slug === category.slug);
      const filteredItems = categoryItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...category, items: filteredItems, totalInCategory: categoryItems.length };
    })
    .filter((category) => {
      if (searchQuery) {
        return category.items.length > 0 || category.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });

  if (loading) {
    return (
      <VahaPageShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="vaha-eyebrow" role="status" aria-live="polite">Loading menu library…</p>
        </div>
      </VahaPageShell>
    );
  }

  return (
    <VahaPageShell>
      <VahaPageHero
        eyebrow="Dining Menu"
        title="Our Menu Library"
        description="Modern dishes inspired by wood-fire gastronomy. Every category is curated for pure food indulgence."
        imageSrc="/images/bbq-p.jpg"
      />

      <section className="vaha-section bg-vaha-ink-soft">
        <div className="vaha-container">
          <div className="mx-auto mb-12 max-w-xl">
            <label htmlFor="menu-search" className="vaha-eyebrow mb-3 block">
              Search
            </label>
            <input
              id="menu-search"
              type="search"
              placeholder="Search dishes or categories…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-white/15 bg-vaha-ink px-4 py-3 text-vaha-cream placeholder:text-vaha-muted/50 focus:border-vaha-gold focus:outline-none focus:ring-1 focus:ring-vaha-gold"
            />
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {categorizedData.length > 0 ? (
              categorizedData.map((category) => (
                <Link
                  key={category.slug}
                  href={`/menu/${category.slug}`}
                  aria-label={`View ${category.title} menu`}
                  className="group border border-white/10 bg-vaha-ink transition-colors hover:border-vaha-gold/40"
                >
                  {category.image_url ? (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={category.image_url}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        unoptimized={category.image_url.endsWith('.svg')}
                      />
                    </div>
                  ) : null}
                  <div className="p-6">
                    <p className="vaha-eyebrow">{category.slug.replace(/-/g, ' ')}</p>
                    <h2 className="mt-2 font-serif text-2xl text-vaha-cream">{category.title}</h2>
                    <p className="mt-3 line-clamp-2 text-sm text-vaha-muted">{category.description}</p>
                    {category.items.length > 0 ? (
                      <ul className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm text-vaha-muted">
                        {category.items.slice(0, 3).map((item) => (
                          <li key={item.id} className="flex justify-between gap-2">
                            <span>{item.name}</span>
                            <span className="shrink-0 text-vaha-gold">{item.price}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-5 text-sm italic text-vaha-muted/60">Coming soon</p>
                    )}
                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-vaha-gold group-hover:text-vaha-cream">
                      View Full Menu →
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full border border-white/10 p-12 text-center">
                <p className="vaha-title-sm text-vaha-muted/40">No items found</p>
                <p className="mt-4 text-vaha-muted">No dishes match &ldquo;{searchQuery}&rdquo;.</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-vaha-gold hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          <div className="mt-16 border-t border-white/10 pt-12 text-center">
            <p className="text-sm text-vaha-muted">
              We cater to dietary restrictions — contact us at least 24 hours before your booking.
            </p>
            <div className="mt-6">
              <VahaCta href="/book">Book a Table</VahaCta>
            </div>
          </div>
        </div>
      </section>
    </VahaPageShell>
  );
}
