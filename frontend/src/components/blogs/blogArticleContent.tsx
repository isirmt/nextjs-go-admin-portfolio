"use client";
import type { BlogArticle } from "@/types/blogs/common";
import BlogMarkdownPreview from "./blogMarkdownPreview";
import { useSineClipPath } from "@/hooks/useSineClipPath";
import { lineSeedJp } from "@/lib/fonts";
import DateCard from "./dateCard";

type BlogArticleContentProps = {
  article: BlogArticle;
};

export default function BlogArticleContent({
  article,
}: BlogArticleContentProps) {
  const waveRef = useSineClipPath<HTMLDivElement>({ edge: "bottom" });

  return (
    <article className="w-full relative">
      <nav ref={waveRef} className="bg-[#ecf3fa] flex flex-col gap-2.5 px-12 pt-36 pb-32 mb-12">
        {article.status === "draft" && <span className="mr-1 bg-[#53ceff] w-fit rounded text-[#0b303f] font-bold px-1 py-0.5">下書き</span>}
        <DateCard date={article.published_at ?? article.created_at} />
        <h1 className={`${lineSeedJp.className} text-[#202733] text-3xl lg:text-4xl font-bold`}>{article.title}</h1>
      </nav>
      <BlogMarkdownPreview content={article.body_markdown} />
    </article>
  );
}
