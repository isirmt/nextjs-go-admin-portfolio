import type {
  BlogArticle,
  BlogArticleSummary,
  BlogSeries,
} from "@/types/blogs/common";

const backendBaseUrl = process.env.BACKEND_BASE_URL;

async function fetchPublicBlogs<T>(
  path: string,
  revalidate?: number,
): Promise<T | null> {
  if (!backendBaseUrl) throw new Error("BACKEND_BASE_URL is not configured");

  const response = await fetch(
    new URL(path, backendBaseUrl),
    revalidate === undefined ? { cache: "no-store" } : { next: { revalidate } },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("ブログの取得に失敗しました");

  return (await response.json()) as T;
}

export async function getPublicBlogArticles(): Promise<BlogArticleSummary[]> {
  return (await fetchPublicBlogs<BlogArticleSummary[]>("/blogs")) ?? [];
}

export async function getPublicBlogSeriesList(): Promise<BlogSeries[]> {
  return (await fetchPublicBlogs<BlogSeries[]>("/blog-series")) ?? [];
}

export function getPublicBlogSeries(slug: string, revalidate?: number) {
  return fetchPublicBlogs<BlogSeries>(
    `/blog-series/${encodeURIComponent(slug)}`,
    revalidate,
  );
}

export function getPublicBlogArticle(slug: string, revalidate?: number) {
  return fetchPublicBlogs<BlogArticle>(
    `/blogs/${encodeURIComponent(slug)}`,
    revalidate,
  );
}

export async function getPublicRelatedBlogArticles(
  slug: string,
  revalidate?: number,
): Promise<BlogArticleSummary[]> {
  return (
    (await fetchPublicBlogs<BlogArticleSummary[]>(
      `/blogs/${encodeURIComponent(slug)}/related`,
      revalidate,
    )) ?? []
  );
}
