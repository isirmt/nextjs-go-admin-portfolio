import type { MetadataRoute } from "next";
import {
  getPublicBlogArticles,
  getPublicBlogSeriesList,
} from "@/lib/blogs/publicApi";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  const [articles, series] = await Promise.all([
    getPublicBlogArticles(),
    getPublicBlogSeriesList(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blogs`,
      priority: 0.8,
    },
  ];

  const dynamicPages: MetadataRoute.Sitemap = [
    ...articles.map((article) => ({
      url: `${baseUrl}/blogs/${encodeURIComponent(article.slug)}`,
      lastModified: new Date(article.updated_at),
      priority: 0.7,
    })),
    ...series.map((item) => ({
      url: `${baseUrl}/blogs/series/${encodeURIComponent(item.slug)}`,
      lastModified: new Date(item.updated_at),
      priority: 0.6,
    })),
  ];

  return [...staticPages, ...dynamicPages];
}
