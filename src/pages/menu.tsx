import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchAllPublicMenuItems, fetchMenuCategories } from '../lib/menuItems';
import type { DbMenuItem, DbMenuCategory } from '../types/app';
import { supabase } from '../lib/supabase';

const DESIGNS = [
  {
    container: "border-2 border-luxury-accent/40 bg-black/40 p-8 flex flex-col items-center text-center",
    title: "text-3xl font-serif text-luxury-accent mb-6 border-b border-luxury-accent/30 pb-2 w-full",
    item: "flex flex-col mb-4 w-full",
    itemName: "text-lg font-serif text-white",
    itemDesc: "text-xs text-white/60 italic",
    itemPrice: "text-sm font-bold text-luxury-accent mt-1"
  },
  {
    container: "border border-luxury-accent/30 bg-gradient-to-br from-black/60 to-luxury-accent/5 p-8 flex flex-col items-start",
    title: "text-4xl font-serif text-luxury-accent mb-8 italic self-center",
    item: "flex justify-between items-baseline mb-3 w-full border-b border-white/10 pb-1",
    itemName: "text-base font-medium text-white",
    itemDesc: "hidden",
    itemPrice: "text-base font-serif text-luxury-accent ml-4"
  },
  {
    container: "border-4 border-double border-luxury-accent/50 bg-black/80 p-8 flex flex-col",
    title: "text-2xl font-bold uppercase tracking-widest text-luxury-accent mb-6 text-center bg-luxury-accent/10 py-1",
    item: "flex flex-col mb-5 items-center text-center",
    itemName: "text-xl font-serif text-luxury-accent/90",
    itemDesc: "text-sm text-white/70 max-w-[200px]",
    itemPrice: "text-sm font-bold text-white mt-1"
  },
  {
    container: "border border-white/20 bg-black/40 p-6 flex flex-col rounded-3xl",
    title: "text-3xl font-serif text-white mb-6 pl-4 border-l-4 border-luxury-accent",
    item: "flex flex-col mb-4 last:mb-0 bg-white/5 p-3 rounded-xl",
    itemName: "text-base font-bold text-luxury-accent",
    itemDesc: "text-xs text-white/80 mt-1",
    itemPrice: "text-sm font-mono text-white/90 mt-2 self-end"
  }
];

export default function Menu() {
  const [items, setItems] = useState<DbMenuItem[]>([]);
  const [categories, setCategories] = useState<DbMenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = () => {
      Promise.all([
        fetchAllPublicMenuItems(),
        fetchMenuCategories()
      ]).then(([itemsData, categoriesData]) => {
        setItems(itemsData);
        setCategories(categoriesData);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    };

    loadData();

    // Subscribe to changes
    const itemsSubscription = supabase
      .channel('public:savannah_menu_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savannah_menu_items' }, () => {
        loadData();
      })
      .subscribe();

    const categoriesSubscription = supabase
      .channel('public:savannah_menu_categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savannah_menu_categories' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(itemsSubscription);
      supabase.removeChannel(categoriesSubscription);
    };
  }, []);

  const categorizedData = categories.map((category) => {
    const categoryItems = items.filter(item => item.menu_slug === category.slug);
    const filteredItems = categoryItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      ...category,
      items: filteredItems,
      totalInCategory: categoryItems.length
    };
  }).filter(category => {
    if (searchQuery) {
      return category.items.length > 0 || category.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-black pb-16 pt-8">
        <div className="animate-pulse text-luxury-accent text-2xl font-serif uppercase tracking-widest">Crafting Menus...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-black pb-24 pt-12 px-4">
      <div className="max-w-4xl text-center mb-8 luxury-fade-in">
        <h1 className="text-6xl md:text-7xl font-serif font-bold text-luxury-accent mb-6 drop-shadow-2xl">The Savannah Collection</h1>
        <div className="w-24 h-1 bg-luxury-accent mx-auto mb-8"></div>
        <p className="text-xl text-white/80 font-light leading-relaxed">Experience culinary excellence through our curated categories. Every dish tells a story of flavor and passion.</p>
      </div>

      <div className="w-full max-w-2xl mb-16 relative luxury-fade-in">
        <input
          type="text"
          placeholder="Search for a dish, ingredient, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-14 bg-white/5 border border-luxury-accent/30 rounded-full px-8 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-luxury-accent/50 transition-all text-lg"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-luxury-accent/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 w-full max-w-[1600px]">
        {categorizedData.length > 0 ? categorizedData.map((category, index) => {
          const design = DESIGNS[index % DESIGNS.length];
          return (
            <Link
              key={category.slug}
              href={`/menu/${category.slug}`}
              className={`group luxury-card relative overflow-hidden transition-all duration-500 hover:ring-2 hover:ring-luxury-accent/50 ${design.container} min-h-[500px]`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-luxury-accent/40 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
              
              <h2 className={design.title}>{category.title}</h2>
              
              <div className="flex-1 w-full flex flex-col justify-center">
                {category.items.length > 0 ? (
                  <div className="w-full">
                    {category.items.slice(0, 4).map((item) => (
                      <div key={item.id} className={design.item}>
                        <div className="flex justify-between items-start w-full">
                           <span className={design.itemName}>{item.name}</span>
                           {design.itemPrice && !design.itemPrice.includes('self-end') && <span className={design.itemPrice}>{item.price}</span>}
                        </div>
                        {item.description && <p className={design.itemDesc}>{item.description}</p>}
                        {design.itemPrice && design.itemPrice.includes('self-end') && <span className={design.itemPrice}>{item.price}</span>}
                      </div>
                    ))}
                    {category.totalInCategory > 4 && (
                      <p className="text-center text-luxury-accent/60 text-xs mt-4 uppercase tracking-widest">+ {category.totalInCategory - 4} More specialties</p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center opacity-40 py-12">
                    <span className="text-4xl mb-4 italic font-serif text-white">Coming soon</span>
                    <div className="w-12 h-px bg-white/30"></div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-luxury-accent/10 w-full text-center">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-luxury-accent group-hover:text-white transition-colors">
                  View Full Menu
                </span>
              </div>
            </Link>
          );
        }) : (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
             <span className="text-6xl font-serif text-white/20 mb-8 italic">0 Items Found</span>
             <p className="text-white/60 text-xl max-w-md mb-12">We couldn't find any dishes matching "{searchQuery}".</p>
             <div className="p-8 border border-luxury-accent/20 bg-white/5 rounded-2xl max-w-lg">
                <h3 className="text-luxury-accent font-bold uppercase tracking-widest mb-4">Instructions to add items</h3>
                <ol className="text-white/70 text-left list-decimal list-inside space-y-3">
                  <li>Navigate to the <Link href="/admin/menu" className="text-luxury-accent underline hover:text-white">Admin Menu Dashboard</Link>.</li>
                  <li>Click on <span className="text-white font-bold">"New Item"</span> or <span className="text-white font-bold">"Categories"</span> to create a selection.</li>
                  <li>Ensure <span className="text-white font-bold">"Available on public menu"</span> is checked.</li>
                  <li>The live menu will update instantly across the site.</li>
                </ol>
             </div>
             <button onClick={() => setSearchQuery('')} className="mt-12 text-luxury-accent hover:underline uppercase tracking-widest font-bold">
               Clear Search & View All
             </button>
          </div>
        )}
      </div>
    </main>
  );
}
