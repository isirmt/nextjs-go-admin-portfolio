import type { Metadata } from "next";
import { getPublicBlogArticles } from "@/lib/blogs/publicApi";
import PageContentHeader from "@/components/public/pageContentHeader";
import BlogArticlesList from "@/components/blogs/blogArticlesList";
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
      <section className="relative w-full px-20">
        <BlogArticlesList articles={articles} />
      </section>
    </main>
  );
}
