import type { Metadata } from "next";
import Link from "next/link";
import { getPublicBlogArticles } from "@/lib/blogs/publicApi";
import PageContentHeader from "@/components/public/pageContentHeader";

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
        <ul className="">
          {articles.map((article) => (
            <li key={article.id}>
              <Link className="block" href={`/blogs/${article.slug}`}>
                <h2 className="text-2xl font-bold">{article.title}</h2>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>記事はありません</p>
      )}
    </main>
  );
}
