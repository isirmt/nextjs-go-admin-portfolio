/* eslint-disable @next/next/no-img-element */
"use client";
import type { BlogArticle } from "@/types/blogs/common";
import BlogMarkdownPreview from "./blogMarkdownPreview";
import { lineSeedJp } from "@/lib/fonts";
import DateCard from "./dateCard";
import PageContentHeader from "../public/pageContentHeader";
import Link from "next/link";
import Arrow from "../shapes/arrow";
import BlogArticleTagList from "./blogArticleTagList";

type BlogArticleContentProps = {
  article: BlogArticle;
};

export default function BlogArticleContent({
  article,
}: BlogArticleContentProps) {
  return (
    <article className="relative w-full">
      <PageContentHeader>
        <img
          className="pointer-events-none absolute top-0 right-0 z-0 hidden aspect-1200/630 h-full object-contain opacity-40 select-none xl:block"
          src={`/blogs/${article.slug}/og-image`}
          alt={article.title}
        />
        <div className="absolute top-0 right-0 z-1 hidden aspect-1200/630 h-full bg-linear-to-r from-[#ecf3fa] to-transparent xl:block" />
        <div className="relative z-2 flex size-full flex-col gap-2.5">
          {article.status === "draft" && (
            <span className="mr-1 w-fit rounded bg-[#53ceff] px-1 py-0.5 font-bold text-[#0b303f]">
              下書き
            </span>
          )}
          <DateCard date={article.published_at ?? article.created_at} />
          <h1
            className={`${lineSeedJp.className} text-3xl font-bold text-[#202733] select-text lg:text-4xl`}
          >
            {article.title}
          </h1>
          {article.tags.length ? (
            <BlogArticleTagList tags={article.tags} />
          ) : null}
        </div>
      </PageContentHeader>
      <div className="mx-auto mb-2 flex w-full max-w-[960px] flex-col items-start px-4">
        <Link
          href="/blogs"
          className="inline-flex w-fit items-center gap-2 border-b border-transparent pt-1.5 hover:border-[#555]"
        >
          <Arrow className="size-8 rotate-180 stroke-[#555]" />
          <span className="font-mono text-lg leading-none font-semibold text-[#555]">
            投稿一覧に戻る
          </span>
        </Link>
      </div>
      <div className="mx-auto flex w-full max-w-[960px] flex-col items-end px-4">
        {article.series.map((series) => (
          <Link
            key={series.id}
            href={`/blogs/series/${series.slug}`}
            className="inline-flex w-fit items-center gap-2 border-b border-transparent pt-1.5 hover:border-[#3651ca]"
          >
            <span className="font-mono text-lg leading-none font-semibold text-[#3651ca]">
              シリーズ『{series.title}』
            </span>
            <Arrow className="size-8 stroke-[#3651ca]" />
          </Link>
        ))}
        <BlogMarkdownPreview content={article.body_markdown} />
      </div>
    </article>
  );
}
