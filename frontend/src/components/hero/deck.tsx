"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { HeroPageDefinition } from "../../types/hero/types";

type HeroDeckControls = {
  currentPageId: string;
  currentPageIndex: number;
  isTransitioning: boolean;
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

const HERO_FRAME_SHRINK_DURATION_MS = 350;
const HERO_PHASE_GAP_MS = 200;
const HERO_TRACK_DURATION_MS = 1000;
const HERO_FRAME_RESTORE_DURATION_MS = 350;
const HERO_TRACK_DELAY_MS = HERO_FRAME_SHRINK_DURATION_MS + HERO_PHASE_GAP_MS;
const HERO_FRAME_RESTORE_START_MS =
  HERO_TRACK_DELAY_MS + HERO_TRACK_DURATION_MS + HERO_PHASE_GAP_MS;
const HERO_FRAME_DURATION_MS =
  HERO_FRAME_RESTORE_START_MS + HERO_FRAME_RESTORE_DURATION_MS;
const HERO_FRAME_SHRINK_END_OFFSET =
  HERO_FRAME_SHRINK_DURATION_MS / HERO_FRAME_DURATION_MS;
const HERO_FRAME_RESTORE_START_OFFSET =
  HERO_FRAME_RESTORE_START_MS / HERO_FRAME_DURATION_MS;
const HERO_TRACK_EASING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

const HERO_FRAME_KEYFRAMES: Keyframe[] = [
  {
    borderRadius: "0",
    transform: "scale3d(1, 1, 1)",
    borderColor: "transparent",
    borderWidth: "0",
    offset: 0,
    easing: "linear",
  },
  {
    borderRadius: "4rem",
    transform: "scale3d(0.9, 0.9, 1)",
    borderColor: "#525eeb",
    borderWidth: "4px",
    offset: HERO_FRAME_SHRINK_END_OFFSET,
    easing: "linear",
  },
  {
    borderRadius: "4rem",
    transform: "scale3d(0.9, 0.9, 1)",
    borderColor: "#525eeb",
    borderWidth: "4px",
    offset: HERO_FRAME_RESTORE_START_OFFSET,
    easing: "linear",
  },
  {
    borderRadius: "0",
    transform: "scale3d(1, 1, 1)",
    borderColor: "transparent",
    borderWidth: "0",
    offset: 1,
  },
];

const HERO_CONTENT_KEYFRAMES: Keyframe[] = [
  {
    transform: "scale3d(1, 1, 1)",
    offset: 0,
    easing: "linear",
  },
  {
    transform: "scale3d(1.1, 1.1, 1)",
    offset: HERO_FRAME_SHRINK_END_OFFSET,
    easing: "linear",
  },
  {
    transform: "scale3d(1.1, 1.1, 1)",
    offset: HERO_FRAME_RESTORE_START_OFFSET,
    easing: "linear",
  },
  {
    transform: "scale3d(1, 1, 1)",
    offset: 1,
  },
];

const HERO_FRAME_ANIMATION_OPTIONS: KeyframeAnimationOptions = {
  duration: HERO_FRAME_DURATION_MS,
  easing: "linear",
  fill: "both",
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const frameRefs = useRef(new Map<string, HTMLDivElement>());
  const contentRefs = useRef(new Map<string, HTMLDivElement>());
  const activeAnimationsRef = useRef<Animation[]>([]);
  const requestedPageId = activePageId ?? internalPageId;
  const requestedPageIndex = pages.findIndex(
    (page) => page.id === requestedPageId,
  );
  const currentPageIndex = requestedPageIndex >= 0 ? requestedPageIndex : 0;
  const currentPage = pages[currentPageIndex];
  const currentPageId = currentPage?.id ?? "";

  useEffect(() => {
    return () => {
      const animations = activeAnimationsRef.current;
      activeAnimationsRef.current = [];
      animations.forEach((animation) => animation.cancel());
    };
  }, []);

  const goTo = useCallback(
    (pageId: string) => {
      if (
        isTransitioning ||
        pageId === currentPageId ||
        !pages.some((page) => page.id === pageId)
      ) {
        return false;
      }

      const toPageIndex = pages.findIndex((page) => page.id === pageId);
      const track = trackRef.current;

      if (activePageId === undefined) {
        setInternalPageId(pageId);
      }
      onPageChange?.(pageId);

      if (!track) {
        return true;
      }

      setIsTransitioning(true);

      const animations: Animation[] = [
        track.animate(
          [
            {
              transform: `translate3d(-${currentPageIndex * 100}%, 0, 0)`,
            },
            {
              transform: `translate3d(-${toPageIndex * 100}%, 0, 0)`,
            },
          ],
          {
            duration: HERO_TRACK_DURATION_MS,
            delay: HERO_TRACK_DELAY_MS,
            easing: HERO_TRACK_EASING,
            fill: "both",
          },
        ),
      ];

      pages.forEach((page) => {
        const frame = frameRefs.current.get(page.id);
        const content = contentRefs.current.get(page.id);
        if (!frame || !content) return;

        animations.push(
          frame.animate(HERO_FRAME_KEYFRAMES, HERO_FRAME_ANIMATION_OPTIONS),
          content.animate(HERO_CONTENT_KEYFRAMES, HERO_FRAME_ANIMATION_OPTIONS),
        );
      });

      activeAnimationsRef.current = animations;

      void Promise.allSettled(
        animations.map((animation) => animation.finished),
      ).then(() => {
        if (activeAnimationsRef.current !== animations) return;

        activeAnimationsRef.current = [];
        animations.forEach((animation) => animation.cancel());
        setIsTransitioning(false);
      });

      return true;
    },
    [
      activePageId,
      currentPageId,
      currentPageIndex,
      isTransitioning,
      onPageChange,
      pages,
    ],
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

  useEffect(() => {
    const durationMs = currentPage?.durationMs;
    if (
      isTransitioning ||
      pages.length < 2 ||
      durationMs === undefined ||
      !Number.isFinite(durationMs) ||
      durationMs <= 0
    ) {
      return;
    }

    const timeoutId = window.setTimeout(next, durationMs);
    return () => window.clearTimeout(timeoutId);
  }, [
    currentPage?.durationMs,
    currentPageId,
    isTransitioning,
    next,
    pages.length,
  ]);

  const controls = useMemo<HeroDeckControls>(
    () => ({
      currentPageId,
      currentPageIndex,
      isTransitioning,
      pageCount: pages.length,
      goTo,
      next,
    }),
    [
      currentPageId,
      currentPageIndex,
      goTo,
      isTransitioning,
      next,
      pages.length,
    ],
  );

  if (!currentPage) {
    return null;
  }

  return (
    <HeroDeckContext.Provider value={controls}>
      <div className="relative size-full overflow-hidden">
        <div
          ref={trackRef}
          className="flex size-full transform-gpu will-change-transform"
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
                <div
                  ref={(element) => {
                    if (element) {
                      frameRefs.current.set(page.id, element);
                    } else {
                      frameRefs.current.delete(page.id);
                    }
                  }}
                  className="relative box-content size-full origin-center overflow-hidden border-0 border-transparent will-change-transform"
                >
                  <div
                    ref={(element) => {
                      if (element) {
                        contentRefs.current.set(page.id, element);
                      } else {
                        contentRefs.current.delete(page.id);
                      }
                    }}
                    className="relative size-full origin-center will-change-transform"
                  >
                    <Page />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {children}
    </HeroDeckContext.Provider>
  );
}
