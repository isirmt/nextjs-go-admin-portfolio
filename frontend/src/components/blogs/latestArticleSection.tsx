/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import LatestArticleLoop from "./latestArticleLoop";
import Link from "next/link";
import { delaGothicOne, lineSeedJp } from "@/lib/fonts";
import { useLatestBlogArticlesContext } from "@/contexts/latestBlogArticlesContext";
import BlogArticleTagList from "./blogArticleTagList";
import DateCard from "./dateCard";

export default function LatestArticleSection() {
  const { articles: latestArticles } = useLatestBlogArticlesContext();
  if (!latestArticles || latestArticles.length === 0) {
    return null;
  }

  const latestArticle = latestArticles[0];

  return (
    <div className="relative my-12 flex w-full flex-col items-center bg-linear-to-br from-[#eafdff] to-[#e6f7ff] py-14 select-none">
      <div
        className={`${delaGothicOne.className} text-4xl text-[#6354eb] select-none`}
      >
        最新記事
      </div>
      <Link
        href={`/blogs/${latestArticle.slug}`}
        className="relative my-12 grid w-full grid-cols-1 gap-y-10 px-8 transition-all duration-200 hover:opacity-80 lg:grid-cols-2"
      >
        <div className="relative flex items-center justify-center px-4">
          <div className="relative flex aspect-1200/630 w-full max-w-[700px] items-center justify-center overflow-hidden">
            <img
              className="pointer-events-none absolute rounded-lg select-none"
              src={`/blogs/${latestArticle.slug}/og-image`}
              alt={latestArticle.title}
            />
          </div>
        </div>
        <div className="relative flex items-end px-4">
          <div className="relative flex w-full flex-col gap-3.5">
            <DateCard
              date={latestArticle.published_at ?? latestArticle.created_at}
            />
            <div
              className={`${lineSeedJp.className} text-3xl font-bold text-[#202733]`}
            >
              {latestArticle.title}
            </div>
            {latestArticle.tags.length ? (
              <BlogArticleTagList tags={latestArticle.tags} />
            ) : null}
            <div className="font-noto leading-[1.75] text-[#222]">
              {latestArticle.excerpt}
            </div>
          </div>
        </div>
      </Link>
      <LatestArticleLoop articles={latestArticles} />
      <Link
        href="/blogs"
        className={`font-noto rounded-full border bg-white px-3 py-2 text-xl text-[#6354EB] transition-[background-color,color,scale] duration-[250ms,250ms,500ms] ease-[linear,linear,cubic-bezier(0.34,1.56,0.64,1)] select-none hover:scale-110 hover:bg-[#e4e0ff]`}
      >
        ブログ投稿一覧へ
      </Link>
    </div>
  );
}
