import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useAuthGuard } from '../../lib/useAuthGuard';
import {
  createMenuItem,
  deleteMenuItem,
  fetchAdminMenuItems,
  updateMenuItem,
  fetchMenuCategories,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
} from '../../lib/menuItems';
import type { AdminMenuFormState, DbMenuItem, MenuItemInput, DbMenuCategory, MenuCategoryInput } from '../../types/app';
import MenuImageUpload from '../../components/admin/MenuImageUpload';
import { validateMenuImages } from '../../lib/menuImages';

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

const emptyForm: AdminMenuFormState = {
  id: '',
  menu_slug: 'mainmenu',
  menu_title: 'Main Menu',
  name: '',
  description: '',
  price: '',
  sort_order: '10',
  is_available: true,
  image_url: '',
  image_url_2: '',
};

const emptyCategoryForm: MenuCategoryInput & { id: string } = {
  id: '',
  slug: '',
  title: '',
  description: '',
  image_url: '',
  sort_order: 10,
};

const inputClass =
  'min-h-11 rounded-lg border border-luxury-accent/40 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/45 focus:ring-2 focus:ring-luxury-accent';

function itemToForm(item: DbMenuItem): AdminMenuFormState {
  return {
    id: item.id,
    menu_slug: item.menu_slug,
    menu_title: item.menu_title,
    name: item.name,
    description: item.description,
    price: item.price,
    sort_order: String(item.sort_order),
    is_available: item.is_available,
    image_url: item.image_url || '',
    image_url_2: item.image_url_2 || '',
  };
}

function formToInput(form: AdminMenuFormState): MenuItemInput {
  return {
    menu_slug: form.menu_slug,
    menu_title: form.menu_title,
    name: form.name.trim(),
    description: form.description.trim(),
    price: form.price.trim(),
    sort_order: Number(form.sort_order) || 0,
    is_available: form.is_available,
    image_url: form.image_url.trim(),
    image_url_2: form.image_url_2.trim(),
  };
}

export default function AdminMenu() {
  const { loading: authLoading, profile, allowed } = useAuthGuard(['admin', 'employee']);
  const [items, setItems] = useState<DbMenuItem[]>([]);
  const [categories, setCategories] = useState<DbMenuCategory[]>([]);
  const [form, setForm] = useState<AdminMenuFormState>(emptyForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [view, setView] = useState<'items' | 'categories'>('items');
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);

  const visibleItems = useMemo(() => {
    return filter === 'all' ? items : items.filter((item) => item.menu_slug === filter);
  }, [filter, items]);

  async function loadData() {
    setLoadingItems(true);
    setError('');
    try {
      const [itemsData, categoriesData] = await Promise.all([
        fetchAdminMenuItems(),
        fetchMenuCategories()
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load menu data.');
    } finally {
      setLoadingItems(false);
    }
  }

  useEffect(() => {
    if (allowed) loadData();
  }, [allowed]);

  function updateForm(next: Partial<AdminMenuFormState>) {
    setForm((current) => ({ ...current, ...next }));
  }

  function handleCategoryChange(menuSlug: string) {
    const category = categories.find((entry) => entry.slug === menuSlug);
    updateForm({
      menu_slug: menuSlug,
      menu_title: category?.title || menuSlug,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const imageError = validateMenuImages(form.image_url, form.image_url_2);
      if (imageError) {
        setError(imageError);
        return;
      }

      if (form.id) {
        await updateMenuItem(form.id, formToInput(form));
        setMessage('Menu item updated.');
      } else {
        await createMenuItem(formToInput(form));
        setMessage('Menu item created.');
      }

      setForm(emptyForm);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save menu item.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const { id, ...input } = categoryForm;
      if (id) {
        await updateMenuCategory(id, input);
        setMessage('Category updated.');
      } else {
        await createMenuCategory(input);
        setMessage('Category created.');
      }

      setCategoryForm(emptyCategoryForm);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save category.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: DbMenuItem) {
    if (!confirm(`Delete "${item.name}"?`)) return;

    setError('');
    setMessage('');

    try {
      await deleteMenuItem(item.id);
      setMessage('Menu item deleted.');
      if (form.id === item.id) setForm(emptyForm);
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete menu item.');
    }
  }

  async function handleDeleteCategory(category: DbMenuCategory) {
    if (!confirm(`Delete category "${category.title}"? This will not delete its items, but they will become orphaned.`)) return;

    setError('');
    setMessage('');

    try {
      await deleteMenuCategory(category.id);
      setMessage('Category deleted.');
      if (categoryForm.id === category.id) setCategoryForm(emptyCategoryForm);
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete category.');
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (authLoading) {
    return <main className="min-h-screen bg-black px-4 py-16 text-center text-white/70">Checking staff access...</main>;
  }

  if (!allowed) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-black pb-16 pt-8">
        <section className="w-full max-w-xl rounded-2xl border border-luxury-accent/30 bg-black/70 p-8 text-center shadow-2xl">
          <h1 className="text-4xl font-serif font-bold text-luxury-accent">Staff Access Required</h1>
          <p className="mt-4 text-white/70">Your signed-in account is not marked as an admin or employee profile.</p>
          <button onClick={handleSignOut} className="luxury-cta mt-6 rounded-full bg-gradient-to-r from-luxury-accent to-yellow-400 px-8 py-3 font-bold text-black">Sign Out</button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black pb-16 pt-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4">
        <section className="rounded-2xl border border-luxury-accent/30 bg-black/70 p-6 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-luxury-accent/80">Savannah staff</p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-luxury-accent">Menu Management</h1>
              <p className="mt-3 text-sm text-white/70">Signed in as {profile?.email} ({profile?.role}). Manage categories and menu items.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setView('items')} className={`rounded-full px-6 py-3 text-sm font-bold transition-all ${view === 'items' ? 'bg-luxury-accent text-black' : 'border border-white/30 text-white hover:border-luxury-accent'}`}>Items</button>
              <button onClick={() => setView('categories')} className={`rounded-full px-6 py-3 text-sm font-bold transition-all ${view === 'categories' ? 'bg-luxury-accent text-black' : 'border border-white/30 text-white hover:border-luxury-accent'}`}>Categories</button>
              <div className="w-px bg-white/10 mx-2 hidden md:block"></div>
              <Link href="/staff" className="rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white hover:border-luxury-accent hover:text-luxury-accent">Staff Home</Link>
              <button onClick={handleSignOut} className="rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white hover:border-luxury-accent hover:text-luxury-accent">Sign Out</button>
            </div>
          </div>
        </section>

        {(message || error) && (
          <div className={`rounded-xl border px-4 py-3 text-sm ${error ? 'border-red-400/50 bg-red-950/50 text-red-100' : 'border-green-400/50 bg-green-950/40 text-green-100'}`}>
            {error || message}
          </div>
        )}

        {view === 'items' ? (
          <div className="grid gap-6 lg:grid-cols-[420px_1fr] ">
            <section className="rounded-2xl border border-luxury-accent/25 bg-black/60 p-5 shadow-xl" aria-labelledby="menu-form-title">
              <h2 id="menu-form-title" className="text-2xl font-serif font-bold text-luxury-accent">{form.id ? 'Edit Item' : 'New Item'}</h2>
              <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
                <label className="flex flex-col gap-2 text-sm font-semibold text-white/75">
                  Category
                  <select className={inputClass} value={form.menu_slug} onChange={(event) => handleCategoryChange(event.target.value)}>
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>{cat.title}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-white/75">
                  Item name
                  <input className={inputClass} value={form.name} onChange={(event) => updateForm({ name: event.target.value })} required />
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-white/75">
                  Description
                  <textarea className={`${inputClass} min-h-28`} value={form.description} onChange={(event) => updateForm({ description: event.target.value })} required />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-2 text-sm font-semibold text-white/75">
                    Price
                    <input className={inputClass} value={form.price} onChange={(event) => updateForm({ price: event.target.value })} placeholder="$18" required />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-semibold text-white/75">
                    Sort
                    <input className={inputClass} value={form.sort_order} onChange={(event) => updateForm({ sort_order: event.target.value })} type="number" required />
                  </label>
                </div>

                <label className="flex items-center gap-3 rounded-lg border border-luxury-accent/25 bg-black/30 px-3 py-3 text-sm font-semibold text-white/80">
                  <input type="checkbox" checked={form.is_available} onChange={(event) => updateForm({ is_available: event.target.checked })} className="h-5 w-5 accent-luxury-accent" />
                  Available on public menu
                </label>

                <MenuImageUpload
                  imageUrl={form.image_url}
                  imageUrl2={form.image_url_2}
                  onChange={(next) => updateForm(next)}
                  disabled={saving}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <button type="submit" disabled={saving || validateMenuImages(form.image_url, form.image_url_2) !== null} className="luxury-cta min-h-12 rounded-full bg-gradient-to-r from-luxury-accent to-yellow-400 px-6 py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-60">
                    {saving ? 'Saving...' : form.id ? 'Update Item' : 'Create Item'}
                  </button>
                  <button type="button" onClick={() => setForm(emptyForm)} className="min-h-12 rounded-full border border-white/30 px-6 py-3 font-bold text-white hover:border-luxury-accent hover:text-luxury-accent">
                    Clear
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-2xl border border-luxury-accent/25 bg-black/60 p-5 shadow-xl" aria-labelledby="menu-table-title">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 id="menu-table-title" className="text-2xl font-serif font-bold text-luxury-accent">Live Items</h2>
                  <p className="text-sm text-white/60">{visibleItems.length} items shown</p>
                </div>
                <select className={`${inputClass} md:w-56`} value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter category">
                  <option value="all">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>{cat.title}</option>
                  ))}
                </select>
              </div>

              {loadingItems ? (
                <p className="py-12 text-center text-white/60">Loading menu items...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-separate border-spacing-y-3 text-left text-sm">
                    <thead className="text-xs uppercase tracking-[0.14em] text-white/50">
                      <tr>
                        <th className="px-3">Item</th>
                        <th className="px-3">Category</th>
                        <th className="px-3">Price</th>
                        <th className="px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleItems.map((item) => (
                        <tr key={item.id} className="bg-black/50">
                          <td className="rounded-l-xl px-3 py-4">
                            <div className="flex items-start gap-3">
                              {item.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.image_url} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover border border-luxury-accent/20" />
                              ) : null}
                              <div>
                                <p className="font-semibold text-white">{item.name}</p>
                                <p className="mt-1 max-w-md text-xs leading-5 text-white/70">{item.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-white/75">{item.menu_title}</td>
                          <td className="px-3 py-4 font-semibold text-luxury-accent">{item.price}</td>
                          <td className="rounded-r-xl px-3 py-4">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setForm(itemToForm(item))} className="rounded-full border border-luxury-accent/50 px-3 py-2 font-semibold text-luxury-accent hover:bg-luxury-accent hover:text-black">Edit</button>
                              <button onClick={() => handleDelete(item)} className="rounded-full border border-red-400/50 px-3 py-2 font-semibold text-red-100 hover:bg-red-500 hover:text-white">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[420px_1fr] ">
            <section className="rounded-2xl border border-luxury-accent/25 bg-black/60 p-5 shadow-xl">
              <h2 className="text-2xl font-serif font-bold text-luxury-accent">{categoryForm.id ? 'Edit Category' : 'New Category'}</h2>
              <form className="mt-5 grid gap-4" onSubmit={handleCategorySubmit}>
                <label className="flex flex-col gap-2 text-sm font-semibold text-white/75">
                  Title
                  <input className={inputClass} value={categoryForm.title} onChange={(event) => setCategoryForm(prev => ({ ...prev, title: event.target.value }))} required />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-white/75">
                  Slug
                  <input className={inputClass} value={categoryForm.slug} onChange={(event) => setCategoryForm(prev => ({ ...prev, slug: event.target.value.toLowerCase().replace(/\s+/g, '-') }))} placeholder="main-menu" required />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-white/75">
                  Description
                  <textarea className={`${inputClass} min-h-24`} value={categoryForm.description} onChange={(event) => setCategoryForm(prev => ({ ...prev, description: event.target.value }))} required />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-white/75">
                  Category image URL
                  <input className={inputClass} value={categoryForm.image_url} onChange={(event) => setCategoryForm(prev => ({ ...prev, image_url: event.target.value }))} placeholder="/images/bbq3.jpeg" required />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-white/75">
                  Sort Order
                  <input className={inputClass} type="number" value={categoryForm.sort_order} onChange={(event) => setCategoryForm(prev => ({ ...prev, sort_order: Number(event.target.value) }))} required />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button type="submit" disabled={saving} className="luxury-cta min-h-12 rounded-full bg-gradient-to-r from-luxury-accent to-yellow-400 px-6 py-3 font-bold text-black disabled:opacity-60">
                    {saving ? 'Saving...' : categoryForm.id ? 'Update Category' : 'Create Category'}
                  </button>
                  <button type="button" onClick={() => setCategoryForm(emptyCategoryForm)} className="min-h-12 rounded-full border border-white/30 px-6 py-3 font-bold text-white hover:border-luxury-accent">Clear</button>
                </div>
              </form>
            </section>

            <section className="rounded-2xl border border-luxury-accent/25 bg-black/60 p-5 shadow-xl">
              <h2 className="text-2xl font-serif font-bold text-luxury-accent mb-5">Existing Categories</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-separate border-spacing-y-3 text-left text-sm">
                  <thead className="text-xs uppercase tracking-widest text-white/50">
                    <tr>
                      <th className="px-3">Title / Slug</th>
                      <th className="px-3">Sort</th>
                      <th className="px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id} className="bg-black/50">
                        <td className="rounded-l-xl px-3 py-4">
                          <p className="font-semibold text-white">{cat.title}</p>
                          <p className="text-xs text-luxury-accent/70">{cat.slug}</p>
                        </td>
                        <td className="px-3 py-4 text-white/75">{cat.sort_order}</td>
                        <td className="rounded-r-xl px-3 py-4">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setCategoryForm({ id: cat.id, slug: cat.slug, title: cat.title, description: cat.description || '', image_url: cat.image_url || '', sort_order: cat.sort_order })} className="rounded-full border border-luxury-accent/50 px-3 py-2 font-semibold text-luxury-accent hover:bg-luxury-accent hover:text-black">Edit</button>
                            <button onClick={() => handleDeleteCategory(cat)} className="rounded-full border border-red-400/50 px-3 py-2 font-semibold text-red-100 hover:bg-red-500 hover:text-white">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
