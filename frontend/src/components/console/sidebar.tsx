"use client";

import Link from "next/link";

export default function ConsoleSidebar() {
  return (
    <aside className="top-0 left-0 h-dvh w-72 bg-[#c6f4ff] pt-20 pb-4 text-[#054a5c] lg:fixed">
      <div className="flex h-full flex-col items-stretch justify-between">
        <ul>
          <li>
            <Link href={`/console/`}>ホーム</Link>
          </li>
          <li>
            <Link href={`/console/works`}>投稿管理</Link>
          </li>
          <li>
            <Link href={`/console/images`}>画像管理</Link>
          </li>
        </ul>
        <Link href={`/`}>トップへ戻る</Link>
      </div>
    </aside>
  );
}
