import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LaptopType } from "@/lib/types";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  addItem: (product: LaptopType) => void;
  removeItem: (id: string) => void;
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
          // Each listing is a single physical used unit — can't buy more than 1.
          return;
        }
        set({
          items: [
            ...get().items,
            {
              id: product.dbID!,
              name: product.name,
              price: product.price,
              image: product.images?.[0] || "",
              quantity: 1,
            },
          ],
        });
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "kazy-cart" }
  )
);