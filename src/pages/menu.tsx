import Link from 'next/link';
import Image from 'next/image';
import type { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { fetchAllPublicMenuItems, fetchMenuCategories } from '../lib/menuItems';
import { createPublicSupabaseClient, getSupabase } from '../lib/supabase';
import { VahaAlert, VahaCta, VahaPageHero, VahaPageShell } from '../components/vaha/VahaUI';
import type { DbMenuItem, DbMenuCategory } from '../types/app';

type MenuPageProps = {
  initialItems: DbMenuItem[];
  initialCategories: DbMenuCategory[];
  loadError: string | null;
};

export const getServerSideProps: GetServerSideProps<MenuPageProps> = async () => {
  try {
    const client = createPublicSupabaseClient();
    const [initialItems, initialCategories] = await Promise.all([
      fetchAllPublicMenuItems(client),
      fetchMenuCategories(client),
    ]);
    return {
      props: {
        initialItems,
        initialCategories,
        loadError: initialCategories.length === 0 ? 'Menu could not be loaded. Please refresh.' : null,
      },
    };
  } catch (error) {
    console.error('Menu page SSR load failed:', error);
    return {
      props: {
        initialItems: [],
        initialCategories: [],
        loadError: 'Menu could not be loaded. Please refresh.',
      },
    };
  }
};

export default function Menu({ initialItems, initialCategories, loadError }: MenuPageProps) {
  const [items, setItems] = useState(initialItems);
  const [categories, setCategories] = useState(initialCategories);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(loadError);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setItems(initialItems);
    setCategories(initialCategories);
    setError(loadError);
  }, [initialItems, initialCategories, loadError]);

  useEffect(() => {
    let cancelled = false;

    async function refreshMenu() {
      setRefreshing(true);
      try {
        const [itemsData, categoriesData] = await Promise.all([
          fetchAllPublicMenuItems(),
          fetchMenuCategories(),
        ]);
        if (cancelled) return;
        setItems(itemsData);
        setCategories(categoriesData);
        setError(categoriesData.length === 0 ? 'Menu could not be loaded. Please refresh.' : null);
      } catch {
        if (!cancelled) setError('Menu could not be loaded. Please refresh.');
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    }

    const client = getSupabase();
    const itemsSubscription = client
      .channel('public:savannah_menu_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savannah_menu_items' }, () => {
        void refreshMenu();
      })
      .subscribe();

    const categoriesSubscription = client
      .channel('public:savannah_menu_categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savannah_menu_categories' }, () => {
        void refreshMenu();
      })
      .subscribe();

    return () => {
      cancelled = true;
      void client.removeChannel(itemsSubscription);
      void client.removeChannel(categoriesSubscription);
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

  return (
    <VahaPageShell>
      <VahaPageHero
        eyebrow="Food & Drinks"
        title="Our Menu"
        description="Steaks, burgers, salads, and drinks. Pick a section to see what we serve."
        imageSrc="/images/bbq-p.jpg"
      />

      <section className="vaha-section bg-vaha-ink-soft">
        <div className="vaha-container">
          {error ? (
            <div className="mb-6">
              <VahaAlert tone="error">{error}</VahaAlert>
            </div>
          ) : null}
          {refreshing ? (
            <p className="vaha-eyebrow mb-4" role="status" aria-live="polite">
              Updating menu…
            </p>
          ) : null}

          <div className="mb-6 max-w-xl">
            <label htmlFor="menu-search" className="vaha-eyebrow mb-3 block">
              Search
            </label>
            <input
              id="menu-search"
              type="search"
              placeholder="Search food or drinks…"
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
                      See full menu →
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full border border-white/10 p-12 text-center">
                <p className="vaha-title-sm text-vaha-muted/40">No items found</p>
                <p className="mt-4 text-vaha-muted">
                  {searchQuery ? (
                    <>No dishes match &ldquo;{searchQuery}&rdquo;.</>
                  ) : (
                    <>Menu is empty right now. Please check back soon.</>
                  )}
                </p>
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-vaha-gold hover:underline"
                  >
                    Clear search
                  </button>
                ) : null}
              </div>
            )}
          </div>

          <div className="mt-16 border-t border-white/10 pt-12 text-center">
            <p className="text-sm text-vaha-muted">
              Tell us about food allergies when you book — at least 24 hours ahead if you can.
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
