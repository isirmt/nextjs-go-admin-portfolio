import type { BlogArticleSummary } from "@/types/blogs/common";

import BlogArticleCard from "./blogArticleCard";

type LatestNewsLoopProps = {
  articles: BlogArticleSummary[];
};

const loopCount = 3;

export default function LatestNewsLoop({ articles }: LatestNewsLoopProps) {
  if (!articles.length) return null;

  return (
    <section className="latest-news-loop-section relative z-10 mb-12 w-screen overflow-x-clip py-12">
      <div className="animate-latest-news-loop flex w-max">
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
