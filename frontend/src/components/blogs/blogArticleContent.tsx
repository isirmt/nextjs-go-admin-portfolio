"use client";
import type { BlogArticle } from "@/types/blogs/common";
import BlogMarkdownPreview from "./blogMarkdownPreview";
import { lineSeedJp } from "@/lib/fonts";
import DateCard from "./dateCard";
import PageContentHeader from "../public/pageContentHeader";

type BlogArticleContentProps = {
  article: BlogArticle;
};

export default function BlogArticleContent({
  article,
}: BlogArticleContentProps) {
  return (
    <article className="relative w-full">
      <PageContentHeader>
        {article.status === "draft" && (
          <span className="mr-1 w-fit rounded bg-[#53ceff] px-1 py-0.5 font-bold text-[#0b303f]">
            下書き
          </span>
        )}
        <DateCard date={article.published_at ?? article.created_at} />
        <h1
          className={`${lineSeedJp.className} text-3xl font-bold text-[#202733] lg:text-4xl`}
        >
          {article.title}
        </h1>
      </PageContentHeader>
      <div className="mx-auto px-4 lg:px-0 w-full max-w-[960px]">
        <BlogMarkdownPreview content={article.body_markdown} />
      </div>
    </article>
  );
}
