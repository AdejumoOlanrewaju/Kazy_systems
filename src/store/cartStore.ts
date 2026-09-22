import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LaptopType } from "@/lib/types";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stockQuantity: number;
};

type CartStore = {
  items: CartItem[];
  addItem: (product: LaptopType) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const existing = get().items.find((i) => i.id === product.dbID);
        if (existing) {
          if (existing.quantity >= product.stockQuantity) return;
          set({
            items: get().items.map((i) =>
              i.id === product.dbID ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          if (product.stockQuantity < 1) return;
          set({
            items: [
              ...get().items,
              {
                id: product.dbID!,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || "",
                quantity: 1,
                stockQuantity: product.stockQuantity,
              },
            ],
          });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        const item = get().items.find((i) => i.id === id);
        if (!item) return;
        if (quantity < 1 || quantity > item.stockQuantity) return;
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "kazy-cart" }
  )
);