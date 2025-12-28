import { auth } from "@/lib/auth/options";
import SessionButton from "./sessionButton";

export default async function ConsoleHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 left-0 z-50 flex h-12 w-full items-center justify-between bg-[#c6f4ff] px-4 text-[#054a5c] select-none">
      <div className="flex w-1/3 items-center justify-center">
        {session && session?.user?.role === "admin" ? (
          <span className="text-lg font-semibold">管理者権限でログイン中</span>
        ) : (
          <span className="text-lg font-semibold">編集権限がありません</span>
        )}
      </div>
      <div className="font-dot flex w-1/3 items-center justify-center gap-2 text-2xl">
        <span>ISIRMT.COM</span>
        <span className="bg-[#054a5c] px-2 text-xl text-[#c6f4ff]">
          CONSOLE
        </span>
      </div>
      <div className="flex w-1/3 items-center justify-center">
        <SessionButton />
      </div>
    </header>
  );
}
