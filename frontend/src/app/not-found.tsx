import Link from "next/link";

export default function NotFound() {
  return (
    <main className="font-noto relative flex h-dvh w-full flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-black text-[#555]">404 Not Found</h1>
      <div className="text-xl font-black text-[#555]">
        お探しのページは見つかりませんでした&nbsp;&gt;&lt;
      </div>
      <div>
        <Link
          href="/"
          className="border-b text-xl leading-none font-bold text-[#361ea5] hover:text-[#361ea5]/70"
        >
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
