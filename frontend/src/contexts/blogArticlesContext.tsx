"use client";

import backendApi from "@/lib/auth/backendFetch";
import type { BlogArticleSummary } from "@/types/blogs/common";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type BlogArticlesContextValue = {
  articles: BlogArticleSummary[];
  isLoading: boolean;
  error: string | null;
  refreshBlogArticles: () => Promise<void>;
};

const BlogArticlesContext = createContext<BlogArticlesContextValue | null>(
  null,
);

export function BlogArticlesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [articles, setArticles] = useState<BlogArticleSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let response = await backendApi("/blogs");
      if (response.status === 401 || response.status === 403) {
        response = await fetch("/api/blogs");
      }
      if (!response.ok) {
        throw new Error(
          (await response.text()) || "記事一覧の取得に失敗しました",
        );
      }
      const data = (await response.json()) as BlogArticleSummary[];
      setArticles(Array.isArray(data) ? data : []);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "記事一覧の取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBlogArticles();
  }, [fetchBlogArticles]);

  const value = useMemo(
    () => ({
      articles,
      isLoading,
      error,
      refreshBlogArticles: fetchBlogArticles,
    }),
    [articles, isLoading, error, fetchBlogArticles],
  );

  return (
    <BlogArticlesContext.Provider value={value}>
      {children}
    </BlogArticlesContext.Provider>
  );
}

export function useBlogArticlesContext() {
  const context = useContext(BlogArticlesContext);
  if (!context) {
    throw new Error(
      "useBlogArticlesContext must be used within a BlogArticlesProvider",
    );
  }
  return context;
}
