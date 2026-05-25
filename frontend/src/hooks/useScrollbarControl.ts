/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

export function useScrollbarControl(enabled: boolean) {
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const { style } = document.body;
    const previousOverflow = style.overflow;
    const previousOverscroll = style.overscrollBehavior;
    const previousTouchAction = style.touchAction;
    const previousPaddingRight = style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    setScrollbarWidth(scrollbarWidth);

    style.overflow = "hidden";
    style.overscrollBehavior = "contain";
    style.touchAction = "none";
    if (scrollbarWidth > 0) {
      style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      style.overflow = previousOverflow;
      style.overscrollBehavior = previousOverscroll;
      style.touchAction = previousTouchAction;
      style.paddingRight = previousPaddingRight;
    };
  }, [enabled]);

  useEffect(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    setScrollbarWidth(scrollbarWidth);
  }, []);

  return { scrollbarWidth } as const;
}
