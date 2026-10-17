"use client";

import { fetchAdminOrPublic } from "@/lib/auth/backendFetch";
import type { BlogSeries } from "@/types/blogs/common";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type BlogSeriesContextValue = {
  series: BlogSeries[];
  isLoading: boolean;
  error: string | null;
  refreshBlogSeries: () => Promise<void>;
};

const BlogSeriesContext = createContext<BlogSeriesContextValue | null>(null);

export function BlogSeriesProvider({ children }: { children: React.ReactNode }) {
  const [series, setSeries] = useState<BlogSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogSeries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAdminOrPublic(
        "/blog-series",
        "/api/blog-series",
      );
      if (!response.ok) {
        throw new Error(
          (await response.text()) || "シリーズ一覧の取得に失敗しました",
        );
      }
      const data = (await response.json()) as BlogSeries[];
      setSeries(Array.isArray(data) ? data : []);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "シリーズ一覧の取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBlogSeries();
  }, [fetchBlogSeries]);

  const value = useMemo(
    () => ({
      series,
      isLoading,
      error,
      refreshBlogSeries: fetchBlogSeries,
    }),
    [series, isLoading, error, fetchBlogSeries],
  );

  return (
    <BlogSeriesContext.Provider value={value}>
      {children}
    </BlogSeriesContext.Provider>
  );
}

export function useBlogSeriesContext() {
  const context = useContext(BlogSeriesContext);
  if (!context) {
    throw new Error(
      "useBlogSeriesContext must be used within a BlogSeriesProvider",
    );
  }
  return context;
}
