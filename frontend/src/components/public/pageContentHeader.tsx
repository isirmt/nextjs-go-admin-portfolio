"use client";

import { useSineClipPath } from "@/hooks/useSineClipPath";
import type { ReactNode } from "react";
import Sparkle from "../shapes/sparkle";

type PageContentHeaderProps = {
  children: ReactNode;
  hideSparkles?: boolean;
};

export default function PageContentHeader({
  children,
  hideSparkles = false,
}: PageContentHeaderProps) {
  const waveRef = useSineClipPath<HTMLDivElement>({ edge: "bottom" });

  return (
    <div
      ref={waveRef}
      className="relative mb-16 flex flex-col items-center gap-2.5 bg-[#ecf3fa] px-12 pt-36 pb-32 select-none"
    >
      {!hideSparkles && (
        <Sparkle
          className={`animate-up-down-smooth absolute top-[10%] -left-[5%] aspect-3/4 w-40 bg-[#cee1fa] opacity-85 sm:left-[5%] md:left-[10%] md:w-65`}
        >
          <div className="animate-up-down-smooth absolute bottom-0 left-0 size-[140%] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#e0ebfa] duration-1000" />
        </Sparkle>
      )}
      {!hideSparkles && (
        <Sparkle
          className={`animate-up-down-smooth absolute top-[30%] -right-[5%] aspect-3/6 w-30 bg-[#e1d9ff] opacity-85 sm:right-[5%] md:right-[10%] md:w-45`}
        >
          <div className="animate-up-down-smooth absolute right-0 bottom-0 size-[140%] translate-x-1/2 translate-y-1/2 rounded-full bg-[#f8f3ff] duration-1000" />
        </Sparkle>
      )}
      {children}
    </div>
  );
}
