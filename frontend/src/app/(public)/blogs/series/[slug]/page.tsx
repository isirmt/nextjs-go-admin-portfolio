import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArticlesList from "@/components/blogs/blogArticlesList";
import PageContentHeader from "@/components/public/pageContentHeader";
import { delaGothicOne } from "@/lib/fonts";
import { getPublicBlogSeries } from "@/lib/blogs/publicApi";
import Link from "next/link";
import Arrow from "@/components/shapes/arrow";

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
          className={`${delaGothicOne.className} relative z-1 text-center text-4xl font-bold text-[#12385f]`}
        >
          『{series.title}』
        </h1>
        {series.description ? (
          <p className="relative z-1 text-center font-mono text-lg text-[#12385f]">
            {series.description}
          </p>
        ) : null}
      </PageContentHeader>
      <section className="relative w-full lg:px-20">
        <div className="mb-2 flex w-full flex-col items-start px-4">
          <Link
            href="/blogs"
            className="inline-flex w-fit items-center gap-2 border-b border-transparent pt-1.5 hover:border-[#555]"
          >
            <Arrow className="size-8 rotate-180 stroke-[#555]" />
            <span className="font-mono text-lg leading-none font-semibold text-[#555]">
              投稿一覧に戻る
            </span>
          </Link>
        </div>
        <BlogArticlesList
          articles={series.articles}
          defaultSort="initial"
          showInitialSort
        />
      </section>
    </main>
  );
}
