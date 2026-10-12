import type { BlogArticle, BlogArticleSummary } from "@/types/blogs/common";

const backendBaseUrl = process.env.BACKEND_BASE_URL;

async function fetchPublicBlogs<T>(path: string): Promise<T | null> {
  if (!backendBaseUrl) throw new Error("BACKEND_BASE_URL is not configured");

  const response = await fetch(new URL(path, backendBaseUrl), {
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("ブログの取得に失敗しました");

  return (await response.json()) as T;
}

export async function getPublicBlogArticles(): Promise<BlogArticleSummary[]> {
  return (await fetchPublicBlogs<BlogArticleSummary[]>("/blogs")) ?? [];
}

export function getPublicBlogArticle(slug: string) {
  return fetchPublicBlogs<BlogArticle>(`/blogs/${encodeURIComponent(slug)}`);
}
