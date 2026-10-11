import Link from "next/link";

export default function BlogsViewer() {
  return (
    <main className="relative w-full space-y-8 px-2.5 py-8 lg:px-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#7e11d1]">ブログ管理</h1>
        <Link
          className="bg-[#67c8e6] px-4 py-2 text-lg font-bold text-white transition hover:bg-[#65b9d2]"
          href="/console/blogs/new"
        >
          新規記事を作成
        </Link>
      </div>
      <section
        aria-labelledby="blog-articles-heading"
        className="space-y-4 bg-[#f8f8f8] p-4"
      >
        <h2 id="blog-articles-heading" className="font-semibold text-[#7e11d1]">
          記事一覧
        </h2>
        <ul className="flex flex-col gap-4">
          <li className="border border-dashed border-[#c68ef0] bg-white px-4 py-8 text-center text-sm text-[#7e11d1]">
            記事リスト
          </li>
        </ul>
      </section>
    </main>
  );
}
