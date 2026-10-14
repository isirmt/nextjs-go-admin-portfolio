import type { Metadata } from "next";
import { getPublicBlogArticles } from "@/lib/blogs/publicApi";
import PageContentHeader from "@/components/public/pageContentHeader";
import BlogArticleCard from "@/components/blogs/blogArticleCard";
import { delaGothicOne } from "@/lib/fonts";
import React from "react";

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
        <h1
          className={`${delaGothicOne.className} text-center text-4xl font-bold text-[#12385f]`}
        >
          ブログ
        </h1>
      </PageContentHeader>
      {articles.length ? (
        <div className="mx-auto flex w-full flex-wrap justify-center gap-8 px-4 select-none">
          {articles.map((article) => (
            <div className="flex shrink-0 flex-col gap-2.5" key={article.id}>
              <BlogArticleCard article={article} />
              <div className="flex w-84 flex-wrap justify-start gap-3">
                {article.tags.map((tag) => (
                  <div
                    key={tag.id}
                    className={`relative flex scale-y-110 items-center gap-3 overflow-hidden bg-[#2a7186] px-2 py-px tracking-[.1rem] shadow-[.125rem_.125rem_0_0_#67c8e6] transition-all duration-150`}
                  >
                    <span className="font-dot text-lg leading-none text-[#98e3fa]">
                      {tag.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>記事はありません</p>
      )}
    </main>
  );
}
