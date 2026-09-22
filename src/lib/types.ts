export type LaptopType = {
    dbID : string;
    id: string;
    name: string;
    category: string;
    price: number;
    oldPrice: number;
    images: string[];
    specs: string;
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
}

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
  stockQuantity: string;
  tag: string;
  description: string;
  features: string;
  warranty: string;
  isDeal: boolean;
  dealEndsAt: string;
  dealBadge: string;
  discount: string;
}