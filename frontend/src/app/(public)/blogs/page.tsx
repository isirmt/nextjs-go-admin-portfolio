import type { Metadata } from "next";
import { getPublicBlogArticles } from "@/lib/blogs/publicApi";
import PageContentHeader from "@/components/public/pageContentHeader";
import BlogArticleCard from "@/components/blogs/blogArticleCard";

export const metadata: Metadata = {
  title: "ブログ | isirmt",
  description: "isirmt のブログ記事一覧です",
  alternates: { canonical: "/blogs" },
};

export default async function BlogsPage() {
  const articles = await getPublicBlogArticles();

  return (
    <main className="relative w-full pb-40">
      <PageContentHeader>
        <h1 className="text-center text-4xl font-bold">ブログ</h1>
      </PageContentHeader>
      {articles.length ? (
        <div className="mx-auto flex flex-col items-center gap-8 lg:flex-row lg:flex-wrap lg:items-start lg:px-8">
          {articles.map((article) => (
            <BlogArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p>記事はありません</p>
      )}
    </main>
  );
}
