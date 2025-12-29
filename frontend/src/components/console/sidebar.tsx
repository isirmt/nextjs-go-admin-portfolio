"use client";

import { useHamburgerContext } from "@/contexts/hamburgerContext";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ConsoleSidebar() {
  const { data: session } = useSession();
  const { isOpen, setIsOpen } = useHamburgerContext();

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-dvh w-72 bg-[#c6f4ff] pt-20 pb-4 text-[#054a5c] transition-all duration-250 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
    >
      <div className="flex h-full flex-col items-stretch justify-between">
        <div className="relative">
          <div className="relative px-4 py-2 font-normal text-[#222] select-none lg:hidden">
            {session && session?.user?.role === "admin" ? (
              <span className="text-lg font-normal">
                管理者権限でログイン中
              </span>
            ) : (
              <span className="text-lg font-normal">編集権限がありません</span>
            )}
          </div>
          <ul className="relative flex w-full flex-col">
            <li>
              <Link
                onClick={() => setIsOpen(false)}
                className="block w-full rounded px-4 py-2 text-lg font-semibold transition-all hover:bg-[#dcf7fd]"
                href={`/console/works/`}
              >
                投稿管理
              </Link>
            </li>
            <li>
              <Link
                onClick={() => setIsOpen(false)}
                className="block w-full rounded px-4 py-2 text-lg font-semibold transition-all hover:bg-[#dcf7fd]"
                href={`/console/images/`}
              >
                画像管理
              </Link>
            </li>
          </ul>
        </div>
        <Link
          onClick={() => setIsOpen(false)}
          className="block w-full rounded bg-[#effbfd] px-4 py-4 text-xl font-semibold transition-all hover:bg-[#ffffff]"
          href={`/`}
        >
          トップへ戻る
        </Link>
      </div>
    </aside>
  );
}
