"use client";

import { useSineClipPath } from "@/hooks/useSineClipPath";
import type { ReactNode } from "react";

type PageContentHeaderProps = {
  children: ReactNode;
};

export default function PageContentHeader({
  children,
}: PageContentHeaderProps) {
  const waveRef = useSineClipPath<HTMLDivElement>({ edge: "bottom" });

  return (
    <div
      ref={waveRef}
      className="mb-16 flex flex-col gap-2.5 bg-[#ecf3fa] px-12 pt-36 pb-32 select-none"
    >
      {children}
    </div>
  );
}
