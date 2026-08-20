"use client";

import { useCallback, useSyncExternalStore } from "react";

export const TAILWIND_BREAKPOINTS = {
  sm: "40rem",
  md: "48rem",
  lg: "64rem",
  xl: "80rem",
  "2xl": "96rem",
} as const;

export type TailwindBreakpoint = keyof typeof TAILWIND_BREAKPOINTS;

const BREAKPOINT_ENTRIES = Object.entries(TAILWIND_BREAKPOINTS) as [
  TailwindBreakpoint,
  string,
][];

const BREAKPOINT_BITS: Record<TailwindBreakpoint, number> = {
  sm: 1 << 0,
  md: 1 << 1,
  lg: 1 << 2,
  xl: 1 << 3,
  "2xl": 1 << 4,
};

const getMediaQuery = (minWidth: string) => `(min-width: ${minWidth})`;

const getSnapshot = () => {
  if (typeof window === "undefined") {
    return 0;
  }

  return BREAKPOINT_ENTRIES.reduce((snapshot, [breakpoint, minWidth]) => {
    if (!window.matchMedia(getMediaQuery(minWidth)).matches) {
      return snapshot;
    }

    return snapshot | BREAKPOINT_BITS[breakpoint];
  }, 0);
};

const getServerSnapshot = () => 0;

const subscribe = (onStoreChange: () => void) => {
  const mediaQueries = BREAKPOINT_ENTRIES.map(([, minWidth]) =>
    window.matchMedia(getMediaQuery(minWidth)),
  );

  mediaQueries.forEach((mediaQuery) =>
    mediaQuery.addEventListener("change", onStoreChange),
  );

  return () => {
    mediaQueries.forEach((mediaQuery) =>
      mediaQuery.removeEventListener("change", onStoreChange),
    );
  };
};

export function useCustomMediaQuery() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const mq = useCallback(
    (breakpoint: TailwindBreakpoint) =>
      (snapshot & BREAKPOINT_BITS[breakpoint]) !== 0,
    [snapshot],
  );

  return { mq } as const;
}
