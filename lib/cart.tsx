"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string; // `${type}:${productId}`
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  type: "sale" | "rent";
  unitPrice: number;
  quantity: number;
  rentDays?: number;
  rentStart?: string;
  rentEnd?: string;
};

const STORAGE_KEY = "camera-rent-cart-v1";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  totalCount: number;
  totalEstimate: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage after mount, not a sync loop with
    // an external system — server and first client render must both start
    // empty to avoid a hydration mismatch, so this can't be a lazy initializer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable (private mode); cart stays in-memory for this session
    }
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const lineTotal = (item: CartItem) =>
      item.type === "rent" ? item.unitPrice * (item.rentDays ?? 1) : item.unitPrice * item.quantity;

    return {
      items,
      addItem: (item) =>
        setItems((prev) => {
          const existing = prev.find((i) => i.id === item.id);
          if (existing) {
            return prev.map((i) => (i.id === item.id ? { ...item, quantity: existing.quantity + item.quantity } : i));
          }
          return [...prev, item];
        }),
      removeItem: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
      updateQuantity: (id, quantity) =>
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i))),
      clear: () => setItems([]),
      totalCount: items.length,
      totalEstimate: items.reduce((sum, i) => sum + lineTotal(i), 0),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
