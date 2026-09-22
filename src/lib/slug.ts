// "HP Victus 15 (2024)" -> "hp-victus-15-2024"
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // any run of non-alphanumeric chars -> single hyphen
    .replace(/(^-|-$)/g, "");   // trim leading/trailing hyphens
};

// Builds the full product URL: readable slug + unique Firestore ID.
// e.g. buildProductUrl("HP Victus 15", "aB3xY9kLp2QwErT5uI7o")
//   -> "/product/hp-victus-15-aB3xY9kLp2QwErT5uI7o"
export const buildProductUrl = (name: string, dbID: string): string => {
  return `/product/${slugify(name)}-${dbID}`;
};

// Extracts the dbID back out of a slug URL segment.
// Firestore auto-IDs never contain hyphens, so the ID is always
// everything after the LAST hyphen — regardless of how many hyphens
// are in the product name portion before it.
export const extractIdFromSlug = (slug: string): string => {
  const lastHyphenIndex = slug.lastIndexOf("-");
  return lastHyphenIndex === -1 ? slug : slug.slice(lastHyphenIndex + 1);
};