import type { ReactNode } from "react";
import { BlogArticlesProvider } from "@/contexts/blogArticlesContext";
import { BlogSeriesProvider } from "@/contexts/blogSeriesContext";

export default function BlogSeriesLayout({ children }: { children: ReactNode }) {
  return (
    <BlogArticlesProvider>
      <BlogSeriesProvider>{children}</BlogSeriesProvider>
    </BlogArticlesProvider>
  );
}
