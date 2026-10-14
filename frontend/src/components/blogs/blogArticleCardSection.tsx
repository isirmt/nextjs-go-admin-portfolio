import { lineSeedJp } from "@/lib/fonts";
import type { BlogArticleSummary } from "@/types/blogs/common";
import BlogArticleCard from "./blogArticleCard";
import BlogArticleTagList from "./blogArticleTagList";

type BlogArticleCardSectionProps = {
  articles: BlogArticleSummary[];
  title: string;
};

export default function BlogArticleCardSection({
  articles,
  title,
}: BlogArticleCardSectionProps) {
  if (!articles.length) return null;

  return (
    <section className="relative -mt-20 w-full rounded-t-4xl bg-[#f0f4ff] pt-12 pb-40">
      <h2
        className={`${lineSeedJp.className} mb-8 text-center text-4xl font-bold text-[#2f4a68] select-none`}
      >
        {title}
      </h2>
      <div className="flex flex-wrap justify-center gap-8 px-4">
        {articles.map((article) => (
          <div className="flex shrink-0 flex-col gap-2.5" key={article.id}>
            <BlogArticleCard article={article} />
            <BlogArticleTagList tags={article.tags} />
          </div>
        ))}
      </div>
    </section>
  );
}
