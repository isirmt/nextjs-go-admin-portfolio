import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(2025, 12, 25),
      priority: 1.0,
    },
  ];

  const dynamicPages: MetadataRoute.Sitemap = [];

  return [...staticPages, ...dynamicPages];
}
