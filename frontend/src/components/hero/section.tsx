"use client";

import HeroDeck, { useHeroDeck } from "./deck";
import { heroPages } from "./pages/registry";

function HeroPageNavigation() {
  const { currentPageId, goTo } = useHeroDeck();

  return (
    <ul className="absolute bottom-0 left-0 z-100 flex gap-4 p-6">
      {heroPages.map((page, index) => {
        const isCurrent = page.id === currentPageId;

        return (
          <li key={page.id} className="relative">
            <button
              type="button"
              onClick={() => goTo(page.id)}
              className={`font-dot flex size-10 cursor-pointer items-center justify-center rounded border text-xl font-bold shadow transition-colors ${isCurrent ? "border-[#F43F5E] bg-[#F43F5E] text-white" : "border-[#111] bg-white text-[#111]"}`}
            >
              {index + 1}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function HeroSection() {
  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <h1 className="hidden" aria-hidden="true">
        色彩と体験
      </h1>
      <HeroDeck pages={heroPages} initialPageId="portfolio" loop>
        <HeroPageNavigation />
      </HeroDeck>
    </div>
  );
}
