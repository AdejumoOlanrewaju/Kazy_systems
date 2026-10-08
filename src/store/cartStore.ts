import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LaptopType, ProductConfiguration } from "@/lib/types";
import { getConfigurationLabel, getEffectivePrice } from "@/lib/productDisplay";

export type CartItem = {
  id: string;               // unique cart line id: dbID, or `${dbID}_${configId}`
  productId: string;        // always the real product dbID — used for stock lookups
  configurationId?: string;
  configurationLabel?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stockQuantity: number;
};

type CartStore = {
  items: CartItem[];
  addItem: (product: LaptopType, configuration?: ProductConfiguration) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  syncPrices: (products: LaptopType[]) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, configuration) => {
        const cartId = configuration ? `${product.dbID}_${configuration.id}` : product.dbID;
        const price = getEffectivePrice(product, configuration).price;
        const stockQuantity = configuration ? configuration.stockQuantity : product.stockQuantity;

        const existing = get().items.find((i) => i.id === cartId);
        if (existing) {
          if (existing.quantity >= stockQuantity) return;
          set({
            items: get().items.map((i) =>
              i.id === cartId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          if (stockQuantity < 1) return;
          set({
            items: [
              ...get().items,
              {
                id: cartId,
                productId: product.dbID,
                configurationId: configuration?.id,
                configurationLabel: configuration ? getConfigurationLabel(configuration) : undefined,
                name: product.name,
                price,
                image: product.images?.[0] || "",
                quantity: 1,
                stockQuantity,
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

      // Re-prices every cart line from the current product data, so a deal that
      // started or ended since the item was added is reflected. Lines whose
      // product or configuration no longer exists are dropped.
      syncPrices: (products) => {
        const synced: CartItem[] = [];
        for (const item of get().items) {
          const product = products.find((p) => p.dbID === item.productId);
          if (!product) continue;
          const config = item.configurationId
            ? product.configurations?.find((c) => c.id === item.configurationId)
            : undefined;
          if (item.configurationId && !config) continue;

          synced.push({
            ...item,
            price: getEffectivePrice(product, config).price,
            stockQuantity: config ? config.stockQuantity : product.stockQuantity,
          });
        }
        set({ items: synced });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "kazy-cart" }
  )
);