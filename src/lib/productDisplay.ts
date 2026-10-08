import { ProductConfiguration, SpecEntry } from "@/lib/types";

type Stockable = { stockQuantity?: number; configurations?: ProductConfiguration[] };

type DealFields = { isDeal?: boolean; discount?: number; dealEndsAt?: number | null };

type PricedProduct = DealFields & {
  price?: number;
  oldPrice?: number;
  configurations?: ProductConfiguration[];
};

export const getConfigurationLabel = (config: ProductConfiguration): string => {
  if (config.customLabel?.trim()) return config.customLabel;
  const parts = [
    config.processor,
    config.ram && `${config.ram} RAM`,
    config.storage,
  ].filter(Boolean);
  return parts.join(" / ") || "Configuration";
};

// Total sellable units: sum of configurations if any, else the flat field.
export const getProductStock = (p: Stockable): number =>
  p.configurations?.length
    ? p.configurations.reduce((sum, c) => sum + (c.stockQuantity || 0), 0)
    : p.stockQuantity ?? 0;

// Stock on hand valued at regular selling price (admin dashboard).
export const getInventoryValue = (p: Stockable & { price?: number }): number =>
  p.configurations?.length
    ? p.configurations.reduce((sum, c) => sum + c.price * (c.stockQuantity || 0), 0)
    : (p.price ?? 0) * (p.stockQuantity ?? 0);

// A deal is live while it is flagged AND its end time has not passed.
// Checked against the clock, so the price returns to normal at the exact
// moment the deal ends, even before the database flag is flipped.
export const isDealLive = (p: DealFields, now: number = Date.now()): boolean =>
  !!p.isDeal && (!p.dealEndsAt || p.dealEndsAt > now);

type PriceResult = { price: number; oldPrice?: number };

// While a deal is live with a discount, the listed price is the REGULAR price
// and the customer pays regular x (1 - discount%). Otherwise the price is as
// listed, with an optional permanent "was" price (oldPrice) for markdowns.
const applyDeal = (
  regular: number,
  storedOld: number | undefined,
  p: DealFields,
  now: number
): PriceResult => {
  if (isDealLive(p, now) && (p.discount ?? 0) > 0) {
    return {
      price: Math.round(regular * (1 - (p.discount as number) / 100)),
      oldPrice: regular,
    };
  }
  return {
    price: regular,
    oldPrice: storedOld && storedOld > regular ? storedOld : undefined,
  };
};

// The price a customer actually pays for this product (or one configuration).
export const getEffectivePrice = (
  p: PricedProduct,
  config?: ProductConfiguration,
  now: number = Date.now()
): PriceResult =>
  config
    ? applyDeal(config.price, config.oldPrice, p, now)
    : applyDeal(p.price ?? 0, p.oldPrice, p, now);

// Card-level pricing: the cheapest option a customer can buy, with savings and
// percentage computed from real prices.
export const getPricing = (p: PricedProduct, now: number = Date.now()) => {
  const best = p.configurations?.length
    ? p.configurations
        .map((c) => getEffectivePrice(p, c, now))
        .reduce((a, b) => (b.price < a.price ? b : a))
    : getEffectivePrice(p, undefined, now);

  const hasDiscount = best.oldPrice !== undefined && best.oldPrice > best.price;
  return {
    price: best.price,
    oldPrice: hasDiscount ? best.oldPrice : undefined,
    savings: hasDiscount ? best.oldPrice! - best.price : 0,
    percent: hasDiscount ? Math.round((1 - best.price / best.oldPrice!) * 100) : 0,
    isFrom: (p.configurations?.length ?? 0) > 1,
  };
};

// Used for price filters and sorting.
export const getProductPrice = (p: PricedProduct): number => getPricing(p).price;

// One-line description for cards: shared description first, then the first
// configuration's specs, then the spec sheet.
export const getProductSummary = (p: {
  description?: string;
  configurations?: ProductConfiguration[];
  specSheet?: SpecEntry[];
}): string => {
  if (p.description?.trim()) return p.description.trim();
  if (p.configurations?.length) return getConfigurationLabel(p.configurations[0]);
  if (p.specSheet?.length) return p.specSheet.slice(0, 3).map((s) => s.value).join(" • ");
  return "";
};