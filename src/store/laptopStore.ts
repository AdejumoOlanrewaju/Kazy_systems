import { create } from "zustand";
import { getProducts } from "@/lib/productDataService";
import { LaptopType } from "@/lib/types";
type LaptopStore = {
  laptopStoreData: LaptopType[];
  loadingStore: boolean;
  fetchLaptops: () => () => void; // returns unsubscribe
  setLaptops: (data: LaptopType[]) => void;
};

export const useLaptopStore = create<LaptopStore>((set) => ({
  laptopStoreData: [],
  loadingStore: true,

  // ✅ fetchLaptops uses your getProducts helper
  fetchLaptops: () => {
    const unsubscribe = getProducts((data) => {
      set({ laptopStoreData: data, loadingStore: false });
    });
    return unsubscribe;
  },

  setLaptops: (data) => set({ laptopStoreData: data }),
}));
