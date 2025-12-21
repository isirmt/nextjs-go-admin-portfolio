"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function SessionButton() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <button className="cursor-pointer" type="button" disabled>
        認証確認中
      </button>
    );
  }

  if (status === "authenticated") {
    return (
      <button
        className="cursor-pointer"
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        ログアウト
      </button>
    );
  }

  return (
    <button
      type="button"
      className="cursor-pointer"
      onClick={() => signIn("google", { callbackUrl: "/console" })}
    >
      Googleでログイン
    </button>
  );
}
