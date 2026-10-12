/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { getPublicBlogArticles } from "@/lib/blogs/publicApi";
import PageContentHeader from "@/components/public/pageContentHeader";
import { formatJapaneseDateTime } from "@/lib/date";

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
        <div className="flex flex-wrap gap-8">
          {articles.map((article) => (
            <div
              key={article.id}
              className="group ease-over relative w-84 filter-[drop-shadow(0.5rem_0.5rem_0_#c5dbec)] transition-all hover:scale-105 hover:-rotate-3"
            >
              <Link
                className="font-noto ease-over before:ease-over relative block rounded-lg border border-[#c5dbec] bg-[#f6faff] p-3 transition-[clip-path] duration-300 [clip-path:polygon(2.5rem_0,100%_0,100%_100%,0_100%,0_2.5rem)] group-hover:[clip-path:polygon(3.5rem_0,100%_0,100%_100%,0_100%,0_3.5rem)] before:absolute before:-top-1 before:-left-1 before:z-10 before:size-[calc(2.5rem+2px)] before:rounded-br-lg before:bg-[#c5dbec] before:transition-[width,height] before:duration-300 before:[clip-path:polygon(100%_0,100%_100%,0_100%)] group-hover:before:size-[calc(3.5rem+2px)]"
                href={`/blogs/${article.slug}`}
              >
                <div className="relative flex aspect-1200/630 w-full items-center justify-center overflow-hidden">
                  <img
                    className="pointer-events-none absolute rounded-xs select-none"
                    src={`/blogs/${article.slug}/og-image`}
                    alt={article.title}
                  />
                </div>
                <div className="mt-2 leading-6">
                  <p className="w-full text-sm text-[#777]">
                    {formatJapaneseDateTime(article.published_at)}
                  </p>
                  <p className="w-full truncate text-lg font-semibold text-[#333c66]">
                    {article.title}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p>記事はありません</p>
      )}
    </main>
  );
}
