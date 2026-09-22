import { MetadataRoute } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { buildProductUrl } from "@/lib/slug";

const siteUrl = "https://www.kayzeeglobal.com"; // update once you have a real domain

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/deals`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/repair`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Pull every product so each laptop gets its own indexed, rankable URL.
  const snapshot = await getDocs(collection(db, "products"));
  const productRoutes: MetadataRoute.Sitemap = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      url: `${siteUrl}${buildProductUrl(data.name, doc.id)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    };
  });

  return [...staticRoutes, ...productRoutes];
}