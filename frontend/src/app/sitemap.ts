import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: process.env.NEXTAUTH_URL || "http://localhost:3000",
      lastModified: new Date(2025, 12, 25),
      priority: 1.0,
    },
  ];

  const dynamicPages: MetadataRoute.Sitemap = [];

  return [...staticPages, ...dynamicPages];
}
