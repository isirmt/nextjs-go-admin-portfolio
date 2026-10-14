"use client";

import type { BlogTag } from "@/types/blogs/common";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type BlogTagsContextValue = {
  blogTags: BlogTag[];
  isLoading: boolean;
  error: string | null;
  refreshBlogTags: () => Promise<void>;
};

const BlogTagsContext = createContext<BlogTagsContextValue | null>(null);

export function BlogTagsProvider({ children }: { children: React.ReactNode }) {
  const [blogTags, setBlogTags] = useState<BlogTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/blog-tags");
      if (!response.ok) throw new Error("ブログタグの取得に失敗しました");
      setBlogTags((await response.json()) as BlogTag[]);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "ブログタグの取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBlogTags();
  }, [fetchBlogTags]);

  const value = useMemo(
    () => ({ blogTags, isLoading, error, refreshBlogTags: fetchBlogTags }),
    [blogTags, isLoading, error, fetchBlogTags],
  );

  return (
    <BlogTagsContext.Provider value={value}>
      {children}
    </BlogTagsContext.Provider>
  );
}

export function useBlogTagsContext() {
  const context = useContext(BlogTagsContext);
  if (!context) {
    throw new Error(
      "useBlogTagsContext must be used within a BlogTagsProvider",
    );
  }
  return context;
}
