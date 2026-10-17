import type { ReactNode } from "react";
import { BlogArticlesProvider } from "@/contexts/blogArticlesContext";

export default function BlogsLayout({ children }: { children: ReactNode }) {
  return <BlogArticlesProvider>{children}</BlogArticlesProvider>;
}
