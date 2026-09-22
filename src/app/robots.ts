import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/cart",
        "/checkout",
        "/orderConfirmation",
        "/api/",
      ],
    },
    sitemap: "https://www.kayzeeglobal.com/sitemap.xml",
  };
}