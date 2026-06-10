import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';
import { effectivePrice } from '@/lib/utils';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  add: (product: Product, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  count: () => number;
  subtotal: () => number;
}

const MAX_PER_ITEM = 10;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      add: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: Math.min(MAX_PER_ITEM, i.quantity + quantity) }
                  : i,
              ),
            };
          }
          return {
            items: [...state.items, { product, quantity: Math.min(MAX_PER_ITEM, quantity) }],
          };
        }),

      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) })),

      setQuantity: (productId, quantity) =>
        set((state) => {
          const q = Math.max(1, Math.min(MAX_PER_ITEM, Math.floor(quantity) || 1));
          return {
            items: state.items.map((i) =>
              i.product.id === productId ? { ...i, quantity: q } : i,
            ),
          };
        }),

      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + effectivePrice(i.product) * i.quantity, 0),
    }),
    {
      name: 'warpski-cart',
      // Only persist the line items — UI state (isOpen) is ephemeral.
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
