"use client";

import type { BlogArticleSummary } from "@/types/blogs/common";
import { createContext, useContext, type ReactNode } from "react";

type LatestBlogArticlesContextValue = {
  articles: BlogArticleSummary[];
};

const LatestBlogArticlesContext =
  createContext<LatestBlogArticlesContextValue | null>(null);

type LatestBlogArticlesProviderProps = {
  articles: BlogArticleSummary[];
  children: ReactNode;
};

export function LatestBlogArticlesProvider({
  articles,
  children,
}: LatestBlogArticlesProviderProps) {
  return (
    <LatestBlogArticlesContext.Provider value={{ articles }}>
      {children}
    </LatestBlogArticlesContext.Provider>
  );
}

export function useLatestBlogArticlesContext() {
  const context = useContext(LatestBlogArticlesContext);
  if (!context) {
    throw new Error(
      "useLatestBlogArticlesContext must be used within a LatestBlogArticlesProvider",
    );
  }
  return context;
}
