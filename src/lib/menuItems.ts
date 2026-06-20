import { menuDetails } from './menuData';
import { supabase } from './supabase';
import type { DbMenuItem, MenuItem, MenuItemInput, MenuSlug, DbMenuCategory, MenuCategoryInput } from '../types/app';

export function staticItemsForMenu(slug: MenuSlug): MenuItem[] {
  const details = (menuDetails as Record<string, any>)[slug];
  return details?.items || [];
}

export function dbItemToMenuItem(item: DbMenuItem): MenuItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    sort_order: item.sort_order,
    is_available: item.is_available,
    stock_quantity: item.stock_quantity,
    image_url: item.image_url,
    image_url_2: item.image_url_2,
  };
}

export async function fetchPublicMenuItems(slug: MenuSlug): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('savannah_menu_items')
    .select('id, menu_slug, menu_title, name, description, price, sort_order, is_available, stock_quantity, image_url, image_url_2')
    .eq('menu_slug', slug)
    .eq('is_available', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching public menu items:', error);
    return [];
  }

  return (data || []).map((item) => dbItemToMenuItem(item as DbMenuItem));
}

export async function fetchAllPublicMenuItems(): Promise<DbMenuItem[]> {
  const { data, error } = await supabase
    .from('savannah_menu_items')
    .select('*')
    .eq('is_available', true)
    .order('menu_slug', { ascending: true })
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []) as DbMenuItem[];
}

export async function fetchMenuCategories(): Promise<DbMenuCategory[]> {
  const { data, error } = await supabase
    .from('savannah_menu_categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching menu categories:', error);
    return [];
  }

  return (data || []) as DbMenuCategory[];
}

export async function createMenuCategory(input: MenuCategoryInput) {
  const { error } = await supabase.from('savannah_menu_categories').insert(input);
  if (error) throw error;
}

export async function updateMenuCategory(id: string, input: MenuCategoryInput) {
  const { error } = await supabase.from('savannah_menu_categories').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteMenuCategory(id: string) {
  const { error } = await supabase.from('savannah_menu_categories').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchAdminMenuItems(): Promise<DbMenuItem[]> {
  const { data, error } = await supabase
    .from('savannah_menu_items')
    .select('*')
    .order('menu_slug', { ascending: true })
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []) as DbMenuItem[];
}

export async function createMenuItem(input: MenuItemInput) {
  const { error } = await supabase.from('savannah_menu_items').insert(input);
  if (error) throw error;
}

export async function updateMenuItem(id: string, input: MenuItemInput) {
  const { error } = await supabase.from('savannah_menu_items').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteMenuItem(id: string) {
  const { error } = await supabase.from('savannah_menu_items').delete().eq('id', id);
  if (error) throw error;
}
