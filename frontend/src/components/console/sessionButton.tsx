"use client";

import { LogInIcon, LogOutIcon } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "cn";
import { Button } from "@/components/shadcn/ui/button";

type SessionButtonProps = {
  className?: string;
  compact?: boolean;
};

export default function SessionButton({
  className,
  compact = false,
}: SessionButtonProps) {
  const { status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const callbackUrl = query ? `${pathname}?${query}` : pathname;
  const compactLabelClass = compact
    ? "max-w-48 overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 lg:max-w-0 lg:-translate-x-2 lg:opacity-0"
    : undefined;

  if (status === "loading") {
    return (
      <Button
        type="button"
        variant="outline"
        className={className}
        disabled
        title={compact ? "認証確認中" : undefined}
      >
        <LogInIcon />
        <span className={compactLabelClass}>認証確認中</span>
      </Button>
    );
  }

  if (status === "authenticated") {
    return (
      <Button
        type="button"
        variant="outline"
        className={className}
        title={compact ? "ログアウト" : undefined}
        onClick={() => signOut()}
      >
        <LogOutIcon />
        <span className={compactLabelClass}>ログアウト</span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      className={cn(className)}
      title={compact ? "ログイン" : undefined}
      onClick={() => signIn("google", { callbackUrl })}
    >
      <LogInIcon />
      <span className={compactLabelClass}>ログイン</span>
    </Button>
  );
}
