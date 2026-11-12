/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { formatJapaneseLongDate } from "@/lib/date";
import type { BlogArticleSummary } from "@/types/blogs/common";

type BlogArticleCardProps = {
  article: BlogArticleSummary;
};

export default function BlogArticleCard({ article }: BlogArticleCardProps) {
  return (
    <div className="group ease-over relative w-84 filter-[drop-shadow(0.2rem_0.2rem_0_#c5dbec)] transition-all select-none hover:scale-105 hover:-rotate-3">
      <Link
        className="font-noto ease-over before:ease-over relative block overflow-hidden rounded-lg border border-[#c5dbec] bg-[#f6faff] transition-[clip-path] duration-300 [clip-path:polygon(2.5rem_0,100%_0,100%_100%,0_100%,0_2.5rem)] group-hover:[clip-path:polygon(3.5rem_0,100%_0,100%_100%,0_100%,0_3.5rem)] before:absolute before:-top-1 before:-left-1 before:z-10 before:size-[calc(2.5rem+6px)] before:rounded-br-lg before:bg-[#c5dbec] before:transition-[width,height] before:duration-300 before:[clip-path:polygon(100%_0,100%_100%,0_100%)] group-hover:before:size-[calc(3.5rem+6px)]"
        href={`/blogs/${article.slug}`}
      >
        <img
          className="pointer-events-none block aspect-1200/630 w-full object-cover select-none"
          src={`/blogs/${article.slug}/og-image`}
          alt={article.title}
        />
        <div className="px-3 pt-2 pb-3 leading-6">
          <p className="w-full text-sm text-[#777]">
            {article.published_at
              ? formatJapaneseLongDate(article.published_at)
              : ""}
          </p>
          <p className="w-full truncate text-lg font-semibold text-[#333c66]">
            {article.title}
          </p>
        </div>
      </Link>
    </div>
  );
}
