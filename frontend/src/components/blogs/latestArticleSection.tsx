/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import LatestArticleLoop from "./latestArticleLoop";
import Link from "next/link";
import { lineSeedJp, smoochSans } from "@/lib/fonts";
import { useLatestBlogArticlesContext } from "@/contexts/latestBlogArticlesContext";
import BlogArticleTagList from "./blogArticleTagList";
import DateCard from "./dateCard";
import { useSineClipPath } from "@/hooks/useSineClipPath";

export default function LatestArticleSection() {
  const waveRef = useSineClipPath<HTMLDivElement>({ edge: "bottom" });
  const { articles: latestArticles } = useLatestBlogArticlesContext();
  if (!latestArticles || latestArticles.length === 0) {
    return null;
  }

  const latestArticle = latestArticles[0];

  return (
    <div
      ref={waveRef}
      className="relative z-1 -mb-20 flex w-full flex-col items-center bg-linear-to-br from-[#eafdff] to-[#e6f7ff] pt-32 pb-24 select-none"
    >
      <h2
        className={`${smoochSans.className} origin-bottom-left text-center text-5xl font-bold text-[#6354eb] select-none md:text-7xl`}
      >
        Latest Articles
      </h2>
      <Link
        href={`/blogs/${latestArticle.slug}`}
        className="relative my-12 grid w-full grid-cols-1 gap-y-10 px-8 transition-all duration-200 hover:opacity-80 lg:grid-cols-2"
      >
        <div className="relative flex items-center justify-center px-4">
          <div className="relative flex aspect-1200/630 w-full max-w-[700px] items-center justify-center overflow-hidden">
            <img
              className="pointer-events-none absolute rounded-lg select-none"
              src={
                latestArticle.thumbnail_image_id
                  ? `/blogs/${latestArticle.slug}/og-image`
                  : "/blog_isirmt_com_ogp.png"
              }
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
        className={`font-noto relative overflow-hidden rounded-full bg-[#4f89a3] px-6 py-3 text-xl font-bold text-[#e7f3ff] filter-[drop-shadow(0.2rem_0.2rem_0_#c5dbec)] transition-colors select-none before:pointer-events-none before:absolute before:inset-y-0 before:-left-[75%] before:w-1/3 before:-skew-x-20 before:bg-white/50 before:transition-transform before:duration-400 hover:bg-[#649ac0] hover:before:translate-x-[450%]`}
      >
        <span className="relative z-10 tracking-wide">投稿一覧</span>
      </Link>
    </div>
  );
}
