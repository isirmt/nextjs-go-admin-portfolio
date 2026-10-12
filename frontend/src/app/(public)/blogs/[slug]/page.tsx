import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArticleContent from "@/components/blogs/blogArticleContent";
import BlogTableOfContents from "@/components/blogs/blogTableOfContents";
import { getPublicBlogArticle } from "@/lib/blogs/publicApi";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublicBlogArticle(slug);
  if (!article) return {};

  return {
    title: `${article.title} | isirmt`,
    alternates: { canonical: `/blogs/${article.slug}` },
  };
}

export default async function BlogArticlePage({
  params,
}: BlogArticlePageProps) {
  const { slug } = await params;
  const article = await getPublicBlogArticle(slug);
  if (!article) notFound();

  return (
    <main className="relative w-full">
      <section className="grid grid-cols-3">
        <div className="col-span-3 pb-40 lg:col-span-2">
          <BlogArticleContent article={article} />
        </div>
        <aside className="col-span-1 hidden bg-[#fafafa] pb-40 lg:block">
          <div className="sticky top-4 self-start">
            <BlogTableOfContents
              content={article.body_markdown}
              title={article.title}
            />
          </div>
        </aside>
      </section>
      <section />
    </main>
  );
}
