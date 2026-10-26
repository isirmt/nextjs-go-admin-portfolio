"use client";

import React from "react";
import LatestArticleLoop from "./latestArticleLoop";
import Link from "next/link";
import { delaGothicOne } from "@/lib/fonts";
import { useLatestBlogArticlesContext } from "@/contexts/latestBlogArticlesContext";

export default function LatestArticleSection() {
  const { articles: latestArticles } = useLatestBlogArticlesContext();
  return (
    <div className="relative my-12 flex w-full flex-col items-center bg-linear-to-br from-[#eafdff] to-[#e6f7ff] py-14">
      <div
        className={`${delaGothicOne.className} text-4xl text-[#6354eb] select-none`}
      >
        最新記事
      </div>
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
