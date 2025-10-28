export type LaptopType = {
    dbID? : string;
    id: string;
    name: string;
    category: string;
    price: number;
    oldPrice: number | undefined;
    images: string[];
    specs: string;
    rating: number;
    reviews: number;
    inStock: boolean;
    tag: string;
    description: string;
    features: string[];
    warranty: string;
    isDeal?: boolean;
    dealBadge?: string;
    discount?: number;
}

// ✅ Type for Form Data
export interface FormState {
  id? : string | number;
  name: string;
  category: string;
  price: string;
  oldPrice: string;
  images: string[];
  specs: string;
  rating: string;
  reviews: string;
  inStock: boolean;
  tag: string;
  description: string;
  features: string;
  warranty: string;
  isDeal: boolean;
  dealBadge: string;
  discount: string;
}