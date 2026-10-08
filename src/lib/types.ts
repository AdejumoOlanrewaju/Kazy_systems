export type LaptopType = {
  dbID: string;
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  images: string[];
  // specs: string;
  rating: number;
  reviews: number;
  stockQuantity: number;
  tag: string;
  description: string;
  features: string[];
  warranty: string;
  isDeal?: boolean;
  dealEndsAt?: number | null;
  dealBadge?: string;
  discount?: number;
  configurations?: ProductConfiguration[];
  condition?: "new" | "used" | "refurbished";
  conditionNotes?: string;
  specSheet?: SpecEntry[];
}

export interface FormState {
  id?: string | number;
  name: string;
  category: string;
  price: string;
  oldPrice: string;
  images: string[];
  // specs: string;
  rating: string;
  reviews: string;
  stockQuantity: string;
  tag: string;
  description: string;
  features: string;
  warranty: string;
  isDeal: boolean;
  dealEndsAt: string;
  dealBadge: string;
  discount: string;
  configurations: {
    id: string;
    processor: string;
    ram: string;
    storage: string;
    customLabel: string;
    price: string;
    oldPrice: string;
    stockQuantity: string;
  }[];
  condition: string;
  conditionNotes: string;
  specSheet: { label: string; value: string }[];
}

export type ProductConfiguration = {
  id: string;
  processor: string;   // "Intel Core i5-8350U"
  ram: string;          // "8GB"
  storage: string;      // "256GB SSD"
  customLabel?: string; // overrides the auto-generated label when set
  price: number;
  oldPrice?: number;
  stockQuantity: number;
};

export type SpecEntry = { label: string; value: string };

