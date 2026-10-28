'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartItem } from '@shared/types';
import { normalizeCartQuantity } from '@shared/utils/cart';

export type CartLine = Omit<CartItem, 'price'> & { price: number; stock: number };
type NewCartLine = Omit<CartLine, 'quantity'>;

interface CartStore {
  items: CartLine[];
  addItem: (item: NewCartLine, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateItemQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}

const memoryStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

function lineMatches(line: CartLine, productId: string, variantId?: string | null) {
  return line.productId === productId && (line.variantId ?? null) === (variantId ?? null);
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const addQuantity = normalizeCartQuantity(quantity, item.stock);
          if (addQuantity === 0) return state;
          const existing = state.items.find((line) =>
            lineMatches(line, item.productId, item.variantId),
          );
          if (!existing) {
            return { items: [...state.items, { ...item, quantity: addQuantity }] };
          }
          return {
            items: state.items.map((line) =>
              lineMatches(line, item.productId, item.variantId)
                ? {
                    ...line,
                    stock: item.stock,
                    quantity: normalizeCartQuantity(line.quantity + addQuantity, item.stock),
                  }
                : line,
            ),
          };
        }),
      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter((line) => !lineMatches(line, productId, variantId)),
        })),
      updateItemQuantity: (productId, quantity, variantId) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((line) => !lineMatches(line, productId, variantId))
              : state.items.map((line) =>
                  lineMatches(line, productId, variantId)
                    ? { ...line, quantity: normalizeCartQuantity(quantity, line.stock) }
                    : line,
                ),
        })),
      clearCart: () => set({ items: [] }),
      getTotalAmount: () =>
        get().items.reduce((total, item) => total + item.price * item.quantity, 0),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? memoryStorage : window.localStorage,
      ),
    },
  ),
);
