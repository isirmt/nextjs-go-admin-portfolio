import type { Metadata } from "next";
import { getPublicBlogArticles } from "@/lib/blogs/publicApi";
import PageContentHeader from "@/components/public/pageContentHeader";
import BlogArticleCard from "@/components/blogs/blogArticleCard";
import BlogArticleTagList from "@/components/blogs/blogArticleTagList";
import { delaGothicOne } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "ブログ | isirmt",
  description: "isirmt のブログ記事一覧です",
  alternates: { canonical: "/blogs" },
};

export default async function BlogsPage() {
  const articles = await getPublicBlogArticles();

  return (
    <main className="relative w-full pb-40">
      <PageContentHeader>
        <h1
          className={`${delaGothicOne.className} text-center text-4xl font-bold text-[#12385f]`}
        >
          ブログ
        </h1>
      </PageContentHeader>
      {articles.length ? (
        <div className="mx-auto flex w-full flex-wrap justify-center gap-8 px-4 select-none">
          {articles.map((article) => (
            <div className="flex shrink-0 flex-col gap-2.5" key={article.id}>
              <BlogArticleCard article={article} />
              <BlogArticleTagList tags={article.tags} />
            </div>
          ))}
        </div>
      ) : (
        <p>記事はありません</p>
      )}
    </main>
  );
}
