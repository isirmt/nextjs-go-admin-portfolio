import type { BlogArticleSummary } from "@/types/blogs/common";

import BlogArticleCard from "./blogArticleCard";

type LatestArticleLoopProps = {
  articles: BlogArticleSummary[];
};

const loopCount = 3;

export default function LatestArticleLoop({
  articles,
}: LatestArticleLoopProps) {
  if (!articles.length) return null;

  return (
    <section className="latest-article-loop-section relative z-10 mb-12 w-screen overflow-x-clip py-12">
      <div className="animate-latest-article-loop flex w-max">
        {Array.from({ length: loopCount }, (_, loopIndex) => (
          <div key={loopIndex} className="flex shrink-0 gap-8 pr-8">
            {articles.map((article) => (
              <BlogArticleCard
                key={`${loopIndex}-${article.id}`}
                article={article}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
