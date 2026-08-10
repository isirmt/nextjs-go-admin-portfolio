"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { HeroPageDefinition } from "../../types/hero/types";

type HeroDeckControls = {
  currentPageId: string;
  currentPageIndex: number;
  pageCount: number;
  goTo: (pageId: string) => boolean;
  next: () => void;
};

const HeroDeckContext = createContext<HeroDeckControls | null>(null);

export function useHeroDeck() {
  const context = useContext(HeroDeckContext);

  if (!context) {
    throw new Error("useHeroDeck must be used within HeroDeck");
  }

  return context;
}

type HeroDeckProps = {
  pages: readonly HeroPageDefinition[];
  initialPageId?: string;
  activePageId?: string;
  loop?: boolean;
  onPageChange?: (pageId: string) => void;
  children?: ReactNode;
};

export default function HeroDeck({
  pages,
  initialPageId,
  activePageId,
  loop = true,
  onPageChange,
  children,
}: HeroDeckProps) {
  const [internalPageId, setInternalPageId] = useState(
    () => initialPageId ?? pages[0]?.id ?? "",
  );
  const requestedPageId = activePageId ?? internalPageId;
  const requestedPageIndex = pages.findIndex(
    (page) => page.id === requestedPageId,
  );
  const currentPageIndex = requestedPageIndex >= 0 ? requestedPageIndex : 0;
  const currentPage = pages[currentPageIndex];
  const currentPageId = currentPage?.id ?? "";

  const goTo = useCallback(
    (pageId: string) => {
      if (
        pageId === currentPageId ||
        !pages.some((page) => page.id === pageId)
      ) {
        return false;
      }

      if (activePageId === undefined) {
        setInternalPageId(pageId);
      }
      onPageChange?.(pageId);
      return true;
    },
    [activePageId, currentPageId, onPageChange, pages],
  );

  const next = useCallback(() => {
    if (pages.length < 2) return;

    const nextIndex = currentPageIndex + 1;
    if (nextIndex < pages.length) {
      goTo(pages[nextIndex].id);
      return;
    }
    if (loop) {
      goTo(pages[0].id);
    }
  }, [currentPageIndex, goTo, loop, pages]);

  const controls = useMemo<HeroDeckControls>(
    () => ({
      currentPageId,
      currentPageIndex,
      pageCount: pages.length,
      goTo,
      next,
    }),
    [currentPageId, currentPageIndex, goTo, next, pages.length],
  );

  if (!currentPage) {
    return null;
  }

  return (
    <HeroDeckContext.Provider value={controls}>
      <div className="relative size-full overflow-hidden">
        <div
          className="ease-over flex size-full transform-gpu transition-transform duration-850 will-change-transform"
          style={{
            transform: `translate3d(-${currentPageIndex * 100}%, 0, 0)`,
          }}
        >
          {pages.map((page, pageIndex) => {
            const Page = page.Component;
            const isActive = pageIndex === currentPageIndex;

            return (
              <div
                key={page.id}
                className={`relative size-full shrink-0 ${isActive ? "" : "pointer-events-none"}`}
                inert={!isActive}
              >
                <Page />
              </div>
            );
          })}
        </div>
      </div>
      {children}
    </HeroDeckContext.Provider>
  );
}
