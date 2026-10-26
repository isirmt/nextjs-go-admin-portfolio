"use client";

import type { BlogArticleSummary } from "@/types/blogs/common";
import { createContext, useContext, type ReactNode } from "react";

type LatestBlogArticleContextValue = {
  article: BlogArticleSummary | null;
};

const LatestBlogArticleContext =
  createContext<LatestBlogArticleContextValue | null>(null);

type LatestBlogArticleProviderProps = {
  article: BlogArticleSummary | null;
  children: ReactNode;
};

export function LatestBlogArticleProvider({
  article,
  children,
}: LatestBlogArticleProviderProps) {
  return (
    <LatestBlogArticleContext.Provider value={{ article }}>
      {children}
    </LatestBlogArticleContext.Provider>
  );
}

export function useLatestBlogArticleContext() {
  const context = useContext(LatestBlogArticleContext);
  if (!context) {
    throw new Error(
      "useLatestBlogArticleContext must be used within a LatestBlogArticleProvider",
    );
  }
  return context;
}
