import Link from "next/link";

export default function Forbidden() {
  return (
    <main className="font-noto relative flex h-dvh w-full flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-black text-[#555]">403 Forbidden</h1>
      <div className="text-xl font-black text-[#555]">
        お使いのアカウントは管理者権限をお持ちでないため編集できません&nbsp;&gt;&lt;
      </div>
      <div>
        <Link
          href="/console/works"
          className="border-b text-xl leading-none font-bold text-[#361ea5] hover:text-[#361ea5]/70"
        >
          ダッシュボードへ戻る
        </Link>
      </div>
    </main>
  );
}
