import type { ReactNode } from 'react';

export type MenuSlug = string;

export type DbMenuCategory = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type MenuCategoryInput = Omit<DbMenuCategory, 'id' | 'created_at' | 'updated_at'>;

export type MenuItem = {
  id?: string;
  name: string;
  description: string;
  price: string;
  sort_order?: number;
  is_available?: boolean;
  stock_quantity?: number;
  image_url?: string;
  image_url_2?: string;
};

export type MenuDetail = {
  title: string;
  image: string;
  description: string;
  items: MenuItem[];
};

export type DbMenuItem = {
  id: string;
  menu_slug: string;
  menu_title: string;
  name: string;
  description: string;
  price: string;
  sort_order: number;
  is_available: boolean;
  stock_quantity?: number;
  image_url: string;
  image_url_2: string;
  created_at?: string;
  updated_at?: string;
};

export type MenuItemInput = Omit<DbMenuItem, 'id' | 'created_at' | 'updated_at'>;

export type CartItem = {
  id: string;
  menuSlug: string;
  menuTitle: string;
  itemName: string;
  description: string;
  price: string;
  quantity: number;
  service: string;
  notes: string;
};

export type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

export type CustomerProfile = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  maps_link?: string | null;
};

export type CheckoutLocation = {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  mapsLink?: string;
  consented: boolean;
};

export type SavannahOrder = {
  id: string;
  user_id?: string | null;
  invoice_number: string;
  receipt_number: string;
  status: string;
  customer: Record<string, unknown>;
  location: Record<string, unknown>;
  items: CartItem[];
  subtotal: number;
  service: string;
  notes: string;
  delivery_address?: string;
  assigned_driver_id?: string;
  delivery_status?: string;
  created_at: string;
};

export type OrderEmailResult = {
  attempted: boolean;
  sent: boolean;
  message: string;
};

export type PlacedOrderResult = {
  order: SavannahOrder;
  email: OrderEmailResult;
};

export type StaffRole = 'admin' | 'employee';
export type UserRole = StaffRole | 'customer' | 'dev';

export type AuthProfile = {
  id: string;
  email: string;
  role: UserRole;
};

export type Theme = 'dark' | 'light';

export type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
};

export type ThemeProviderProps = {
  children: ReactNode;
};

export type AccountMode = 'signin' | 'create';

export type AuthContext = 'customer' | 'checkout' | 'staff';

export type SocialProvider = 'google' | 'github' | 'facebook';

export type CheckoutCustomerForm = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
  service: string;
  notes: string;
};

export type AdminMenuFormState = {
  id: string;
  menu_slug: string;
  menu_title: string;
  name: string;
  description: string;
  price: string;
  sort_order: string;
  is_available: boolean;
  image_url: string;
  image_url_2: string;
};

export type OnboardingRole = 'guest' | 'customer' | 'employee' | 'admin';

export type OnboardingStep = {
  id: string;
  title: string;
  body: string;
  href?: string;
  actionLabel?: string;
};

export type OnboardingState = {
  completed: string[];
  dismissed: boolean;
};

export type SavannahShift = {
  id: string;
  user_id: string;
  full_name?: string;
  role: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
};

export type ShiftInput = Omit<SavannahShift, 'id' | 'created_at' | 'full_name'>;

export type SavannahEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
};

export type SavannahBooking = {
  id: string;
  user_id?: string | null;
  full_name: string;
  email: string;
  phone: string;
  booking_date: string;
  booking_time: string;
  guests_count: number;
  status: string;
  notes?: string;
  invoice_number?: string;
  receipt_number?: string;
  created_at?: string;
  updated_at?: string;
};

