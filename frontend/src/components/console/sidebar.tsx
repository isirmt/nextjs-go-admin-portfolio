"use client";

import Link from "next/link";

export default function ConsoleSidebar() {
  return (
    <aside className="top-0 left-0 h-dvh w-72 bg-[#c6f4ff] pt-20 pb-4 text-[#054a5c] lg:fixed">
      <div className="flex h-full flex-col items-stretch justify-between">
        <ul className="relative flex w-full flex-col">
          <li>
            <Link
              className="block w-full rounded px-4 py-2 text-lg font-semibold transition-all hover:bg-[#dcf7fd]"
              href={`/console/`}
            >
              ホーム
            </Link>
          </li>
          <li>
            <Link
              className="block w-full rounded px-4 py-2 text-lg font-semibold transition-all hover:bg-[#dcf7fd]"
              href={`/console/works/`}
            >
              投稿管理
            </Link>
          </li>
          <li>
            <Link
              className="block w-full rounded px-4 py-2 text-lg font-semibold transition-all hover:bg-[#dcf7fd]"
              href={`/console/images/`}
            >
              画像管理
            </Link>
          </li>
        </ul>
        <Link
          className="block w-full rounded bg-[#effbfd] px-4 py-4 text-xl font-semibold transition-all hover:bg-[#ffffff]"
          href={`/`}
        >
          トップへ戻る
        </Link>
      </div>
    </aside>
  );
}
