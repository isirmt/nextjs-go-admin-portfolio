"use client";

import { useCallback } from "react";
import HeroDeck from "./deck";
import { heroPages } from "./pages/registry";

export default function HeroSection() {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, pageId: string) => {
      e.preventDefault();
      console.log(`${pageId}`);
    },
    [],
  );

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <h1 className="hidden" aria-hidden="true">
        色彩と体験
      </h1>
      <ul className="absolute bottom-0 left-0 z-100 flex gap-4 p-6">
        {heroPages.map((page, index) => (
          <li key={page.id} className="relative">
            <button
              onClick={(e) => handleClick(e, page.id)}
              className="font-dot flex size-10 cursor-pointer items-center justify-center rounded border border-[#111] bg-white text-xl font-bold text-[#111] shadow"
            >
              {index + 1}
            </button>
          </li>
        ))}
      </ul>
      <HeroDeck pages={heroPages} initialPageId="portfolio" loop />
    </div>
  );
}
