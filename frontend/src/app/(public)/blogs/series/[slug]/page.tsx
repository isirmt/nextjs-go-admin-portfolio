import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArticlesList from "@/components/blogs/blogArticlesList";
import PageContentHeader from "@/components/public/pageContentHeader";
import { delaGothicOne } from "@/lib/fonts";
import { getPublicBlogSeries } from "@/lib/blogs/publicApi";

type BlogSeriesPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogSeriesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const series = await getPublicBlogSeries(slug);
  if (!series) return {};

  return {
    title: `『${series.title}』 | isirmt`,
    description:
      series.description ?? `『${series.title}』のブログのシリーズです`,
    alternates: { canonical: `/blogs/series/${series.slug}` },
  };
}

export default async function BlogSeriesPage({ params }: BlogSeriesPageProps) {
  const { slug } = await params;
  const series = await getPublicBlogSeries(slug);
  if (!series) notFound();

  return (
    <main className="relative w-full pb-40">
      <PageContentHeader>
        <h1
          className={`${delaGothicOne.className} text-center text-4xl font-bold text-[#12385f]`}
        >
          『{series.title}』
        </h1>
        {series.description ? (
          <p className="text-center font-mono text-lg text-[#12385f]">
            {series.description}
          </p>
        ) : null}
      </PageContentHeader>
      <section className="relative w-full px-20">
        <BlogArticlesList
          articles={series.articles}
          defaultSort="initial"
          showInitialSort
        />
      </section>
    </main>
  );
}
