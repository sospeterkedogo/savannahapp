import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartContextValue, CartItem } from '../types/app';

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = 'savannah-cart';

function parsePrice(price: string) {
  const value = Number(price.replace(/[^0-9.]/g, ''));
  return Number.isFinite(value) ? value : 0;
}

function createCartId(item: Omit<CartItem, 'id'>) {
  return [item.menuSlug, item.itemName, item.service, item.notes].join('|');
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + parsePrice(item.price) * item.quantity, 0);

    return {
      items,
      count,
      subtotal,
      addItem: (item) => {
        const id = createCartId(item);
        setItems((current) => {
          const existing = current.find((cartItem) => cartItem.id === id);
          if (existing) {
            return current.map((cartItem) =>
              cartItem.id === id
                ? { ...cartItem, quantity: Math.min(cartItem.quantity + item.quantity, 99) }
                : cartItem
            );
          }
          return [...current, { ...item, id }];
        });
      },
      updateQuantity: (id, quantity) => {
        setItems((current) =>
          current.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, Math.min(quantity, 99)) } : item))
        );
      },
      removeItem: (id) => {
        setItems((current) => current.filter((item) => item.id !== id));
      },
      clearCart: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
