"use client";

import HeroDeck, { useHeroDeck } from "./deck";
import { heroPages } from "./pages/registry";

function HeroPageNavigation() {
  const { autoPagination, currentPageId, goTo, isTransitioning, pageCount } =
    useHeroDeck();

  return (
    <ul className="absolute bottom-0 left-0 z-10 flex gap-6 p-6">
      {heroPages.map((page, index) => {
        const isCurrent = page.id === currentPageId;
        const showDuration =
          autoPagination && isCurrent && !isTransitioning && pageCount > 1;

        return (
          <li key={page.id} className="relative">
            {showDuration ? (
              <svg
                className="pointer-events-none absolute top-1/2 left-1/2 z-20 size-[52px] -translate-x-1/2 -translate-y-1/2 rotate-45 overflow-visible"
                viewBox="0 0 52 52"
              >
                <rect
                  className="hero-scene-duration-stroke"
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="3"
                  strokeLinecap="round"
                  x="2"
                  y="2"
                  width="48"
                  height="48"
                  rx="6"
                  strokeDasharray="182"
                  strokeDashoffset="182"
                  style={{ animationDuration: `${page.durationMs}ms` }}
                />
              </svg>
            ) : null}
            <button
              type="button"
              onClick={() => goTo(page.id)}
              className={`font-dot relative z-10 flex size-10 items-center justify-center rounded border-2 border-[#F43F5E] text-xl font-bold shadow transition-all select-none ${isCurrent ? "pointer-events-none rotate-45 bg-[#F43F5E] text-white" : "cursor-pointer bg-white text-[#F43F5E]"}`}
            >
              <span
                className={`transition-all ${isCurrent ? "-rotate-45" : ""}`}
              >
                {index + 1}
              </span>
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
      <HeroDeck pages={heroPages} initialPageId="opening" autoPagination loop>
        <HeroPageNavigation />
      </HeroDeck>
    </div>
  );
}
