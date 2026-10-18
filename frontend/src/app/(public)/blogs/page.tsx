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
      <PageContentHeader hideSparkles>
        <video
          src="/blog_header_mov.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full object-cover opacity-20 select-none"
        />
        <h1
          className={`${delaGothicOne.className} relative z-1 block w-fit bg-[#12385f] text-center text-4xl font-bold text-white`}
        >
          ブログ
        </h1>
      </PageContentHeader>
      <section className="relative w-full lg:px-20">
        <BlogArticlesList articles={articles} />
      </section>
    </main>
  );
}
